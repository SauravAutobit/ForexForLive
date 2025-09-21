import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface MobileTabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
}

const NavigationTabs = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  className = "",
  activeColor = "text-primary",
  inactiveColor = "text-secondary",
  backgroundColor = "",
}: MobileTabsProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id || ""
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const getActiveTabIndex = () => {
    return tabs.findIndex((tab) => tab.id === activeTab);
  };

  const activeTabIndex = getActiveTabIndex();

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className={`${backgroundColor} relative`}>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex-1 py-4 px-4 font-secondary transition-colors duration-200
                ${activeTab === tab.id ? activeColor : inactiveColor}
                hover:text-gray-200
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-white transition-transform duration-300 ease-in-out"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeTabIndex * 100}%)`,
          }}
        />
      </div>

      {/* Tab Content (Optional) */}
      {/* {tabs.some((tab) => tab.content) && (
        <div className="pt-4">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      )} */}

      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            tab.id === activeTab && (
              <motion.div
                key={tab.id} // 👈 key is required for exit animation
                initial={{ opacity: 0, y: 10 }} // starting state
                animate={{ opacity: 1, y: 0 }} // enter state
                exit={{ opacity: 0, y: -10 }} // exit state
                transition={{ duration: 0.25 }} // speed of animation
                className="pt-4"
              >
                {tab.content}
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationTabs;
