import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { CiCircleQuestion } from "react-icons/ci";

import { IconButton } from "./ui/Button";

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL!;
function closeDropdownMenu() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
}

export const HelpButton = (): JSX.Element => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <IconButton className="w-[100px] px-0  text-gray-600" icon={CiCircleQuestion} variant="ghost">
        Help
      </IconButton>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content className="DropdownMenuContent" sideOffset={25}>
        <DropdownMenu.Item className="DropdownMenuItem">
          <Link className="w-full underline" href="/#FAQ" onClick={closeDropdownMenu}>
            FAQ
          </Link>
        </DropdownMenu.Item>

        <DropdownMenu.Item className="DropdownMenuItem">
          <Link className="w-full underline" href="/#Glossary" onClick={closeDropdownMenu}>
            Glossary
          </Link>
        </DropdownMenu.Item>

        <DropdownMenu.Item className="DropdownMenuItem">
          <Link className="w-full underline" href={feedbackUrl} rel="noreferrer" target="_blank">
            Share your feedback
          </Link>

          <div className="RightSlot">
            <Image alt="arrow-go-to" className="dark:invert" height="15" src="/arrow-go-to.svg" width="18" />
          </div>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
