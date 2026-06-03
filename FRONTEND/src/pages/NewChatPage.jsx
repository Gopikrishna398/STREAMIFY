import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { getUserFriends } from "../lib/api";
import UserAvatar from "../components/UserAvatar";
import LanguageFlag from "../components/LanguageFlag";
import ChatLoader from "../components/ChatLoader";

const NewChatPage = () => {
  const navigate = useNavigate();

  const { data: friends, isLoading, error } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
  });

  if (isLoading) return <ChatLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/messages")}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Chat</h1>
            <p className="opacity-70 mt-1">Start a conversation with one of your friends</p>
          </div>
        </div>

        {error ? (
          <div className="text-center py-12 bg-base-200 rounded-lg border border-base-300">
            <p className="text-error font-medium">Failed to load friends list.</p>
            <p className="text-xs opacity-75 mt-1">Please try again later.</p>
          </div>
        ) : !friends || friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-base-200 rounded-lg border border-base-300 space-y-4">
            <MessageSquarePlus className="size-12 opacity-40 text-base-content" />
            <div>
              <h2 className="text-lg font-semibold">No friends available</h2>
              <p className="opacity-75 text-sm mt-1 max-w-sm">
                You can only start chats with users who have accepted your friend requests.
              </p>
            </div>
            <Link to="/" className="btn btn-primary btn-sm mt-2">
              Find Friends
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200">
            {friends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => navigate(`/chat/${friend._id}`)}
                className="flex items-center gap-4 p-4 hover:bg-base-300 transition-colors cursor-pointer"
              >
                <UserAvatar src={friend.profilePic} name={friend.fullName} className="size-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{friend.fullName}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs opacity-80 mt-0.5">
                    {friend.location && (
                      <span className="truncate">{friend.location}</span>
                    )}
                    {friend.location && (friend.nativeLanguage || friend.learningLanguage) && (
                      <span>•</span>
                    )}
                    {friend.nativeLanguage && (
                      <span className="flex items-center">
                        Native: <LanguageFlag language={friend.nativeLanguage} />
                        <span className="ml-0.5">{friend.nativeLanguage}</span>
                      </span>
                    )}
                    {friend.nativeLanguage && friend.learningLanguage && (
                      <span>•</span>
                    )}
                    {friend.learningLanguage && (
                      <span className="flex items-center">
                        Learning: <LanguageFlag language={friend.learningLanguage} />
                        <span className="ml-0.5">{friend.learningLanguage}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatPage;
