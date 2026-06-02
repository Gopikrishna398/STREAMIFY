import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCallRecord, getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", authUserId],
    queryFn: getStreamToken,
    enabled: !!authUserId,
  });

  const { mutateAsync: saveCallRecord } = useMutation({
    mutationFn: createCallRecord,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["callHistory"] }),
  });

  useEffect(() => {
    let client;
    let isMounted = true;

    const initChat = async () => {
      if (!tokenData?.token || !authUserId || !targetUserId) return;
      if (!STREAM_API_KEY) {
        toast.error("Missing Stream API key. Check FRONTEND/.env.");
        setLoading(false);
        return;
      }

      if (tokenData.userId && tokenData.userId !== authUserId) {
        toast.error("Chat token does not match the logged-in user. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing stream chat client...");

        client = new StreamChat(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUserId,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUserId, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUserId, targetUserId],
        });

        await currChannel.watch();

        if (isMounted) {
          setChatClient(client);
          setChannel(currChannel);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      client?.disconnectUser();
    };
  }, [tokenData, authUser, authUserId, targetUserId]);

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      await channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      await saveCallRecord({
        callId: channel.id,
        channelId: channel.id,
        participantId: targetUserId,
      });

      toast.success("Video call link sent successfully!");
      navigate(`/call/${channel.id}`);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
