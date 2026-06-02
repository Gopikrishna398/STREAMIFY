import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const MessageNotifier = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", authUserId],
    queryFn: getStreamToken,
    enabled: !!authUserId,
  });

  useEffect(() => {
    if (!STREAM_API_KEY || !authUserId || !tokenData?.token) return;
    if (tokenData.userId && tokenData.userId !== authUserId) return;

    let client;
    let unsubscribe;
    let isMounted = true;

    const connectForNotifications = async () => {
      client = new StreamChat(STREAM_API_KEY);

      await client.connectUser(
        {
          id: authUserId,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      if (!isMounted) return;

      unsubscribe = client.on("message.new", (event) => {
        const senderId = event.user?.id;
        if (!senderId || senderId === authUserId) return;

        const currentChatId = location.pathname.match(/^\/chat\/([^/]+)/)?.[1];
        const currentChannelId =
          currentChatId && [authUserId, currentChatId].sort().join("-");

        if (currentChannelId && event.channel_id === currentChannelId) return;

        const senderName = event.user?.name || "Someone";
        const messageText = event.message?.text || "sent you a message";
        const channelMembers = Object.keys(event.channel?.state?.members || {});
        const otherMemberId = channelMembers.find((memberId) => memberId !== authUserId) || senderId;

        toast(
          (t) => (
            <button
              className="text-left"
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/chat/${otherMemberId}`);
              }}
            >
              <span className="block font-semibold">New message from {senderName}</span>
              <span className="block text-sm opacity-80 line-clamp-2">{messageText}</span>
            </button>
          ),
          { duration: 5000 }
        );
      });
    };

    connectForNotifications().catch((error) => {
      console.debug("Message notifier unavailable:", error);
    });

    return () => {
      isMounted = false;
      unsubscribe?.unsubscribe?.();
      client?.disconnectUser();
    };
  }, [authUser, authUserId, location.pathname, navigate, tokenData]);

  return null;
};

export default MessageNotifier;
