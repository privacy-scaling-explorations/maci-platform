interface TimeSlotProps {
  num: number;
  unit: string;
}

export const TimeSlot = ({ num, unit }: TimeSlotProps): JSX.Element => (
  <div className="flex flex-col items-center">
    <span className="font-sans text-2xl font-extrabold uppercase leading-[36px] tracking-[0.24px]">{num}</span>

    <span className="font-sans text-[10px] font-medium uppercase leading-[15px] text-gray-400">{unit}</span>
  </div>
);
