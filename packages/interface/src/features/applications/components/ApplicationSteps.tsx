import clsx from "clsx";
import Image from "next/image";

export enum EStepState {
  DEFAULT = -1,
  ACTIVE = 0,
  DONE = 1,
}

interface IStepCategoryProps {
  title: string;
  progress: EStepState;
}

interface IApplicationStepsProps {
  step: number;
}

const StepCategory = ({ title, progress }: IStepCategoryProps): JSX.Element => (
  <div className="flex items-center gap-3">
    {progress === EStepState.ACTIVE && (
      <Image alt="circle-check-blue" height="22" src="/circle-check-blue.svg" width="22" />
    )}

    {progress === EStepState.DONE && (
      <Image alt="circle-check-blue-filled" height="22" src="/circle-check-blue-filled.svg" width="22" />
    )}

    {progress === EStepState.DEFAULT && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}

    <p className={clsx("text-md", progress === EStepState.ACTIVE ? "text-blue-400" : "text-gray-300")}>{title}</p>
  </div>
);

const Interline = (): JSX.Element => <div className="h-[1px] w-9 bg-gray-300" />;

export const ApplicationSteps = ({ step }: IApplicationStepsProps): JSX.Element => (
  <div className="mb-4 flex items-center gap-4">
    <StepCategory progress={step} title="Project Profile" />

    <Interline />

    <StepCategory progress={step - 1} title="Contribution & Impact" />

    <Interline />

    <StepCategory progress={step - 2} title="Review & Submit" />
  </div>
);
