// components/EURUSDCard.tsx
import React, { useEffect, useRef, useState } from "react";
import Card from "../../components/common/card/Card";
// import type { QuoteData } from "../../store/slices/quotesSlice"; // Import the correct type
// Import the correct type
// ✅ A custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Interface for the EURUSDCard's props, based on the QuoteData structure
// ✅ CHANGED: Props are now clear and match the data
interface QuoteCardProps {
  code: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  ltp: number; // ✅ Now used for calculation
  close: number; // ✅ FIX: Added 'close' for the calculation
  pip?: number | string;
  timestamp: string; // ✅ FIX: Moved to its own line
  onClick: () => void;
}

// ✅ NEW: Rewritten helper to format price based on pip value
interface FormattedPrice {
  isPipFormatted: boolean;
  main: string;
  pipsOrSmall: string; // This will hold 'pips' for pip-style or 'small' for original-style
  small: string;
}

const formatPrice = (price: number, pip?: number | string): FormattedPrice => {
  if (price === 0)
    return { isPipFormatted: false, main: "0.00", pipsOrSmall: "", small: "" };

  const pipValue = typeof pip === "string" ? parseFloat(pip) : pip;

  // Pip-specific logic: Only apply if pipValue is a valid number less than 0.1
  if (pipValue && !isNaN(pipValue) && pipValue < 0.1) {
    const priceStr = price.toString();
    const parts = priceStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    const pipDecimalPlaces = Math.round(Math.log10(1 / pipValue));

    // Check if there are enough decimal places to apply pip formatting
    if (decimalPart.length >= pipDecimalPlaces) {
      return {
        isPipFormatted: true,
        main: `${integerPart}.`,
        pipsOrSmall: decimalPart.slice(0, pipDecimalPlaces),
        small: decimalPart.slice(pipDecimalPlaces),
      };
    }
  }

  // Fallback to original logic if pip formatting is not applicable
  const priceStr = price.toFixed(4); // Use toFixed(4) as a standard fallback
  const parts = priceStr.split(".");
  return {
    isPipFormatted: false,
    main: `${parts[0]}.${parts[1].slice(0, 2)}`,
    pipsOrSmall: parts[1].slice(2),
    small: "",
  };
};

