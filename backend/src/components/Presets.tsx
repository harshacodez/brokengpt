import BotCard from "./BotCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assumes you have a ScrollArea component
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "@/assets/Loader";

// Define interface for Preset
interface Preset {
  excerpt: string;
  id: string;
  name: string;
  imagelink: string;
  isNsfw: boolean;
  count: number;
}

export default function Presets() {
  const [isLoading, setisLoading] = useState(true);
  const [presets, setPresets] = useState<Preset[]>([]); // Use Preset[] to specify array type

  const filters = [
    "All ♾️",
    "Trending 🔥",
    "Latest ✨",
    "NSFW 🍑",
    "Supportive 🤝",
  ]; // Example filters
  const updateFilters = async (filter: string) => {
    try {
      setisLoading(true);
      const sanitizedFilter = filter.split(" ")[0].toLowerCase();

      const response = await axios.get(
        `https://api.brokengpt.com/bots/${sanitizedFilter}`,
        {
          withCredentials: true,
        }
      );

      setPresets(response.data.presets || []);

      setisLoading(false); // Set isLoading to false after fetching presets
    } catch (error) {
      console.error("Error fetching presets:", error);
      setPresets([]);
    }
  };

  useEffect(() => {
    updateFilters("all");
  }, []);

  return (
    <>
      <ScrollArea className="py-2 overflow-x-auto">
        <div className="flex gap-x-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              className="dark text-text bg-primaryColor hover:bg-black hover:bg-opacity-40"
              onClick={() => updateFilters(filter.toLowerCase())}
            >
              {filter}
            </Button>
          ))}
        </div>
      </ScrollArea>
      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      )}
      <div className="w-full py-6 bot-list">
        {presets.map((preset) => (
          <BotCard
            key={preset.id} // Ensure each BotCard has a unique key
            name={preset.name}
            imagelink={preset.imagelink} // Access imagelink property
            isNsfw={preset.isNsfw}
            description={preset.excerpt} // Access description property
            count={preset.count}
            presetId={preset.id}
          />
        ))}
      </div>

      <style>{`

.bot-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  place-items: center;
  justify-content: center;
  align-items: center;
}

`}</style>
    </>
  );
}
