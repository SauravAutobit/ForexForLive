import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChatLayout from "../layout/ChatLayout";
import Quotes from "../pages/quotes/Quotes";
import Charts from "../pages/charts/Charts";
import Trade from "../pages/trades/Trades";
import History from "../pages/history/History";
import Profile from "../pages/profile/Profile";
import AIChat from "../pages/aiChatbot/AIChat";
import NewOrder from "../pages/newOrder/NewOrder";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main routes with sidebar + bottom navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Quotes />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/new-order" element={<NewOrder />} />
      </Route>

      {/* AI Chat (custom header, no navbar) */}
      <Route element={<ChatLayout />}>
        <Route path="/ai" element={<AIChat />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
