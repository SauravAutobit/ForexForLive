interface PositionCardProps {
  title?: string;
  label?: string;
}

const PositionCard = ({ title, label }: PositionCardProps) => {
  console.log(label);
  return (
    <>
      <div className="my-4">{title}</div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-secondaryBg border border-primary px-[10px] py-4 rounded-20 backdrop-blur-[32px]"
          >
            <div className="flex justify-between items-center mb-3">
              {label === "Position" || label === "Deals" ? (
                <div className="flex">
                  <div className="font-tertiary">EURUSD</div>
                  <div className="flex items-center gap-3">
                    {/* <span className="text-secondary">1.17282</span>
                  <span className="text-secondary">{">"}</span>
                  <span className="text-secondary">1.17427</span> */}
                    <span
                      className={`text-secondary pl-2 ${
                        label === "Position" ? "text-sm" : "text-base"
                      }`}
                    >
                      1.17282 {">"} 1.17427
                    </span>
                  </div>
                </div>
              ) : label === "Orders" ? (
                <>
                  <div className="font-tertiary">EURUSD</div>
                </>
              ) : (
                <>
                  <div className="font-tertiary">EURUSD</div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-secondary pl-2 ${
                        label === "Position" ? "text-sm" : "text-base"
                      }`}
                    >
                      1.17282 {">"} 1.17427
                    </span>
                  </div>
                </>
              )}
              {(label === "Position" ||
                label === "Orders" ||
                label === "Deals") && (
                <div className="text-sm">2025.09.15 | 09:05:47</div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary">{`Buy ${
                label === "Position" || label === "Orders"
                  ? "Qty:"
                  : label === "Deals"
                  ? "In"
                  : "at:"
              }`}</div>
              <div className="flex items-center gap-3">
                {label === "Orders" ? (
                  <span className="text-sm text-secondary">Status</span>
                ) : label === "Deals" ? (
                  ""
                ) : (
                  <span className="text-sm text-secondary">Profit & Loss</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>{`11.00 ${
                label === "Orders"
                  ? "at market"
                  : label === "Orders"
                  ? "at 1.36320"
                  : ""
              }`}</div>

              {label === "Orders" ? (
                <div>FILLED</div>
              ) : label === "Deals" ? (
                ""
              ) : (
                <div className="text-profit">759</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PositionCard;
