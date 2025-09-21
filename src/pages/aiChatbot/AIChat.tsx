
import { Plus, Send } from "lucide-react";

const AIChat = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Content Area */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Example messages */}
        {/* <div className="mb-4">
          <div className="bg-gray-800 p-3 rounded-xl inline-block">
            Hello! 👋 How can I help you today?
          </div>
        </div>
        <div className="mb-4 text-right">
          <div className="bg-blue-600 p-3 rounded-xl inline-block">
            Show me my monthly profit
          </div>
        </div> */}
      </div>

     
    <div className="flex gap-2 overflow-x-auto pb-4">
      <button className="px-4 py-6 bg-gray-800 rounded-xl text-sm text-gray-200 whitespace-nowrap">
        Monthly Profit of my portfolio
      </button>
      <button className="px-4 py-6 bg-gray-800 rounded-xl text-sm text-gray-200 whitespace-nowrap">
        Performance of last week
      </button>
      <button className="px-4 py-6 bg-gray-800 rounded-xl text-sm text-gray-200 whitespace-nowrap">
        Best performing asset
      </button>
    </div>
  <div className="px-3 py-4 border-t border-gray-800 space-y-3">
  {/* Input Bar */}
  <div className="flex items-center gap-2">
    <button className="bg-gray-800 rounded-full p-3">
      <Plus className="w-5 h-5 text-gray-400" />
    </button>
    <input
      type="text"
      placeholder="Ask Anything"
      className="flex-1 bg-gray-800 px-3 py-3 text-sm text-gray-200 rounded-full outline-none placeholder-gray-500"
    />
    <button className="p-3 rounded-full bg-gray-800">
      <Send className="w-5 h-5 text-gray-400" />
    </button>
  </div>
</div>

    </div>
  );
};

export default AIChat;
