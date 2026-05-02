import { motion } from "framer-motion";

interface PresetButtonProps {
  label: string;
  filler: string;
  onPresetClick: (filler: string) => void;
  isNSFW: boolean;
}

export default function PresetButton({
  label,
  filler,
  isNSFW,
  onPresetClick,
}: PresetButtonProps) {
  const handleClick = () => {
    onPresetClick(filler);
  };

  return (
    <motion.button
      className={`text-sm rounded-md py-2 px-4 shadow-md ${
        isNSFW ? "bg-red-500 text-text" : "bg-white text-black"
      }`}
      onClick={handleClick}
      whileTap={{ scale: 0.98, rotate: 1, transition: { duration: 0.1 } }}
    >
      {label}
    </motion.button>
  );
}
