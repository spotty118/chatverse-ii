interface ModelButton {
  name: string;
  onClick?: () => void;
}

export const Sidebar = () => {
  const models: ModelButton[] = [
    { name: "All-In-One" },
    { name: "GPT-4o" },
    { name: "GPT-4o mini" },
    { name: "GPT-4 Turbo" },
    { name: "g1-mini" },
    { name: "GPT-3.5" },
    { name: "Claude 3.5 Sonnet" },
    { name: "Claude 3.5 Haiku" },
    { name: "Claude 3 Opus" },
  ];

  return (
    <div className="w-64 bg-[#F6F7F9] p-4">
      <div className="flex items-center gap-2 mb-6">
        <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-semibold text-lg">ChatVerse II</span>
      </div>
      
      <div className="space-y-1">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={model.onClick}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            {model.name}
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Basic</span>
            <span>0 / 20</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Advanced</span>
            <span>2 / 0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Images</span>
            <span>0 / 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};