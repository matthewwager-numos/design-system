import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { IconButton, MobileNav, Modal, Navigation, useMeasuredHeightVar } from "@numosai/ui";
import { NavContent, accountMenu } from "./NavContent";
import { AssistantPanel, useAssistantConversation } from "./components/AssistantPanel";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { EmployeesApp } from "./apps/employees/EmployeesApp";
import type { EmployeesAppTab } from "./apps/employees/EmployeesApp";
import { ReconciliationApp } from "./apps/reconciliation/ReconciliationApp";
import type { ReconciliationAppTab } from "./apps/reconciliation/ReconciliationApp";
import { AccrualsApp } from "./apps/accruals/AccrualsApp";
import type { AccrualsAppTab } from "./apps/accruals/AccrualsApp";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ToastProvider } from "./toast/ToastProvider";
import { EmployeesProvider } from "./data/useEmployees";
import type { PageId } from "./pages";

export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const mobileNavRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-nav-height");

  // Each app's own active tab lives here, not inside that app's own
  // component — those unmount (losing local state) the moment you switch
  // to a different app via the left nav, so "remember the last tab you had
  // open" only works if this state survives that unmount, one level up.
  const [employeesTab, setEmployeesTab] = useState<EmployeesAppTab>("overview");
  const [reconciliationTab, setReconciliationTab] = useState<ReconciliationAppTab>("tasks");
  const [accrualsTab, setAccrualsTab] = useState<AccrualsAppTab>("table");

  // Lifted the same way as the per-app tab state above: this must survive
  // navigating between apps, not reset every time <main>'s own content
  // swaps out.
  const [assistantOpen, setAssistantOpen] = useState(false);
  // Separate from `assistantOpen` above: the mobile sparkle button (in
  // <MobileNav>'s own bar, itself CSS-hidden at desktop widths — see
  // `.app-shell__mobile-nav`) opens a full-screen `<Modal>` instead of the
  // desktop squeeze panel, since there's no room to squeeze on a phone.
  // Being a distinct piece of state (rather than the same `assistantOpen`
  // gated by a viewport check) means the Modal's own focus-trap/scroll-lock
  // side effects can only ever trigger from that mobile-only button —
  // mirroring how `<MobileNav>`'s own `expanded` panel gets away with no
  // explicit breakpoint check, since its trigger is likewise only visible
  // on mobile.
  const [mobileAssistantOpen, setMobileAssistantOpen] = useState(false);
  // One shared conversation, not two — see useAssistantConversation's own
  // doc comment for why the desktop and mobile renderings below must pass
  // the exact same instance rather than each calling the hook themselves.
  const conversation = useAssistantConversation();

  // A shared occupancy variable any fixed/portaled element can react to —
  // same pattern `useMeasuredHeightVar` already established for
  // `--mobile-nav-height`/`--mobile-app-header-height`, just a fixed
  // constant here instead of a ResizeObserver-measured value. `<Modal>`'s
  // own overlay (packages/ui/src/Modal/Modal.css) reads this to shrink
  // out of the assistant panel's way instead of being covered by it.
  useEffect(() => {
    // The panel's own 30rem width, plus the same 0.25rem gap `.app-shell`
    // already reserves between it and `.app-shell__main` (confirmed via
    // Playwright bounding-rect measurement: without it, a squeezed Modal's
    // right edge lands 4px short of the panel's actual left edge).
    document.documentElement.style.setProperty("--assistant-panel-width", assistantOpen ? "calc(30rem + 0.25rem)" : "0px");
  }, [assistantOpen]);

  function handleSignOut() {
    // No real auth in this demo — just a stand-in for where a sign-out
    // action would go.
    window.alert("Signed out (demo only, nothing to sign out of).");
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <EmployeesProvider>
          <div className="app-shell">
            <div className="app-shell__desktop-nav">
              <Navigation>
                <NavContent active={page} onNavigate={setPage} onSignOut={handleSignOut} />
              </Navigation>
            </div>

            <div className="app-shell__mobile-nav" ref={mobileNavRef}>
              <MobileNav
                name="Matthew Wager"
                accountMenu={accountMenu(handleSignOut)}
                trailingAction={
                  <button
                    type="button"
                    className="assistant-fab--mobile"
                    onClick={() => setMobileAssistantOpen(true)}
                    aria-label="Open Numos Assistant"
                  >
                    <Sparkles size={24} aria-hidden />
                  </button>
                }
              >
                <NavContent active={page} onNavigate={setPage} onSignOut={handleSignOut} />
              </MobileNav>
            </div>

            <main className="app-shell__main">
              {page === "home" && <HomePage />}
              {page === "employees" && <EmployeesApp tab={employeesTab} onTabChange={setEmployeesTab} />}
              {page === "reconciliation" && <ReconciliationApp tab={reconciliationTab} onTabChange={setReconciliationTab} />}
              {page === "accruals" && <AccrualsApp tab={accrualsTab} onTabChange={setAccrualsTab} />}
              {page === "settings" && <SettingsPage />}
            </main>

            {/* Always mounted, like <Navigation> itself — width toggles via
                CSS (see .app-shell__assistant/--closed in app.css) instead
                of a conditional mount, so opening/closing can transition
                smoothly instead of popping in/out. `--closed` also sets
                visibility:hidden, keeping its (zero-width) contents out of
                tab order while collapsed, since unlike <Modal> it never
                actually unmounts. */}
            <div className={`app-shell__assistant${assistantOpen ? "" : " app-shell__assistant--closed"}`}>
              <AssistantPanel onClose={() => setAssistantOpen(false)} conversation={conversation} />
            </div>
          </div>

          {/* Hidden once the panel is open — Figma's own open-state frames
              show no separate FAB, just the panel's own header (which has
              its own close control in the same top-right corner); showing
              both at once would overlap. */}
          {!assistantOpen && (
            <IconButton
              variant="primary"
              size="md"
              icon={<Sparkles size={24} />}
              aria-label="Open Numos Assistant"
              className="assistant-fab"
              onClick={() => setAssistantOpen(true)}
            />
          )}

          {/* Mobile counterpart to the desktop squeeze panel above — full-
              screen instead (no room to squeeze on a phone), so it's a real
              <Modal> drawer rather than a flex sibling. Its own close (×)
              is the only way out, matching "needs to be dismissed". */}
          <Modal
            variant="drawer"
            side="right"
            className="assistant-mobile-modal"
            open={mobileAssistantOpen}
            onOpenChange={(open) => !open && setMobileAssistantOpen(false)}
          >
            <AssistantPanel onClose={() => setMobileAssistantOpen(false)} conversation={conversation} />
          </Modal>
        </EmployeesProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
