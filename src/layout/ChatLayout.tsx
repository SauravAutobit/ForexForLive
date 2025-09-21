
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ChatLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen ">
      {/* Custom Header */}
      <header className="flex items-center gap-2 p-2 border-b border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded hover:bg-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Fintrabit AI</h1>
      </header>

      {/* Chat Content (takes full remaining height) */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
