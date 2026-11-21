export const WelcomeBadge = ({ name, avatar }: { name?: string | null; avatar?: string | null }) => {
  const firstName = name?.trim().split(/\s+/)[0] || "Player";
  const initial = firstName[0]?.toUpperCase();

  return (
    <div className="welcome-badge flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur pl-2 pr-5 py-2 shadow-sm">
      <style>{`
        @keyframes wb-in   { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
        @keyframes wb-wave { 0%, 60%, 100% { transform: rotate(0) } 10%, 30% { transform: rotate(14deg) } 20%, 40% { transform: rotate(-8deg) } 50% { transform: rotate(10deg) } }
        .welcome-badge { animation: wb-in 0.5s ease-out }
        .wb-wave { display: inline-block; transform-origin: 70% 70%; animation: wb-wave 2.2s ease-in-out 0.6s 1 }
      `}</style>

      <div className="relative">
        {avatar ? (
          <img
            src={avatar}
            alt={firstName}
            referrerPolicy="no-referrer"   // Google profile pictures often fail to load without this
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#96c95d] to-[#5f9b2d] text-white font-bold flex items-center justify-center">
            {initial}
          </div>
        )}
        {/* the small green dot, like an online indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#81b64c] border-2 border-white" />
      </div>

      <div className="leading-tight">
        <p className="text-base font-bold text-gray-900">
          {firstName}
        </p>
      </div>
    </div>
  );
};