
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 h-full w-72 z-40 bg-gray-900 shadow-lg"
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Fintrabit</h2>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate("/ai");
            }}
            className="w-full text-left p-2 rounded hover:bg-gray-800"
          >
            Fintrabit AI
          </button>
        </div>
      </motion.aside>
    </>
  );
}
