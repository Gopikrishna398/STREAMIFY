import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareIcon, PhoneCallIcon, VideoIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getCallHistory, markCallsSeen } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import UserAvatar from "../components/UserAvatar";

const formatCallTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
};

const CallsPage = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id?.toString();
  const queryClient = useQueryClient();
  const {
    data: calls = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["callHistory"],
    queryFn: getCallHistory,
  });

  const { mutate: markSeen } = useMutation({
    mutationFn: markCallsSeen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["missedCallCount"] }),
  });

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  if (isLoading) return <ChatLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Call History</h1>
          <p className="opacity-70 mt-1">Recent video calls from your conversations</p>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-base-200 rounded-lg">
            <PhoneCallIcon className="size-12 text-base-content opacity-40 mb-4" />
            <h2 className="text-lg font-semibold">Call history could not load</h2>
            <p className="opacity-70 mt-1">Call history is unavailable right now. Please refresh or try again later.</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-base-200 rounded-lg">
            <PhoneCallIcon className="size-12 text-base-content opacity-40 mb-4" />
            <h2 className="text-lg font-semibold">No video calls yet</h2>
            <p className="opacity-70 mt-1">Start a video call from any conversation.</p>
            <Link to="/messages" className="btn btn-primary btn-sm mt-5">
              Open messages
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200">
            {calls.map((call) => (
              (() => {
                const otherUser = call.participants?.find((participant) => participant._id !== authUserId);

                return (
              <div
                key={call._id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatar
                    src={otherUser?.profilePic}
                    name={otherUser?.fullName}
                    className="size-12 rounded-full"
                  />

                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">
                      {otherUser?.fullName || "Video call"}
                    </h2>
                    <p className="text-sm opacity-70">
                      Started by {call.caller?.fullName || "Someone"} - {formatCallTime(call.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:justify-end">
                  <Link to={`/chat/${otherUser?._id}`} className="btn btn-outline btn-sm">
                    <MessageSquareIcon className="size-4" />
                    Chat
                  </Link>
                  <Link to={`/call/${call.callId}`} className="btn btn-success btn-sm text-white">
                    <VideoIcon className="size-4" />
                    Join
                  </Link>
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsPage;
