import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStreamToken, markCallsSeen } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const queryClient = useQueryClient();

  const { authUser, isLoading } = useAuthUser();
  const authUserId = authUser?._id?.toString();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", authUserId],
    queryFn: getStreamToken,
    enabled: !!authUserId,
  });

  const { mutate: markSeen } = useMutation({
    mutationFn: markCallsSeen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["missedCallCount"] }),
  });

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  useEffect(() => {
    let videoClient;
    let callInstance;
    let isMounted = true;

    const initCall = async () => {
      if (!tokenData?.token || !authUserId || !callId) return;
      if (!STREAM_API_KEY) {
        toast.error("Missing Stream API key. Check FRONTEND/.env.");
        setIsConnecting(false);
        return;
      }

      if (tokenData.userId && tokenData.userId !== authUserId) {
        toast.error("Call token does not match the logged-in user. Please log in again.");
        setIsConnecting(false);
        return;
      }

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUserId,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        if (isMounted) {
          setClient(videoClient);
          setCall(callInstance);
        }
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        if (isMounted) setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      isMounted = false;
      callInstance?.leave();
      videoClient?.disconnectUser();
    };
  }, [tokenData, authUser, authUserId, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
