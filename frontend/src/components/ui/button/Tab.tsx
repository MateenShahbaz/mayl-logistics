// import { ReactNode } from "react";

interface TabButtonProps {
  label: string; // Tab label
  count?: number; // Count badge
  active?: boolean; // Active tab state
  onClick?: () => void;
  className?: string;
}

const Tab: React.FC<TabButtonProps> = ({
  label,
  count = 0,
  active = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition
        ${active
          ? "bg-brand-500 text-white border-brand-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }
        ${className}
      `}
    >
      <span>{label}</span>
      <span
        className={`
          rounded-full px-2 text-xs font-semibold
          ${active ? "bg-white text-brand-500" : "bg-gray-200 text-gray-700"}
        `}
      >
        {count}
      </span>
    </button>
  );
};

export default Tab;
