import { format } from "date-fns";

export const calculateTimeLeft = (date: Date): [number, number, number, number] => {
  const sec = Math.floor((date.getTime() - Date.now()) / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);

  return [days % 365, hrs % 24, min % 60, sec % 60];
};

export const formatDate = (date: Date | number): string => format(date, "dd MMM yyyy HH:mm");

export function formatPeriod({ start, end }: { start: Date; end: Date }): string {
  const fullFormat = "d MMM yyyy";

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${format(end, fullFormat)}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMM")} - ${format(end, fullFormat)}`;
  }

  return `${format(start, fullFormat)} - ${format(end, fullFormat)}`;
}
