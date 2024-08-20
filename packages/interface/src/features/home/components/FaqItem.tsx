import clsx from "clsx";
import Image from "next/image";
import { useState, useCallback, type ReactNode } from "react";

export interface IFAQItemProps {
  title: string;
  description: ReactNode;
}

export const FAQItem = ({ title, description }: IFAQItemProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openDescription = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <div className="flex w-3/5 flex-col gap-4 border-b border-b-black py-6 dark:border-b-white dark:text-white">
      <button className="flex cursor-pointer justify-between" type="button" onClick={openDescription}>
        <p className="font-mono text-2xl uppercase">{title}</p>

        <Image
          alt="arrow-down"
          className={clsx("dark:invert", isOpen && "origin-center rotate-180")}
          height="24"
          src="/arrow-down.svg"
          width="24"
        />
      </button>

      {isOpen && description}
    </div>
  );
};
