import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  MessageSquareIcon,
  PhoneCallIcon,
  ShipWheelIcon,
  UsersIcon,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import IconBadge from "./IconBadge";
import useUnreadMessageCount from "../hooks/useUnreadMessageCount";
import { useQuery } from "@tanstack/react-query";
import { getMissedCallCount } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const unreadMessageCount = useUnreadMessageCount();
  
  const { data: missedCalls } = useQuery({
    queryKey: ["missedCallCount", authUser?._id],
    queryFn: getMissedCallCount,
    enabled: !!authUser?._id,
    refetchInterval: 30000,
  });

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/messages"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/messages" || currentPath.startsWith("/chat") ? "btn-active" : ""
          }`}
        >
          <IconBadge count={unreadMessageCount}>
            <MessageSquareIcon className="size-5 text-base-content opacity-70" />
          </IconBadge>
          <span>Messages</span>
        </Link>

        <Link
          to="/calls"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/calls" || currentPath.startsWith("/call") ? "btn-active" : ""
          }`}
        >
          <IconBadge count={missedCalls?.count || 0}>
            <PhoneCallIcon className="size-5 text-base-content opacity-70" />
          </IconBadge>
          <span>Call History</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <Link to="/profile" className="flex items-center gap-3 hover:bg-base-300 p-2 rounded-lg transition-colors cursor-pointer -mx-2">
          <UserAvatar src={authUser?.profilePic} name={authUser?.fullName} className="w-10 rounded-full" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;
