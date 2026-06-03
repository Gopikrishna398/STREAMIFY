import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { MessageSquareIcon, Plus } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import UserAvatar from "../components/UserAvatar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const getOtherMember = (channel, authUserId) => {
  const members = Object.values(channel.state.members || {});
  return members.find((member) => member.user?.id !== authUserId)?.user;
};

const formatLastMessageTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
};

const MessagesPage = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", authUserId],
    queryFn: getStreamToken,
    enabled: !!authUserId,
  });

  useEffect(() => {
    if (!STREAM_API_KEY || !authUserId || !tokenData?.token) return;
    if (tokenData.userId && tokenData.userId !== authUserId) return;

    let client;
    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoadError("");
        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUserId,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const recentChannels = await client.queryChannels(
          { type: "messaging", members: { $in: [authUserId] } },
          { last_message_at: -1 },
          { limit: 30, watch: true, state: true }
        );

        if (isMounted) setChannels(recentChannels);
      } catch (error) {
        console.error("Error loading messages:", error);
        if (isMounted) {
          setLoadError("Messages are unavailable right now. Please refresh or try again later.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
      // Do not disconnect client on page unmount to speed up transitions and keep notifications active.
    };
  }, [authUser, authUserId, tokenData]);

  if (isLoading) return <ChatLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="opacity-70 mt-1">Recent conversations and language partner chats</p>
        </div>

        {loadError ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-base-200 rounded-lg">
            <MessageSquareIcon className="size-12 text-base-content opacity-40 mb-4" />
            <h2 className="text-lg font-semibold">Messages could not load</h2>
            <p className="opacity-70 mt-1">{loadError}</p>
          </div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-base-200 rounded-lg">
            <MessageSquareIcon className="size-12 text-base-content opacity-40 mb-4" />
            <h2 className="text-lg font-semibold">No messages yet</h2>
            <p className="opacity-70 mt-1">Start a conversation from your friends list.</p>
            <Link to="/" className="btn btn-primary btn-sm mt-5">
              Find people
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200">
            {channels.map((channel) => {
              const otherUser = getOtherMember(channel, authUserId);
              const lastMessage = channel.state.messages.at(-1);
              const targetUserId = otherUser?.id;

              if (!targetUserId) return null;

              return (
                <Link
                  key={channel.cid}
                  to={`/chat/${targetUserId}`}
                  className="flex items-center gap-4 p-4 hover:bg-base-300 transition-colors"
                >
                  <UserAvatar
                    src={otherUser?.image}
                    name={otherUser?.name}
                    className="size-12 rounded-full"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold truncate">{otherUser?.name || "Conversation"}</h2>
                      <span className="text-xs opacity-60 shrink-0">
                        {formatLastMessageTime(lastMessage?.created_at || channel.data?.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm opacity-70 truncate">
                      {lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for New Chat */}
      <Link
        to="/new-chat"
        className="fixed bottom-8 right-8 btn btn-primary btn-circle shadow-xl z-40 hover:scale-110 active:scale-95 transition-all w-14 h-14"
        title="Start a new chat"
      >
        <Plus className="size-8 text-primary-content" />
      </Link>
    </div>
  );
};

export default MessagesPage;
