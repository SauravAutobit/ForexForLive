import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { XCircle, Loader, Check } from "lucide-react";
import { resetOrderStatus } from "../../store/slices/orderStatusSlice";
import type { RootState } from "../../store/store";

import success from "../../assets/sounds/success.mp3";
import failure from "../../assets/sounds/failure.mp3";

const successSound = new Audio(success);
const failureSound = new Audio(failure);

const OrderStatus: React.FC = () => {
  const { status, message } = useSelector(
    (state: RootState) => state.orderStatus
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      const timer = setTimeout(() => {
        dispatch(resetOrderStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  if (status === "idle") {
    return null;
  }

  if (status === "succeeded") {
    successSound.play();
  } else if (status === "failed") {
    failureSound.play();
  }

  return (
    <div
      // Full-screen, opaque overlay
      className="fixed inset-0 flex flex-col items-center justify-center bg-primaryBg z-[60] text-white transition-opacity duration-300"
    >
      {/* Inner container for icon and text */}
      <div className="flex flex-col items-center space-y-4">
        {/* Status-based icon */}
        {status === "loading" && (
          <Loader className="h-24 w-24 animate-spin text-white" />
        )}
        {status === "succeeded" && (
          <div className="bg-profit w-[139px] h-[139px] rounded-[80px] flex justify-center items-center">
            {<Check className="h-24 w-24" />}
          </div>
        )}
        {status === "failed" && <XCircle className="h-24 w-24 text-red-500" />}

        {/* Status text */}
        <div className="text-center mt-6">
          <p className="text-3xl font-bold">
            {status === "succeeded" && "Done"}
            {status === "failed" && "Failed"}
            {status === "loading" && "Placing Order..."}
          </p>
          {message && (
            <p className="text-xl text-white/90 mt-2 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
