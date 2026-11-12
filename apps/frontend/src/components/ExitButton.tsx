export const ExitButton = ({
  onClick,
  disabled = false,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white hover:bg-gray-200 text-black font-semibold px-6 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50 ${className}`}
    >
      Exit Game
    </button>
  );
};