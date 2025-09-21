import { useState } from "react";
import dropdownArrow from "../../assets/icons/dropdownArrow.svg";
import { motion, AnimatePresence, easeInOut } from "framer-motion";

// Define the static list of order types.
const ORDER_TYPES = ["Market", "Limit", "Stop"];

interface OrderTypeDropdownProps {
  // A prop to handle what happens when an item is selected.
  onSelect: (type: string) => void;
  // A prop to display the currently selected item.
  currentSelection: string;
}

export default function OrderTypeDropdown({
  onSelect,
  currentSelection,
}: OrderTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const listVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative">
      <button
        className="btn h-[44px] w-full bg-tertiaryBg border-none outline-none rounded-10 flex justify-between items-center px-4 text-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentSelection}</span>
        <motion.img
          src={dropdownArrow}
          alt="dropdownArrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="dropdown menu w-full rounded-box shadow-sm pt-0 pr-5 max-w-[370px] overflow-hidden bg-secondaryBg"
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ position: "relative" }}
          >
            {ORDER_TYPES.map((type) => (
              <motion.li key={type} variants={itemVariants}>
                <button
                  onClick={() => {
                    onSelect(type.toLowerCase());
                    setIsOpen(false);
                  }}
                  className="w-full text-gray-200 hover:text-white py-2.5 flex justify-center"
                >
                  {type}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
