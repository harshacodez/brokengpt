import { cn } from "@/lib/utils";

interface TabProps {
  value: string;
  label: string;
  isActive: boolean;
  onClick: (value: string) => void;
}

const Tab: React.FC<TabProps> = ({ value, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={cn(
      "px-4 py-2 rounded-t-md border-b-2 text-sm font-medium transition-colors",
      isActive
        ? "border-primary-500 text-primary-500"
        : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    )}
  >
    {label}
  </button>
);

interface TabsProps {
  tabs: { value: string; label: string }[];
  activeTab: string;
  onChange: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div className="border-b border-gray-200">
    <div className="flex">
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          isActive={activeTab === tab.value}
          onClick={onChange}
        />
      ))}
    </div>
  </div>
);
