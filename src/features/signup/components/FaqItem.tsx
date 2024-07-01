import clsx from "clsx";
import Image from "next/image";
import { useState, useCallback } from "react";

import type { FAQItemProps } from "../types";

export const FAQItem = ({ title, description }: FAQItemProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openDescription = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <div className="flex w-3/5 flex-col gap-4 border-b border-b-black py-6">
      <button className="flex cursor-pointer justify-between" type="button" onClick={openDescription}>
        <p className="font-mono text-2xl uppercase">{title}</p>

        <Image
          alt="arrow-down"
          className={clsx(isOpen && "origin-center rotate-180")}
          height="24"
          src="/arrow-down.svg"
          width="24"
        />
      </button>

      {isOpen && <div className="text-black">{description}</div>}
    </div>
  );
};
