import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCallRecord, getStreamToken, getUserById } from "../lib/api";
import { useThemeStore } from "../store/useThemeStore";

import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  useChannelStateContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import UserAvatar from "../components/UserAvatar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Custom Channel Header component
const CustomChannelHeader = ({ onAvatarClick, onBackClick, handleVideoCall }) => {
  const { channel } = useChannelStateContext();
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();

  // Find the other member
  const members = Object.values(channel.state.members);
  const otherMember = members.find((m) => m.user.id !== authUserId)?.user;

  if (!otherMember) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 h-16">
      <div className="flex items-center gap-3">
        {/* Back arrow */}
        <button onClick={onBackClick} className="btn btn-ghost btn-circle btn-sm" aria-label="Go back">
          <ArrowLeftIcon className="size-5 text-primary stroke-[3]" />
        </button>

        {/* User avatar & Name (clickable) */}
        <div
          onClick={onAvatarClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <UserAvatar src={otherMember.image} name={otherMember.name} className="size-10 rounded-full" />
          <div>
            <h2 className="font-semibold text-sm sm:text-base">{otherMember.name}</h2>
            <p className="text-xs opacity-70">
              {otherMember.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Start video call button on the right */}
      <CallButton handleVideoCall={handleVideoCall} absolute={false} />
    </div>
  );
};

// Non-editable User Detail Modal
const UserDetailModal = ({ isOpen, onClose, user, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box relative bg-base-200 max-w-md border border-base-300">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <p className="text-xs mt-2 opacity-70">Loading user details...</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <UserAvatar
                src={user.profilePic}
                name={user.fullName}
                className="size-24 rounded-full border-4 border-base-100 shadow-md animate-fade-in"
              />
              <h3 className="font-bold text-xl mt-3">{user.fullName}</h3>
              <p className="text-xs text-success flex items-center gap-1.5 mt-1 font-medium">
                <span className="size-2 rounded-full bg-success inline-block shadow-sm shadow-success/50" />
                Active User
              </p>
            </div>

            <div className="divider my-0"></div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-base-content/60">Gender</span>
                <span className="text-sm font-medium capitalize">{user.gender || "Not specified"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-base-content/60">Native Language</span>
                <span className="text-sm font-medium capitalize">{user.nativeLanguage || "Not specified"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-base-content/60">Learning Language</span>
                <span className="text-sm font-medium capitalize">{user.learningLanguage || "Not specified"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-base-content/60">Location</span>
                <span className="text-sm font-medium">{user.location || "Not specified"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-base-content/60">Bio</span>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1 text-base-content/85">
                  {user.bio || "No bio provided."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-error">Failed to load user details</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const { theme } = useThemeStore();

  const isDark = ["dark", "forest", "synthwave", "halloween", "black", "luxury", "dracula", "business", "night", "coffee", "dim", "sunset"].includes(theme);

  // Fetch target user's details for the modal
  const { data: targetUser, isLoading: loadingTargetUser } = useQuery({
    queryKey: ["userProfile", targetUserId],
    queryFn: () => getUserById(targetUserId),
    enabled: !!targetUserId && isModalOpen,
  });

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

        client = StreamChat.getInstance(STREAM_API_KEY);

        // Do not call connectUser if we've already unmounted
        if (!isMounted) return;

        await client.connectUser(
          {
            id: authUserId,
            name: authUser.fullName || "User",
            image: authUser.profilePic,
          },
          tokenData.token
        );

        if (!isMounted) return;

        const channelId = [authUserId, targetUserId].sort().join("-");

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
        if (isMounted) {
          toast.error("Could not connect to chat. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      // Do not disconnect globally, as it terminates the background connection and slows loading times.
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
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-base-100">
      <Chat client={chatClient} theme={isDark ? "str-chat__theme-dark" : "str-chat__theme-light"}>
        <Channel channel={channel}>
          <div className="w-full relative h-full flex flex-col">
            <Window>
              <CustomChannelHeader
                onAvatarClick={() => setIsModalOpen(true)}
                onBackClick={() => navigate("/messages")}
                handleVideoCall={handleVideoCall}
              />
              <MessageList />
              <MessageComposer focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={targetUser}
        isLoading={loadingTargetUser}
      />
    </div>
  );
};

export default ChatPage;
