import { useState } from "react";
import { MobileNav, Navigation, useMeasuredHeightVar } from "@numosai/ui";
import { NavContent, accountMenu } from "./NavContent";
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
              <MobileNav name="Matthew Wager" accountMenu={accountMenu(handleSignOut)}>
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
          </div>
        </EmployeesProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
