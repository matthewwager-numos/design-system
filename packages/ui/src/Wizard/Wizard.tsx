import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { FormBody, FormFooter } from "../Form";
import { ProgressIndicator } from "../ProgressIndicator";
import type { ProgressIndicatorStep } from "../ProgressIndicator";
import "./Wizard.css";

export interface WizardStep {
  /** React key — not used for routing or anything else. */
  id: string;
  /** This step's entry in the step panel's progress list. */
  label: ReactNode;
  /** This step's heading, shown above its fields while it's current. */
  heading: ReactNode;
  description?: ReactNode;
  /** This step's fields — real form controls, wrapped in a `<FormBody>` internally. */
  content: ReactNode;
}

export interface WizardProps {
  /** The whole flow's title (e.g. "Add employee") — stays put in the header across every step, unlike each step's own `heading`. */
  title: ReactNode;
  steps: WizardStep[];
  /** Controlled current step. Omit to let Wizard manage its own. */
  stepIndex?: number;
  defaultStepIndex?: number;
  onStepIndexChange?: (index: number) => void;
  /** Controlled step-panel visibility, toggled by the header's expand/collapse button. Omit to let Wizard manage its own (defaults to expanded). */
  stepPanelExpanded?: boolean;
  defaultStepPanelExpanded?: boolean;
  onStepPanelExpandedChange?: (expanded: boolean) => void;
  /** Shows a "Save & Exit" action in the header. Omit to hide it entirely. */
  onSaveExit?: () => void;
  /** Footer's left-aligned action (Figma's "Tertiary" slot) — e.g. a Cancel link. */
  secondaryAction?: ReactNode;
  /** Primary action label on every step but the last. */
  nextLabel?: ReactNode;
  /** Primary action label on the last step. */
  finishLabel?: ReactNode;
  /**
   * Called when the primary action is activated on the last step. Every
   * step's fields belong to the same real `<form>` this submit event comes
   * from — `new FormData(event.currentTarget)` collects all of them, not
   * just the last step's, since earlier steps stay mounted (just visually
   * hidden) rather than being unmounted as you move past them.
   */
  onFinish: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

/**
 * A multi-step "create object" flow — matches Figma's Wizard exactly:
 * `WizardHeader` (title, a step-panel expand/collapse toggle, an optional
 * "Save & Exit", and a flow-progress bar) above a body split into the step
 * panel (a vertical `<ProgressIndicator>`) and the current step's heading +
 * fields, with a `<FormFooter>` for Back/Continue/Finish navigation.
 *
 * Fundamentally one real `<form>` behaving as a multi-step submit: every
 * step's `content` renders the whole time (just `hidden` when not current),
 * so uncontrolled fields keep their values as you move between steps, and
 * `onFinish` gets one `FormData` covering every step at once.
 *
 * Doesn't render `<Navigation>` itself — Figma's Wizard sits next to it,
 * but that's ordinary app chrome the page composes around Wizard, not
 * something Wizard owns (same reasoning `<Header>` doesn't own it either).
 */
export function Wizard({
  title,
  steps,
  stepIndex: controlledStepIndex,
  defaultStepIndex = 0,
  onStepIndexChange,
  stepPanelExpanded: controlledPanelExpanded,
  defaultStepPanelExpanded = true,
  onStepPanelExpandedChange,
  onSaveExit,
  secondaryAction,
  nextLabel = "Continue",
  finishLabel = "Finish",
  onFinish,
  className,
}: WizardProps) {
  const [uncontrolledStepIndex, setUncontrolledStepIndex] = useState(defaultStepIndex);
  const stepIndex = controlledStepIndex ?? uncontrolledStepIndex;

  const [uncontrolledPanelExpanded, setUncontrolledPanelExpanded] = useState(defaultStepPanelExpanded);
  const panelExpanded = controlledPanelExpanded ?? uncontrolledPanelExpanded;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  function setStepIndex(next: number) {
    setUncontrolledStepIndex(next);
    onStepIndexChange?.(next);
  }

  function setPanelExpanded(next: boolean) {
    setUncontrolledPanelExpanded(next);
    onStepPanelExpandedChange?.(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
      return;
    }
    onFinish(event);
  }

  const progressSteps: ProgressIndicatorStep[] = steps.map((step, index) => ({
    label: step.label,
    state: index < stepIndex ? "completed" : undefined,
  }));

  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  return (
    // noValidate: browser-native constraint validation (its own unstyled
    // tooltip UI) would otherwise intercept submit before this handler —
    // and before our own `status="error"` state — ever runs. Consumers
    // validate their own fields and drive TextInput/etc.'s real error
    // state instead, per this design system's own "real state, not a
    // browser guess" philosophy.
    <form className={clsx("ds-wizard", className)} onSubmit={handleSubmit} noValidate>
      <div className="ds-wizard-header">
        <div className="ds-wizard-header__row">
          <button
            type="button"
            className="ds-wizard-header__icon-button"
            onClick={() => setPanelExpanded(!panelExpanded)}
            aria-label={panelExpanded ? "Collapse step panel" : "Expand step panel"}
            aria-expanded={panelExpanded}
          >
            {panelExpanded ? <PanelLeftClose size={16} aria-hidden /> : <PanelLeftOpen size={16} aria-hidden />}
          </button>
          <p className="ds-wizard-header__title">{title}</p>
          {onSaveExit && (
            <button type="button" className="ds-wizard-header__save-exit" onClick={onSaveExit}>
              Save &amp; Exit
              <LogOut size={16} aria-hidden />
            </button>
          )}
        </div>
        <div
          className="ds-wizard-header__progress"
          role="progressbar"
          aria-valuenow={Math.round(progressValue)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
        >
          <div className="ds-wizard-header__progress-fill" style={{ width: `${progressValue}%` }} />
        </div>
      </div>

      <div className="ds-wizard-body">
        <div
          className={clsx("ds-wizard-step-panel", !panelExpanded && "ds-wizard-step-panel--collapsed")}
          aria-hidden={!panelExpanded}
        >
          <ProgressIndicator orientation="vertical" steps={progressSteps} />
        </div>

        <div className="ds-wizard-content">
          {steps.map((step, index) => (
            <div key={step.id} className="ds-wizard-step" hidden={index !== stepIndex}>
              <div className="ds-wizard-step__heading">
                <p className="ds-wizard-step__title">{step.heading}</p>
                {step.description && <p className="ds-wizard-step__description">{step.description}</p>}
              </div>
              <FormBody className="ds-wizard-step__body">{step.content}</FormBody>
            </div>
          ))}
        </div>
      </div>

      <FormFooter secondaryAction={secondaryAction}>
        <ButtonGroup>
          {!isFirstStep && (
            <Button variant="secondary" type="button" onClick={() => setStepIndex(stepIndex - 1)}>
              Back
            </Button>
          )}
          <Button variant="primary" type="submit">
            {isLastStep ? finishLabel : nextLabel}
          </Button>
        </ButtonGroup>
      </FormFooter>
    </form>
  );
}
