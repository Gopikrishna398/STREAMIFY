import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import useAuthUser from "./useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const useUnreadMessageCount = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const [unreadCount, setUnreadCount] = useState(0);

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

    const connect = async () => {
      client = new StreamChat(STREAM_API_KEY);

      const response = await client.connectUser(
        {
          id: authUserId,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      if (!isMounted) return;

      setUnreadCount(response?.me?.total_unread_count || 0);

      unsubscribe = client.on((event) => {
        if (typeof event.total_unread_count === "number") {
          setUnreadCount(event.total_unread_count);
        }
      });
    };

    connect().catch((error) => {
      console.debug("Unread message count unavailable:", error);
    });

    return () => {
      isMounted = false;
      unsubscribe?.unsubscribe?.();
      client?.disconnectUser();
    };
  }, [authUser, authUserId, tokenData]);

  return unreadCount;
};

export default useUnreadMessageCount;
