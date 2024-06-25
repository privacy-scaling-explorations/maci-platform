import Link from "next/link";

interface NavigatorProps {
  projectName: string;
}

export const Navigator = ({ projectName }: NavigatorProps) => {
  return (
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
};
