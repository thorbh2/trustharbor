import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshakeAngle } from "@fortawesome/free-solid-svg-icons";

/**
 * Logo = ready-made FontAwesome icon (handshake-angle) + plain wordmark.
 * No custom SVG is drawn. Icon source documented in README.
 * https://fontawesome.com/icons/handshake-angle
 */
export function TrustHarborLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-white">
        <FontAwesomeIcon icon={faHandshakeAngle} className="h-[18px] w-[18px]" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-text">TrustHarbor</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Escrow & Milestone Verification</span>
        </span>
      )}
    </span>
  );
}
