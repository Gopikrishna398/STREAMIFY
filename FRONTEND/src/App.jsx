import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import CallPage from "./pages/CallPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import NewChatPage from "./pages/NewChatPage";
import CallsPage from "./pages/CallsPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/LayOut";

import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "./lib/api";
import PageLoader from "./components/PageLoader";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
    const { theme } = useThemeStore();

    //transtack query 
    const {data:authData, isLoading} = useQuery({ 
        
        queryKey: ["authUser"],
        queryFn: getAuthUser,
        retry: false,
    });

    const authUser = authData?.user
    const isOnboarded = authUser?.isOnboarded;

    if (isLoading) return <PageLoader />;

    const renderProtectedPage = (page, { showSidebar = true } = {}) => {
        if (!authUser) return <Navigate to="/login" replace />;
        if (!isOnboarded) return <Navigate to="/onboarding" replace />;

        return <Layout showSidebar={showSidebar}>{page}</Layout>;
    };


  return (
    <div className="min-h-screen" data-theme={theme}>
        <Routes>
            <Route
                path="/"
                element={renderProtectedPage(<HomePage />)}
            />

            <Route path="/friends" element={<Navigate to="/" replace />} />
            <Route path="/messages" element={renderProtectedPage(<MessagesPage />)} />
            <Route path="/new-chat" element={renderProtectedPage(<NewChatPage />)} />
            <Route path="/calls" element={renderProtectedPage(<CallsPage />)} />
            <Route path="/profile" element={renderProtectedPage(<ProfilePage />)} />

            <Route path="/call/:id" element={renderProtectedPage(<CallPage />, { showSidebar: false })} />

            <Route path="/login" element={!authUser ? <LoginPage/>  : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

            <Route path="/signin" element={<Navigate to="/signup" replace />} />
            <Route path="/signup" element={!authUser ? <SignupPage/> : <Navigate to={isOnboarded ? "/" : "/onboarding"} replace />} />

            <Route path="/onboard" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={authUser ? (isOnboarded ? <Navigate to="/" replace /> : <OnboardingPage/>) : <Navigate to="/login" replace />} />

            <Route path="/chat/:id" element={renderProtectedPage(<ChatPage />, { showSidebar: false })} />
            <Route path="/notifications" element={renderProtectedPage(<NotificationsPage />)} />
            <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
            
        </Routes>

    <Toaster/>
</div>
  )
}

export default App
