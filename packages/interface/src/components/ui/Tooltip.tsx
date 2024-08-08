import { useState, useCallback } from "react";
import { CiCircleQuestion } from "react-icons/ci";

interface ITooltipProps {
  description: string;
}

export const Tooltip = ({ description }: ITooltipProps): JSX.Element => {
  const [showBlock, setShowBlock] = useState<boolean>(false);

  const handleShowBlock = useCallback(() => {
    setShowBlock(true);
  }, [setShowBlock]);

  const handleHideBlock = useCallback(() => {
    setShowBlock(false);
  }, [setShowBlock]);

  return (
    <div className="relative z-10 cursor-pointer text-gray-500 dark:text-white">
      <CiCircleQuestion onMouseEnter={handleShowBlock} onMouseLeave={handleHideBlock} />

      {showBlock && (
        <div className="t-0 l-l dark:bg-lightBlack absolute min-w-60 rounded-md bg-white p-3 text-gray-500 shadow-md">
          {description}
        </div>
      )}
    </div>
  );
};
