import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import PositionCard from "../../components/positionCard/PositionCard";
import ProfitBalance, {
  type ProfitBalanceProps,
} from "../../components/profitLossCard/ProfitLossCard";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

// const positionData: ProfitBalanceProps = {
//   showProfitLoss: true,
//   profitLoss: "₹ 90,000.00",
//   showBalances: true,
//   balanceItems: [
//     { label: "Balance", value: "₹ 1,30,000.75" },
//     { label: "Balance Available", value: "+₹ 90,000.44" },
//     { label: "Free Balance", value: "₹ 1,00,00.25" },
//     { label: "Total Value (Balance+P&F)", value: "₹ 3,20,000.25" },
//   ],
//   showBorder: true,
// };

const orderData: ProfitBalanceProps = {
  showProfitLoss: false,
  profitLoss: "",
  showBalances: true,
  balanceItems: [
    { label: "Filled", value: "3" },
    { label: "Canceled", value: "0" },
    { label: "Total", value: "3" },
  ],
  showBorder: false,
};

const dealData: ProfitBalanceProps = {
  showProfitLoss: true,
  profitLoss: "-21.74",
  showBalances: true,
  balanceItems: [
    { label: "Deposited", value: "0.00" },
    { label: "Swap", value: "0.00" },
    { label: "Commission", value: "0.00" },
    { label: "Balance", value: "-21.74" },
  ],
  showBorder: true,
};

const History = () => {
  const tabsData: TabItem[] = [
    {
      id: "position",
      label: "Position",
      content: (
        <>
          <ProfitBalance {...dealData} />
          <PositionCard label={"Position"} />
        </>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      content: (
        <>
          <ProfitBalance {...orderData} />
          <PositionCard label={"Orders"} />
        </>
      ),
    },
    {
      id: "deals",
      label: "Deals",
      content: (
        <>
          <ProfitBalance {...dealData} />
          <PositionCard label={"Deals"} />
        </>
      ),
    },
  ];
  return (
    <div className="p-4">
      <NavigationTabs
        tabs={tabsData}
        defaultActiveTab="position"
        onTabChange={(tabId) => console.log("Active tab:", tabId)}
        className="max-w-md mx-auto"
      />
    </div>
  );
};

export default History;
