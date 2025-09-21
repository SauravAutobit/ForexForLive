import React, { useEffect, useRef, useState } from "react";

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomDrawer = ({ isOpen, onClose, children }: BottomDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const [translateY, setTranslateY] = useState(0);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    if (!isOpen) setTranslateY(0);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Touch events for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 100) {
      // Close drawer if swiped down enough
      onClose();
    }
    setTranslateY(0); // Reset
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed bottom-0 left-0 right-0 bg-secondaryBg backdrop-blur-md text-white rounded-t-[50px] rounded-b-[50px] shadow-xl z-50
          transform transition-transform duration-300 ease-in-out w-[96%] max-w-[370px] mx-auto mb-[10px]`}
        style={{
          // height: "44%",
          transform: `translateY(${isOpen ? translateY : 1000}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gray top bar inside drawer */}
        <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 z-50 w-28 h-1 bg-gray-600 rounded-full" />

        <div className="p-5 h-full overflow-y-auto relative">{children}</div>
      </div>
    </>
  );
};

export default BottomDrawer;
