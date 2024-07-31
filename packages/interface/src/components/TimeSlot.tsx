interface TimeSlotProps {
  num: number;
  unit: string;
}

export const TimeSlot = ({ num, unit }: TimeSlotProps): JSX.Element => (
  <div className="flex flex-1 flex-col items-center">
    <p className="text-2xl">
      <b>{num}</b>
    </p>

    <p className="text-gray-400">{unit}</p>
  </div>
);
