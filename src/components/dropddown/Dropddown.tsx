import { useState } from "react";
import dropdownArrow from "../../assets/icons/dropdownArrow.svg";
import plus from "../../assets/icons/plus.svg";
import type { Instrument } from "../../store/slices/instrumentsSlice";
import { useDispatch } from "react-redux";
import { addInstrumentToQuotes } from "../../store/slices/quotesSlice";
import { motion, AnimatePresence, easeInOut } from "framer-motion"; // Import the easeInOut function

interface DropdownProps {
  categoryName: string;
  instruments: Instrument[];
  addedCount: number;
  totalCount: number;
}

const Dropddown = ({
  categoryName,
  instruments,
  addedCount,
  totalCount,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handlePlusClick = (instrument: Instrument) => {
    dispatch(addInstrumentToQuotes(instrument));
  };

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
        ease: easeInOut, // <-- Use the imported function
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
    <>
      <button
        className="btn h-[44px] w-full bg-tertiaryBg border-none outline-none rounded-10 flex justify-between items-center px-4 mt-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          {categoryName}{" "}
          <span className="text-secondary ml-5 text-sm">
            {addedCount}/{totalCount}
          </span>
        </div>
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
            className="dropdown menu w-full rounded-box shadow-sm pt-0 pr-5 max-w-[370px] overflow-hidden"
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ position: "relative" }}
          >
            {instruments.length > 0 ? (
              instruments.map((instrument) => (
                <motion.li
                  className="border border-tertiary"
                  key={instrument.id}
                  variants={itemVariants}
                >
                  <a className="flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                      <div>{instrument.name.toUpperCase()}</div>
                      <p className="text-xs text-secondary">
                        {instrument.feeding_name}
                      </p>
                    </div>
                    <div
                      onClick={() => handlePlusClick(instrument)}
                      className="bg-profit w-6 h-6 rounded-40 flex items-center justify-center cursor-pointer"
                    >
                      <img src={plus} alt="plus" />
                    </div>
                  </a>
                </motion.li>
              ))
            ) : (
              <motion.li
                className="p-4 text-center text-gray-400"
                variants={itemVariants}
              >
                No instruments found.
              </motion.li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dropddown;
