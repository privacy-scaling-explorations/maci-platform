import { GithubIcon } from "lucide-react";

export const Footer = (): JSX.Element => (
  <footer className="flex flex-col items-center justify-center bg-gray-950 p-2 text-gray-400">
    <a
      className="group py-4 text-sm hover:text-white"
      href="https://github.com/privacy-scaling-explorations/maci-rpgf/"
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex">
        <span className="mr-1">Built with</span>

        <span className="relative -mt-1 w-6 px-1 text-xl text-red-600">
          <span className="absolute">❤️</span>

          <span className="absolute group-hover:animate-ping">❤️</span>
        </span>

        <span className="ml-1">on EasyRetroPGF.</span>
      </div>

      <div className="inline-flex">
        Run your own RPGF Round
        <GithubIcon className="ml-1 mt-0.5 h-4 w-4" />
      </div>
    </a>
  </footer>
);
