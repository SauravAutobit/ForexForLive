import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
};

const TradeOption = ({ isOpen }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute left-1/2 -translate-x-1/2 mt-2 top-full z-50"
          style={{
            willChange: "transform, opacity",
            transform: "translateZ(0)",
          }}
          layout={false}
        >
          <div className="bg-secondaryBg border border-primary backdrop-blur-[32px] p-2.5 w-[108px] rounded-10 shadow-md">
            <ul className="flex flex-col gap-[12px]">
              <li className="font-secondary cursor-pointer">Order</li>
              <li className="font-secondary cursor-pointer">Time</li>
              <li className="font-secondary cursor-pointer">Symbol</li>
              <li className="font-secondary cursor-pointer">Profitx</li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TradeOption;
