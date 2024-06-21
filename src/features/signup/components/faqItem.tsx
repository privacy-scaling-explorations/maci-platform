import { useState, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";

import type { FAQItemProps } from "../types";

export const FAQItem = ({ title, description }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openDescription = useCallback(
    () => setIsOpen(!isOpen),
    [isOpen, setIsOpen],
  );

  return (
    <div className="flex w-3/5 flex-col gap-4 border-b border-b-black py-6">
      <div
        className="flex cursor-pointer justify-between"
        onClick={openDescription}
      >
        <p className="font-mono text-2xl uppercase">{title}</p>
        <Image
          alt=""
          width="24"
          height="24"
          src={"/arrow-down.svg"}
          className={clsx(isOpen && "origin-center rotate-180")}
        />
      </div>
      {isOpen && <div className="text-black">{description}</div>}
    </div>
  );
};
