import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, LogOutIcon, MessageSquareIcon, PhoneCallIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { getMissedCallCount, getNotificationCount } from "../lib/api";
import IconBadge from "./IconBadge";
import useUnreadMessageCount from "../hooks/useUnreadMessageCount";

const Navbar = () => {
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const unreadMessageCount = useUnreadMessageCount();

  const { data: missedCalls } = useQuery({
    queryKey: ["missedCallCount"],
    queryFn: getMissedCallCount,
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: getNotificationCount,
    refetchInterval: 30000,
  });

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/profile" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/messages"}>
              <IconBadge count={unreadMessageCount}>
                <button className="btn btn-ghost btn-circle">
                  <MessageSquareIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </IconBadge>
            </Link>

            <Link to={"/calls"}>
              <IconBadge count={missedCalls?.count || 0}>
                <button className="btn btn-ghost btn-circle">
                  <PhoneCallIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </IconBadge>
            </Link>

            <Link to={"/notifications"}>
              <IconBadge count={notifications?.count || 0}>
                <button className="btn btn-ghost btn-circle">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </IconBadge>
            </Link>
          </div>

          {/* TODO */}
          <ThemeSelector />

          {/* Profile Picture Editor removed per request */}

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
