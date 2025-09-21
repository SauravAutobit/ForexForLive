import "./Trades.css";
import ProfitBalance, {
  type ProfitBalanceProps,
} from "../../components/profitLossCard/ProfitLossCard";
import PositionCard from "../../components/positionCard/PositionCard";
// import { AnimatePresence, motion } from "framer-motion";

const positionData: ProfitBalanceProps = {
  showProfitLoss: true,
  profitLoss: "₹ 90,000.00",
  showBalances: true,
  balanceItems: [
    { label: "Used Balance", value: "₹ 1,30,000.75" },
    { label: "Balance Available", value: "+₹ 90,000.44" },
    { label: "Free Balance", value: "₹ 1,00,00.25" },
    { label: "Total Value (Balance+P&F)", value: "₹ 3,20,000.25" },
  ],
  showBorder: true,
};

const Trade = () => {
  return (
    <>
      {/* <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }} // starting state
          animate={{ opacity: 1, y: 0 }} // enter state
          exit={{ opacity: 0, y: -10 }} // exit state
          transition={{ duration: 0.25 }} // speed of animation
          className="pt-4"
        >
          <div className="p-4">
            <ProfitBalance {...positionData} />
            <PositionCard title={"Position"} />
          </div>{" "}
        </motion.div>
      </AnimatePresence> */}

      <div className="p-4">
        <ProfitBalance {...positionData} />
        <PositionCard title={"Position"} />
      </div>
    </>
  );
};

export default Trade;
