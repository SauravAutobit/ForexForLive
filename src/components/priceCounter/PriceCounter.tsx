import React, { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface PriceCounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  precision?: number;
}

const PriceCounter: React.FC<PriceCounterProps> = ({
  initialValue = 0, // Default to 0 as it's a positive integer
  onValueChange,
  min = 0,
  max = Infinity,
}) => {
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(String(initialValue));

  useEffect(() => {
    setValue(initialValue);
    setInputValue(String(initialValue));
  }, [initialValue]);

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, min);
    setValue(newValue);
    setInputValue(String(newValue));
    onValueChange?.(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, max);
    setValue(newValue);
    setInputValue(String(newValue));
    onValueChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Use a regular expression to keep only digits
    const sanitizedValue = rawValue.replace(/[^0-9]/g, "");
    setInputValue(sanitizedValue);

    if (sanitizedValue === "") {
      // If input is empty, reset value to min and notify parent
      setValue(min);
      onValueChange?.(min);
      return;
    }

    const parsedValue = parseInt(sanitizedValue, 10);

    if (!isNaN(parsedValue)) {
      const clampedValue = Math.min(Math.max(parsedValue, min), max);
      if (clampedValue !== value) {
        setValue(clampedValue);
        onValueChange?.(clampedValue);
      }
    }
  };

  const handleBlur = () => {
    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
      setInputValue(String(value));
    } else {
      setInputValue(String(parsedValue));
    }
  };

  return (
    <div className="flex items-center w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex items-center justify-center w-12 h-12 bg-secondaryBg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Minus className="w-5 h-5 text-white" />
      </button>

      <div className="flex-1 flex items-center justify-center px-4 py-3 text-center bg-primaryBg">
        <span className="text-gray-400 font-medium text-lg mr-2">Price:</span>
        <input
          type="text"
          inputMode="numeric" // Use inputMode for mobile-friendliness
          pattern="[0-9]*" // Use pattern for browser validation
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-1/3 text-center text-gray-400 font-medium text-lg bg-transparent outline-none appearance-none"
        />
      </div>

      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex items-center justify-center w-12 h-12 bg-secondaryBg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Plus className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default PriceCounter;
