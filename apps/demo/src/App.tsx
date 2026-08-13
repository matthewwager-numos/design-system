import { useState } from "react";
import { MobileNav, Navigation } from "@numosai/ui";
import { NavContent, accountMenu } from "./NavContent";
import { HomePage } from "./pages/HomePage";
import { EmployeesApp } from "./apps/employees/EmployeesApp";
import { ToastProvider } from "./toast/ToastProvider";
import type { PageId } from "./pages";

export default function App() {
  const [page, setPage] = useState<PageId>("home");

  function handleSignOut() {
    // No real auth in this demo — just a stand-in for where a sign-out
    // action would go.
    window.alert("Signed out (demo only, nothing to sign out of).");
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <div className="app-shell__desktop-nav">
          <Navigation>
            <NavContent active={page} onNavigate={setPage} onSignOut={handleSignOut} />
          </Navigation>
        </div>

        <div className="app-shell__mobile-nav">
          <MobileNav name="Matthew Wager" accountMenu={accountMenu(handleSignOut)}>
            <NavContent active={page} onNavigate={setPage} onSignOut={handleSignOut} />
          </MobileNav>
        </div>

        <main className="app-shell__main">
          {page === "home" && <HomePage />}
          {page === "employees" && <EmployeesApp />}
        </main>
      </div>
    </ToastProvider>
  );
}
