import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  delay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onChange,
  delay = 300,
}) => {
  const [value, setValue] = React.useState("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce logic
  React.useEffect(() => {
    if (!onChange) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onChange(value);
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, delay, onChange]);

  return (
    <div className="relative w-full">
      {/* Search Icon inside input */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-[44px] bg-secondaryBg text-gray-200 rounded-10 pl-10 pr-4 py-2 outline-none placeholder-secondary border border-tertiary focus:border-gray-600"
      />
    </div>
  );
};

export default SearchBar;