const QuoteCard: React.FC<QuoteCardProps> = ({
  code,
  bid,
  ask,
  high,
  low,
  ltp,
  close,
  pip,
  timestamp,
  onClick,
}) => {
  const askPrice = formatPrice(ask, pip);
  const bidPrice = formatPrice(bid, pip);
  // console.log(lowValue, hightValue, close);

  // ✅ State to hold the dynamic color classes
  const [askColor, setAskColor] = useState("text-white"); // Start neutral
  const [bidColor, setBidColor] = useState("text-white"); // Start neutral

  // ✅ Get the previous values
  const prevAsk = usePrevious(ask);
  const prevBid = usePrevious(bid);

  // ✅ useEffect to compare current and previous prices and set color
  useEffect(() => {
    // Check for Ask price change
    if (prevAsk !== undefined && ask !== 0) {
      if (ask > prevAsk) {
        setAskColor("text-profit"); // Price went up (green)
      } else if (ask < prevAsk) {
        setAskColor("text-loss"); // Price went down (red)
      }
      // If ask === prevAsk, the color remains unchanged
    }
  }, [ask, prevAsk]);

  useEffect(() => {
    // Check for Bid price change
    if (prevBid !== undefined && bid !== 0) {
      if (bid > prevBid) {
        setBidColor("text-profit"); // Price went up (green)
      } else if (bid < prevBid) {
        setBidColor("text-loss"); // Price went down (red)
      }
      // If bid === prevBid, the color remains unchanged
    }
  }, [bid, prevBid]);

  console.log("ltp close", ltp, close);

  // ✅ NEW: Calculate change and percentage
  const change = ltp - close;
  const percentageChange = close !== 0 ? (change / close) * 100 : 0;
  const changeColor = change >= 0 ? "text-profit" : "text-loss";
  const changeSign = change >= 0 ? "+" : "";
  console.log("change", change, percentageChange, changeColor, changeSign);
  return (
    <Card
      className="bg-secondaryBg text-white rounded-10 w-full p-[10px] shadow-lg"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        {/* Left Side: Title and Change */}
        <div>
          <h2 className="text-lg font-secondary mb-1">{code.toUpperCase()}</h2>

          <p className={`text-sm font-secondary ${changeColor}`}>
            {changeSign}
            {change.toFixed(2)} <span>({percentageChange.toFixed(3)}%)</span>
          </p>

          <div className="flex justify-between items-center text-secondary text-xs mt-2.5">
            <span>{timestamp}</span>
          </div>
        </div>

        {/* Middle + Right Side */}
        <div className="flex items-center">
          {/* Middle: Ask Price (Red) */}
          <div className="text-right pr-2">
            {askPrice.isPipFormatted ? (
              <p
                className={`${askColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
              >
                <span className="text-xl">{askPrice.main}</span>
                <span className="text-3xl">{askPrice.pipsOrSmall}</span>
                <span className="text-sm">{askPrice.small}</span>
              </p>
            ) : (
              <p
                className={`${askColor} text-xl font-secondary leading-5 transition-colors duration-200`}
              >
                <span>{askPrice.main}</span>
                <span className="text-sm">{askPrice.pipsOrSmall}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="font-tertiary text-base pr-2.5">H</span>
              {high.toFixed(2)}
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-10 bg-gray-600 mx-2"></div>

          {/* Right: Bid Price (Green) */}
          <div className="text-right pl-2">
            {bidPrice.isPipFormatted ? (
              <p
                className={`${bidColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
              >
                <span className="text-xl">{bidPrice.main}</span>
                <span className="text-3xl">{bidPrice.pipsOrSmall}</span>
                <span className="text-sm">{bidPrice.small}</span>
              </p>
            ) : (
              <p
                className={`${bidColor} text-xl font-secondary leading-5 transition-colors duration-200`}
              >
                <span>{bidPrice.main}</span>
                <span className="text-sm">{bidPrice.pipsOrSmall}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="font-tertiary text-base pr-2.5">L</span>
              {low.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuoteCard;
// // components/EURUSDCard.tsx
// import React, { useEffect, useRef, useState } from "react";
// import Card from "../../components/common/card/Card";
// // import type { QuoteData } from "../../store/slices/quotesSlice"; // Import the correct type
// // Import the correct type
// // ✅ A custom hook to get the previous value of a prop or state
// function usePrevious<T>(value: T): T | undefined {
//   const ref = useRef<T | undefined>(undefined);
//   useEffect(() => {
//     ref.current = value;
//   }, [value]);
//   return ref.current;
// }

// // Interface for the EURUSDCard's props, based on the QuoteData structure
// // ✅ CHANGED: Props are now clear and match the data
// interface QuoteCardProps {
//   code: string;
//   bid: number;
//   ask: number;
//   high: number;
//   low: number;
//   ltp: number; // ✅ Now used for calculation
//   close: number; // ✅ FIX: Added 'close' for the calculation
//   pip?: number | string;
//   timestamp: string; // ✅ FIX: Moved to its own line
//   onClick: () => void;
// }

// // ✅ NEW: Rewritten helper to format price based on pip value
// interface FormattedPrice {
//   isPipFormatted: boolean;
//   main: string;
//   pipsOrSmall: string; // This will hold 'pips' for pip-style or 'small' for original-style
//   small: string;
// }

// const formatPrice = (price: number, pip?: number | string): FormattedPrice => {
//   if (price === 0)
//     return { isPipFormatted: false, main: "0.00", pipsOrSmall: "", small: "" };
//   const pipValue = typeof pip === "string" ? parseFloat(pip) : pip;

//   // Pip-specific logic
//   if (pipValue && !isNaN(pipValue) && pipValue < 0.1) {
//     const pipDecimalPlaces = Math.round(Math.log10(1 / pipValue));
//     const priceStr = price.toFixed(8);
//     const parts = priceStr.split(".");
//     const integerPart = parts[0];
//     const decimalPart = parts[1] || "";
//     return {
//       isPipFormatted: true,
//       main: `${integerPart}.`,
//       pipsOrSmall: decimalPart.slice(0, pipDecimalPlaces),
//       small: decimalPart.slice(pipDecimalPlaces),
//     };
//   }

//   // Fallback to original logic
//   const priceStr = price.toFixed(4);
//   const parts = priceStr.split(".");
//   return {
//     isPipFormatted: false,
//     main: `${parts[0]}.${parts[1].slice(0, 2)}`,
//     pipsOrSmall: parts[1].slice(2),
//     small: "",
//   };
// };

// const QuoteCard: React.FC<QuoteCardProps> = ({
//   code,
//   bid,
//   ask,
//   high,
//   low,
//   ltp,
//   close,
//   pip,
//   timestamp,
//   onClick,
// }) => {
//   const askPrice = formatPrice(ask, pip);
//   const bidPrice = formatPrice(bid, pip);
//   // console.log(lowValue, hightValue, close);

//   // ✅ State to hold the dynamic color classes
//   const [askColor, setAskColor] = useState("text-white"); // Start neutral
//   const [bidColor, setBidColor] = useState("text-white"); // Start neutral

//   // ✅ Get the previous values
//   const prevAsk = usePrevious(ask);
//   const prevBid = usePrevious(bid);

//   // ✅ useEffect to compare current and previous prices and set color
//   useEffect(() => {
//     // Check for Ask price change
//     if (prevAsk !== undefined && ask !== 0) {
//       if (ask > prevAsk) {
//         setAskColor("text-profit"); // Price went up (green)
//       } else if (ask < prevAsk) {
//         setAskColor("text-loss"); // Price went down (red)
//       }
//       // If ask === prevAsk, the color remains unchanged
//     }
//   }, [ask, prevAsk]);

//   useEffect(() => {
//     // Check for Bid price change
//     if (prevBid !== undefined && bid !== 0) {
//       if (bid > prevBid) {
//         setBidColor("text-profit"); // Price went up (green)
//       } else if (bid < prevBid) {
//         setBidColor("text-loss"); // Price went down (red)
//       }
//       // If bid === prevBid, the color remains unchanged
//     }
//   }, [bid, prevBid]);

//   console.log("ltp close", ltp, close);

//   // ✅ NEW: Calculate change and percentage
//   const change = ltp - close;
//   const percentageChange = close !== 0 ? (change / close) * 100 : 0;
//   const changeColor = change >= 0 ? "text-profit" : "text-loss";
//   const changeSign = change >= 0 ? "+" : "";
//   console.log("change", change, percentageChange, changeColor, changeSign);
//   return (
//     <Card
//       className="bg-secondaryBg text-white rounded-10  w-full p-[10px] shadow-lg"
//       onClick={onClick}
//     >
//       <div className="flex justify-between items-center">
//         {/* Left Side: Title and Change */}
//         <div>
//           <h2 className="text-lg font-secondary mb-1">{code.toUpperCase()}</h2>
//           {/* <p className="text-sm font-secondary">
//             +115 <span className="text-profit">(0.060%)</span>
//           </p> */}

//           <p className={`text-sm font-secondary ${changeColor}`}>
//             {changeSign}
//             {change.toFixed(2)} <span>({percentageChange.toFixed(3)}%)</span>
//           </p>

//           <div className="flex justify-between items-center text-secondary text-xs mt-2.5">
//             <span>{timestamp}</span>
//           </div>
//         </div>

//         {/* Middle + Right Side */}
//         <div className="flex items-center">
//           {/* Middle: Ask Price (Red) */}
//           <div className="text-right pr-2">
//             {/* --- the old one --- */}
//             {/* <p
//               className={`${askColor} text-xl font-secondary leading-5 transition-colors duration-200`}
//             >
//               <span>{askPrice.main}</span>
//               <span className="text-sm">{askPrice.small}</span>
//             </p>
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">H</span>
//               {high.toFixed(2)}
//             </p> */}

//             {/* <p
//               className={`${askColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
//             >
//               <span className="text-xl">{askPrice.main}</span>
//               <span className="text-3xl">{askPrice.pips}</span>
//               <span className="text-sm">{askPrice.small}</span>
//             </p>
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">H</span>
//               {high.toFixed(2)}
//             </p> */}

//             {askPrice.isPipFormatted ? (
//               <p
//                 className={`${askColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
//               >
//                 <span className="text-xl">{askPrice.main}</span>
//                 <span className="text-3xl">{askPrice.pipsOrSmall}</span>
//                 <span className="text-sm">{askPrice.small}</span>
//               </p>
//             ) : (
//               <p
//                 className={`${askColor} text-xl font-secondary leading-5 transition-colors duration-200`}
//               >
//                 <span>{askPrice.main}</span>
//                 <span className="text-sm">{askPrice.pipsOrSmall}</span>
//               </p>
//             )}
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">H</span>
//               {high.toFixed(2)}
//             </p>
//           </div>

//           {/* Vertical Divider */}
//           <div className="w-px h-10 bg-gray-600 mx-2"></div>

//           {/* Right: Bid Price (Green) */}
//           <div className="text-right pl-2">
//             {/* --- The old one --- */}
//             {/* <p
//               className={`${bidColor} text-xl font-secondary leading-5 transition-colors duration-200`}
//             >
//               <span>{bidPrice.main}</span>
//               <span className="text-sm">{bidPrice.small}</span>
//             </p>
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">L</span>
//               {low.toFixed(2)}
//             </p> */}

//             {/* <p
//               className={`${bidColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
//             >
//               <span className="text-xl">{bidPrice.main}</span>
//               <span className="text-3xl">{bidPrice.pips}</span>
//               <span className="text-sm">{bidPrice.small}</span>
//             </p>
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">L</span>
//               {low.toFixed(2)}
//             </p> */}

//             {bidPrice.isPipFormatted ? (
//               <p
//                 className={`${bidColor} font-secondary leading-5 transition-colors duration-200 flex items-baseline`}
//               >
//                 <span className="text-xl">{bidPrice.main}</span>
//                 <span className="text-3xl">{bidPrice.pipsOrSmall}</span>
//                 <span className="text-sm">{bidPrice.small}</span>
//               </p>
//             ) : (
//               <p
//                 className={`${bidColor} text-xl font-secondary leading-5 transition-colors duration-200`}
//               >
//                 <span>{bidPrice.main}</span>
//                 <span className="text-sm">{bidPrice.pipsOrSmall}</span>
//               </p>
//             )}
//             <p className="text-sm">
//               <span className="font-tertiary text-base pr-2.5">L</span>
//               {low.toFixed(2)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Footer Row with Timestamp, Icon, and Code */}
//     </Card>
//   );
// };

// export default QuoteCard;
