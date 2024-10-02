import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    CheckIcon,
    ChevronRightIcon,
  } from '@radix-ui/react-icons';
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { IconButton } from './ui/Button';
import { useRouter } from "next/navigation";


export const LanguageButton = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = React.useState(i18n.language);
  const router = useRouter();

  const onChangeLanguage = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton className="text-gray-600" icon={Globe} variant="ghost">
        {language.toUpperCase()}
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="DropdownMenuContent" sideOffset={25}>
          <DropdownMenu.RadioGroup value={language} onValueChange={onChangeLanguage}>
            <DropdownMenu.RadioItem className="DropdownMenuRadioItem" value="en">
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
              <CheckIcon />
              </DropdownMenu.ItemIndicator>
              🇺🇸 English
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem className="DropdownMenuRadioItem" value="es">
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
              <CheckIcon />
              </DropdownMenu.ItemIndicator>
              🇪🇸 Español
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
