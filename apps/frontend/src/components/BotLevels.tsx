import { useState } from "react";

export const BOT_LEVELS = [
  { id: "beginner", name: "Beginner", icon: "♟", desc: "Beginner mode" },
  { id: "easy",     name: "Easy",     icon: "♞", desc: "Easy mode" },
  { id: "medium",   name: "Medium",   icon: "♝", desc: "Medium mode" },
  { id: "hard",     name: "Hard",     icon: "♜", desc: "Hard mode" },
  { id: "master",   name: "Master",   icon: "♛", desc: "Master mode" },
] as const;

export type BotLevelId = (typeof BOT_LEVELS)[number]["id"];

type Props = {
  initialLevel?: BotLevelId;
  starting?: boolean;
  onStart: (level: BotLevelId) => void;
  onClose: () => void;
};

export const BotLevel = ({ initialLevel = "medium", starting = false, onStart, onClose }: Props) => {
  const [level, setLevel] = useState<BotLevelId>(initialLevel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#191919] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}   // a click inside the card must not close it
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold">Play the computer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">Choose a level. You play White.</p>

        <div className="flex flex-col gap-2">
          {BOT_LEVELS.map((l) => {
            const selected = l.id === level;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex items-center gap-4 text-left rounded-xl px-4 py-3 border transition-colors ${
                  selected
                    ? "border-[#81b64c] bg-[#81b64c]/10"
                    : "border-transparent bg-[#262626] hover:bg-[#2e2e2e]"
                }`}
              >
                <span className="text-3xl w-8 text-center">{l.icon + "\uFE0E"}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{l.name}</span>
                  <span className="block text-sm text-gray-400">{l.desc}</span>
                </span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected ? "border-[#81b64c]" : "border-gray-500"
                  }`}
                >
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c]" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-[#2e2e2e] hover:bg-[#3a3a3a] font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onStart(level)}
            disabled={starting}
            className="flex-1 bg-[#81b64c] hover:bg-[#95c15f] disabled:opacity-60 disabled:cursor-not-allowed font-bold py-3 rounded-lg"
          >
            {starting ? "Starting..." : "Start Game"}
          </button>
        </div>
      </div>
    </div>
  );
};