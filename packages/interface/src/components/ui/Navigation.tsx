import Link from "next/link";

interface INavigationProps {
  projectName: string;
  pollId: string;
}

export const Navigation = ({ projectName, pollId }: INavigationProps): JSX.Element => (
  <div className="flex gap-2 font-sans text-xs font-medium uppercase leading-[18px] text-gray-400">
    <Link href={`/rounds/${pollId}`}>Projects</Link>

    <span>{">"}</span>

    <span className="font-bold tracking-[0.1px] text-blue-500">
      <b>{projectName}</b>
    </span>
  </div>
);
