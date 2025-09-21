import React, { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  label?: string; // Optional label to be used as a placeholder
}

const Counter: React.FC<CounterProps> = ({
  initialValue = 0,
  onValueChange,
  min = 0,
  max = Infinity,
  label, // Use the label prop
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
    setInputValue(rawValue);

    const parsedValue = parseInt(rawValue, 10);
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
    }
  };

  return (
    <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Minus Button */}
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex items-center justify-center w-12 h-12 bg-secondaryBg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Minus className="w-5 h-5 text-white" />
      </button>

      {/* Center Input Field */}
      <div className="flex-1 px-2 py-3 bg-primaryBg">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-full text-center text-gray-400 font-medium text-lg select-none bg-transparent outline-none appearance-none placeholder-gray-400"
          style={{ MozAppearance: "textfield" }} // Hide spinner on Firefox
          placeholder={label} // Use the label as a placeholder
        />
      </div>

      {/* Plus Button */}
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

// Example usage
export default Counter;
