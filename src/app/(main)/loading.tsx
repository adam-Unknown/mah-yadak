import { Moon } from "lucide-react";
import React from "react";

const Loading: React.FC = async () => {
  return (
    <div className="h-[95vh] flex justify-center items-center opacity-75">
      <Moon size={48} className="animate-spin" />
    </div>
  );
};

export default Loading;
