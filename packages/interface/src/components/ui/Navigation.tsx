import Link from "next/link";

interface INavigationProps {
  projectName: string;
}

export const Navigation = ({ projectName }: INavigationProps): JSX.Element => (
  <div className="flex gap-2 text-sm uppercase text-gray-400">
    <span>
      <Link href="/projects">Projects</Link>
    </span>

    <span>{">"}</span>

    <span className="text-blue-400">
      <b>{projectName}</b>
    </span>
  </div>
);
