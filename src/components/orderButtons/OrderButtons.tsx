
// import { useDispatch } from "react-redux";
import { placeNewOrder } from "../../store/slices/ordersSlice";
// // import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";
import { setOrderStatus } from "../../store/slices/orderStatusSlice";
import { useAppDispatch, useAppSelector } from "../../store/hook";
interface OrderButtonsProps {
  instrumentId: string | null;
  selectedOrderType: "market" | "limit" | "stop" | "Select Order Type";
  contractSize: number | null;
  selectedLot: number;
  orderPrice: number | null;
  stoploss: number;
  target: number;
}

const OrderButtons = ({
  instrumentId,
  selectedOrderType,
  contractSize,
  selectedLot,
  orderPrice,
  stoploss,
  target,
}: OrderButtonsProps) => {
  const dispatch = useAppDispatch();
  const { status: orderStatus } = useAppSelector((state) => state.orderStatus);

  const handlePlaceOrder = (side: "buy" | "sell") => {
    if (orderStatus === "loading") {
      return; 
    }

    if (!instrumentId || !contractSize) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Missing instrument or contract size.",
        })
      );
      return;
    }

    if (selectedOrderType === "Select Order Type") {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Please select an order type.",
        })
      );
      return;
    }

    if (selectedOrderType !== "market" && !orderPrice) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Price is required for limit/stop orders.",
        })
      );
      return;
    }

    const price = selectedOrderType === "market" ? 0 : orderPrice; 

    console.log("new ordwe butons", instrumentId);
    if (instrumentId) {
      dispatch(
        placeNewOrder({
          instrument_id: instrumentId,
          qty: selectedLot * contractSize,
          price: price || 0,
          order_type: selectedOrderType as "market" | "limit" | "stop",
          side,
          stoploss,
          target,
        })
      );
    }
  }; 

  const getButtonText = (side: "SELL" | "BUY") => {
    if (orderStatus === "loading") {
      return "Placing...";
    }
    if (selectedOrderType === "Select Order Type") {
      return `${side}`;
    }
    return `${side} BY ${selectedOrderType.toUpperCase()}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      {/* <div className="text-center text-sm text-white/70 mt-4 mb-4">
        Attention! The trade will be executed at market conditions, difference
        with requested price may be significant!
      </div> */}

      <div className="flex w-full space-x-4">
        <button
          onClick={() => handlePlaceOrder("sell")}
          disabled={
            orderStatus === "loading" ||
            selectedOrderType === "Select Order Type"
          }
          className="flex-1 py-3 px-6 rounded-md text-white bg-loss hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getButtonText("SELL")}
        </button>
        <button
          onClick={() => handlePlaceOrder("buy")}
          disabled={
            orderStatus === "loading" ||
            selectedOrderType === "Select Order Type"
          }
          className="flex-1 py-3 px-6 rounded-md text-white bg-profit hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getButtonText("BUY")}
        </button>
      </div>
    </div>
  );
};

export default OrderButtons;
