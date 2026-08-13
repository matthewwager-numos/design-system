import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { clsx } from "clsx";
import "./Banner.css";

export type BannerStatus = "neutral" | "positive" | "negative" | "notice" | "info";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  status?: BannerStatus;
  title: ReactNode;
  description?: ReactNode;
  /** Show the close (×) button. Defaults to true. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

const STATUS_ICONS: Record<BannerStatus, ReactNode> = {
  neutral: <Info size={16} />,
  positive: <CircleCheck size={16} />,
  negative: <TriangleAlert size={16} />,
  notice: <CircleAlert size={16} />,
  info: <Info size={16} />,
};

/**
 * A static, inline status banner. Matches Figma's "Alert" component
 * (internally named "Banner"). Renders in place — no portal, positioning,
 * timers, or transition. For a floating, self-dismissing toast built on
 * this same visual, see <Alert>.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { status = "neutral", title, description, dismissible = true, onDismiss, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="alert" className={clsx("ds-banner", `ds-banner--${status}`, className)} {...rest}>
      <span className="ds-banner__icon" aria-hidden>{STATUS_ICONS[status]}</span>
      <div className="ds-banner__content">
        <p className="ds-banner__title">{title}</p>
        {description ? <p className="ds-banner__description">{description}</p> : null}
      </div>
      {dismissible ? (
        <button type="button" className="ds-banner__close" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
});
