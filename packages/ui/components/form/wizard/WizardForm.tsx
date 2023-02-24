import { noop } from "lodash";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import classNames from "@calcom/lib/classNames";

import { Button, Steps } from "../../..";

type DefaultStep = {
  title: string;
  containerClassname?: string;
  contentClassname?: string;
  description: string;
  content?: ((setIsLoading: Dispatch<SetStateAction<boolean>>) => JSX.Element) | JSX.Element;
  isEnabled?: boolean;
  isLoading?: boolean;
};

function WizardForm<T extends DefaultStep>(props: {
  href: string;
  steps: T[];
  disableNavigation?: boolean;
  containerClassname?: string;
  prevLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  stepLabel?: React.ComponentProps<typeof Steps>["stepLabel"];
}) {
  const { href, steps, nextLabel = "Next", finishLabel = "Finish", prevLabel = "Back", stepLabel } = props;
  const router = useRouter();
  const step = parseInt((router.query.step as string) || "1");
  const currentStep = steps[step - 1];
  const setStep = (newStep: number) => {
    router.replace(`${href}?step=${newStep || 1}`, undefined, { shallow: true });
  };
  const [currentStepIsLoading, setCurrentStepIsLoading] = useState(false);

  useEffect(() => {
    setCurrentStepIsLoading(false);
  }, [currentStep]);

  return (
    <div className="mx-auto mt-4 print:w-full">
      <div className={classNames("overflow-hidden  md:mb-2 md:w-[700px]", props.containerClassname)}>
        <div className="px-6 py-5 sm:px-14">
          <h1 className="font-cal text-2xl text-gray-900">{currentStep.title}</h1>
          <p className="text-sm text-gray-500">{currentStep.description}</p>
          {!props.disableNavigation && (
            <Steps maxSteps={steps.length} currentStep={step} navigateToStep={noop} stepLabel={stepLabel} />
          )}
        </div>
      </div>
      <div className={classNames("mb-8 overflow-hidden md:w-[700px]", props.containerClassname)}>
        <div className={classNames("print:p-none max-w-3xl px-8 py-5 sm:p-6", currentStep.contentClassname)}>
          {typeof currentStep.content === "function"
            ? currentStep.content(setCurrentStepIsLoading)
            : currentStep.content}
        </div>
        {!props.disableNavigation && (
          <div className="flex justify-end px-4 py-4 print:hidden sm:px-6">
            {step > 1 && (
              <Button
                color="secondary"
                onClick={() => {
                  setStep(step - 1);
                }}>
                {prevLabel}
              </Button>
            )}

            <Button
              tabIndex={0}
              loading={currentStepIsLoading}
              type="submit"
              color="primary"
              form={`wizard-step-${step}`}
              disabled={currentStep.isEnabled === false}
              className="relative ml-2">
              {step < steps.length ? nextLabel : finishLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WizardForm;
