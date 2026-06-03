import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { getMissedCallCount, getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const MessageNotifier = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const location = useLocation();
  const navigate = useNavigate();

  // Store location pathname in a ref to prevent effect from reconnecting on route changes.
  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

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
      // Re-use connection singleton
      client = StreamChat.getInstance(STREAM_API_KEY);

      let response;
      if (client.userID !== authUserId) {
        if (client.userID) {
          await client.disconnectUser();
        }
        response = await client.connectUser(
          {
            id: authUserId,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
      } else {
        response = { me: client.me };
      }

      if (!isMounted) return;

      // Notify user about messages/calls missed while offline (only once per session)
      const sessionKey = `streamify_welcomed_${authUserId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        try {
          const callData = await getMissedCallCount();
          const missedCallsCount = callData?.count || 0;
          const unreadMessagesCount = response?.me?.total_unread_count || 0;

          if (unreadMessagesCount > 0 || missedCallsCount > 0) {
            toast(
              (t) => (
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-semibold text-primary">Welcome back!</span>
                  <span className="text-sm">
                    While you were away, you received:
                    {unreadMessagesCount > 0 && (
                      <span className="block font-medium mt-1">• {unreadMessagesCount} unread message(s)</span>
                    )}
                    {missedCallsCount > 0 && (
                      <span className="block font-medium">• {missedCallsCount} missed call(s)</span>
                    )}
                  </span>
                </div>
              ),
              {
                duration: 8000,
                icon: "🔔",
              }
            );
            sessionStorage.setItem(sessionKey, "true");
          }
        } catch (err) {
          console.error("Error fetching offline alerts:", err);
        }
      }

      unsubscribe = client.on("message.new", (event) => {
        const senderId = event.user?.id;
        if (!senderId || senderId === authUserId) return;

        const currentPath = pathRef.current;
        const currentChatId = currentPath.match(/^\/chat\/([^/]+)/)?.[1];
        const currentChannelId =
          currentChatId && [authUserId, currentChatId].sort().join("-");

        if (currentChannelId && event.channel_id === currentChannelId) return;

        const senderName = event.user?.name || "Someone";
        const messageText = event.message?.text || "sent you a message";
        const channelMembers = Object.keys(event.channel?.state?.members || {});
        const otherMemberId = channelMembers.find((memberId) => memberId !== authUserId) || senderId;

        // Show standard message popup notification
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
      // Keep background connection connected for notifications. Do not call client?.disconnectUser().
    };
  }, [authUser, authUserId, tokenData, navigate]);

  return null;
};

export default MessageNotifier;
