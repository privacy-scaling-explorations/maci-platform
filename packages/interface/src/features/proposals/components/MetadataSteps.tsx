import Image from "next/image";

import { cn } from "~/utils/classNames";

export enum EStepState {
  DEFAULT = -1,
  ACTIVE = 0,
  DONE = 1,
}

interface IStepCategoryProps {
  title: string;
  progress: EStepState;
}

interface IMetadataStepsProps {
  step: number;
}

const StepCategory = ({ title, progress }: IStepCategoryProps): JSX.Element => (
  <div className="flex items-center gap-1 text-xs sm:gap-[11px] sm:text-base">
    <div className="w-[22px]">
      {progress === EStepState.ACTIVE && (
        <Image alt="circle-check-blue" height="22" src="/circle-check-blue.svg" width="22" />
      )}

      {progress >= EStepState.DONE && (
        <Image alt="circle-check-blue-filled" height="22" src="/circle-check-blue-filled.svg" width="22" />
      )}

      {progress <= EStepState.DEFAULT && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
    </div>

    <div
      className={cn("w-fit font-sans font-normal", progress === EStepState.ACTIVE ? "text-blue-500" : "text-gray-300")}
    >
      {title}
    </div>
  </div>
);

const Interline = (): JSX.Element => <div className="h-[1px] w-4 bg-gray-200 sm:w-9" />;

export const MetadataSteps = ({ step }: IMetadataStepsProps): JSX.Element => (
  <div className="flex items-center gap-1 lg:gap-5">
    <StepCategory progress={step} title="Project Profile" />

    <Interline />

    <StepCategory progress={step - 1} title="Contribution & Impact" />

    <Interline />

    <StepCategory progress={step - 2} title="Review & Submit" />
  </div>
);
