import "./ProfitLossCard.css";

interface BalanceDetail {
  label: string;
  value: string;
}

export interface ProfitBalanceProps {
  profitLoss?: string; // optional → some components may not need it
  balanceItems?: BalanceDetail[]; // optional → some components may not need it
  showProfitLoss?: boolean; // control visibility
  showBalances?: boolean; // control visibility
  showBorder?: boolean; // control border dynamically
}

const ProfitBalance = ({
  profitLoss,
  balanceItems = [],
  showProfitLoss = true,
  showBalances = true,
  showBorder = true,
}: ProfitBalanceProps) => {
  const profitLossClass =
    profitLoss && parseFloat(profitLoss) < 0 ? "text-loss" : "text-profit";

  return (
    <>
      <div
        className="flex flex-col items-center gap-[10px] px-[10px] py-[14px]
    rounded-20 border border-primary bg-profit-balance backdrop-blur-[32px]"
      >
        {showProfitLoss && profitLoss && (
          <>
            <p className="text-secondary">Profit & Loss</p>
            <h1 className={`font-secondary text-xxl ${profitLossClass}`}>
              {profitLoss}
            </h1>
          </>
        )}

        <div
          className={`w-full flex flex-col gap-[10px] ${
            showBorder ? "border-t border-secondary" : ""
          }`}
        >
          {showBalances &&
            balanceItems.map((balance, index) => (
              <div
                className={`flex justify-between ${index === 0 ? "mt-4" : ""}`}
                key={index}
              >
                <span>{balance.label}</span>
                <span className="font-secondary">{balance.value}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default ProfitBalance;
