import Link from "next/link";
import { useTranslation } from "react-i18next";

interface INavigationProps {
  projectName: string;
}

export const Navigation = ({ projectName }: INavigationProps): JSX.Element => {
  const { t } = useTranslation();
  return(
    <div className="flex gap-2 text-sm uppercase text-gray-400">
        <span>
        <Link href="/projects">{t("projects")}</Link>
        </span>

        <span>{">"}</span>

        <span className="text-blue-400">
        <b>{projectName}</b>
        </span>
    </div>
  );
}
