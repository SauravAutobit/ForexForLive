// src/pages/NewOrder/NewOrder.tsx
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import OrderTypeDropdown from "../../components/orderTypeDropdown/OrderTypeDropdown";
import Counter from "../../components/counter/Counter";
import ChartComponent from "../../components/chartComponent/ChartComponent";
import PriceCounter from "../../components/priceCounter/PriceCounter";
import ContractSize from "../../components/contractSize/ContractSize";
import OrderButtons from "../../components/orderButtons/OrderButtons";
import OrderStatus from "../../components/orderStatus/OrderStatus"; // Import the new component

// A custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const NewOrder = () => {
  const [selectedOrderType, setSelectedOrderType] =
    useState("Select Order Type");
  const [contractSize, setContractSize] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [askColor, setAskColor] = useState("text-white");
  const [bidColor, setBidColor] = useState("text-white");

  // State for user input
  const [orderPrice, setOrderPrice] = useState<number | null>(null);
  const [stoploss, setStoploss] = useState<number>(0);
  const [target, setTarget] = useState<number>(0);
  const [selectedLot, setSelectedLot] = useState(0.01);

  const { data: instrumentData, selectedInstrumentId } = useSelector(
    (state: RootState) => state.instruments
  );
  const selectedQuote = useSelector((state: RootState) =>
    state.quotes.quotes.find((q) => q.id === selectedInstrumentId)
  );

  const prevAsk = usePrevious(selectedQuote?.ask);
  const prevBid = usePrevious(selectedQuote?.bid);

  useEffect(() => {
    if (!selectedInstrumentId) {
      setErrorMessage("No instrument selected. Please go back to Quotes.");
      return;
    }

    let foundInstrument = null;
    for (const category in instrumentData) {
      foundInstrument = instrumentData[category].find(
        (inst) => inst.id === selectedInstrumentId
      );
      if (foundInstrument) {
        break;
      }
    }

    if (foundInstrument) {
      const size = foundInstrument.static_data?.contract_size;
      if (size && typeof size === "number") {
        setContractSize(size);
        setErrorMessage(null);
      } else {
        setContractSize(null);
        setErrorMessage(
          "Contract size not found for this instrument. Cannot place an order."
        );
      }
    } else {
      setErrorMessage("Selected instrument details not found.");
    }
  }, [selectedInstrumentId, instrumentData]);

  useEffect(() => {
    if (selectedQuote) {
      if (prevAsk !== undefined && selectedQuote.ask !== 0) {
        if (selectedQuote.ask > prevAsk) {
          setAskColor("text-profit");
        } else if (selectedQuote.ask < prevAsk) {
          setAskColor("text-loss");
        }
      }
      if (prevBid !== undefined && selectedQuote.bid !== 0) {
        if (selectedQuote.bid > prevBid) {
          setBidColor("text-profit");
        } else if (selectedQuote.bid < prevBid) {
          setBidColor("text-loss");
        }
      }
    }
  }, [selectedQuote, prevAsk, prevBid]);

  const height = "calc(100vh - 350px)";

  const onContractSizeChange = (lot: number) => {
    setSelectedLot(lot);
  };

  return (
    <div className="p-4">
      <OrderStatus />
      {errorMessage ? (
        <div className="text-center text-red-500 font-bold my-4">
          {errorMessage}
        </div>
      ) : (
        <>
          <OrderTypeDropdown
            onSelect={setSelectedOrderType}
            currentSelection={selectedOrderType}
          />
          {contractSize !== null && (
            <ContractSize
              contractSize={contractSize}
              onLotChange={onContractSizeChange}
            />
          )}
          <div className="flex justify-center gap-7 mb-5">
            <p
              className={`text-xl font-secondary leading-5 transition-colors duration-200`}
            >
              <span className={bidColor}>
                {selectedQuote?.bid ? selectedQuote.bid.toFixed(2) : "..."}
              </span>
            </p>
            <p
              className={`text-xl font-secondary leading-5 transition-colors duration-200`}
            >
              <span className={askColor}>
                {selectedQuote?.ask ? selectedQuote.ask.toFixed(2) : "..."}
              </span>
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            {selectedOrderType !== "market" &&
              selectedOrderType !== "Select Order Type" && (
                <PriceCounter
                  onValueChange={setOrderPrice}
                  initialValue={orderPrice || 0}
                />
              )}
            <div className="flex justify-between items-center space-x-4">
              <Counter label="SL" onValueChange={setStoploss} />
              <Counter label="TL" onValueChange={setTarget} />
            </div>
          </div>
          {selectedInstrumentId && (
            <ChartComponent
              height={height}
              instrumentId={selectedInstrumentId}
            />
          )}
          <div className="text-center text-sm text-white/70 mt-4 mb-4">
            Attention! The trade will be executed at market conditions,
            difference with requested price may be significant!
          </div>
        </>
      )}
      {selectedInstrumentId && (
        <OrderButtons
          instrumentId={selectedInstrumentId}
          selectedOrderType={
            selectedOrderType as
              | "market"
              | "limit"
              | "stop"
              | "Select Order Type"
          }
          contractSize={contractSize}
          selectedLot={selectedLot}
          orderPrice={orderPrice}
          stoploss={stoploss}
          target={target}
        />
      )}
    </div>
  );
};

export default NewOrder;
