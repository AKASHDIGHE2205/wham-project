export const eventColors = {
  blue: "bg-blue-500 border-blue-200",
  green: "bg-emerald-500 border-emerald-200",
  red: "bg-rose-500 border-rose-200",
  purple: "bg-purple-500 border-purple-200",
  amber: "bg-amber-500 border-amber-200",
  indigo: "bg-indigo-500 border-indigo-200",
};

export const getEventColorClass = (color?: string) => {
  return eventColors[color as keyof typeof eventColors] || eventColors.blue;
};
