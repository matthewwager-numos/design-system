import { Settings as SettingsIcon } from "lucide-react";
import { Header, MobileAppHeader, Setting, SettingsCard, Tab, TabList, Tabs, useMeasuredHeightVar } from "@numosai/ui";
import { useTheme } from "../theme/ThemeProvider";
import type { ThemeMode } from "../theme/ThemeProvider";
import { useToast } from "../toast/ToastProvider";

export type SettingsPageTab = "appearance";

export interface SettingsPageProps {
  /** Lifted to `App.tsx`, same as every app's own tab state — survives switching away and back, and round-trips through the URL hash (`#/settings/appearance`). */
  tab: SettingsPageTab;
  onTabChange: (tab: SettingsPageTab) => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

/**
 * The global Settings page — a bottom-nav utility alongside Team, not one
 * of the 8 workflow apps, but same header/tabs/body anatomy every other
 * left-nav app shares (see `AccrualsApp`/`CollectApp`). "Appearance" is the
 * only tab today; add more the same way any other app would (a new
 * `SettingsPageTab` member, a new `<Tab>`, a new tab-body branch below).
 */
export function SettingsPage({ tab, onTabChange }: SettingsPageProps) {
  const { mode, setMode } = useTheme();
  const showToast = useToast();
  const mobileHeaderRef = useMeasuredHeightVar<HTMLDivElement>("--mobile-app-header-height");

  return (
    <>
      <div className="desktop-app-header">
        <Header
          variant="app"
          icon={
            <span className="app-icon-tile">
              <SettingsIcon size={24} />
            </span>
          }
          title="Settings"
          subNav={
            <Tabs value={tab} onValueChange={(value) => onTabChange(value as SettingsPageTab)}>
              <TabList>
                <Tab value="appearance">Appearance</Tab>
              </TabList>
            </Tabs>
          }
        />
      </div>

      <div className="mobile-app-header" ref={mobileHeaderRef}>
        <MobileAppHeader
          icon={
            <span className="app-icon-tile app-icon-tile--sm">
              <SettingsIcon size={16} />
            </span>
          }
          title="Settings"
          value={tab}
          onValueChange={(value) => onTabChange(value as SettingsPageTab)}
          onIconClick={() => onTabChange("appearance")}
        >
          <Tab value="appearance">Appearance</Tab>
        </MobileAppHeader>
      </div>

      <div className="app-body">
        {/* Same `.settings-layout`/`.settings-detail-pane` template every
            app's own internal Settings tab uses (see Team/Accrue/Close) —
            just with no `.settings-list-pane` sibling, since this page has
            only the one implicit category. The card still lands in exactly
            the same centered spot either way; only whether a tertiary nav
            rides alongside it changes. */}
        <div className="settings-layout">
          <div className="settings-detail-pane">
            {tab === "appearance" && (
              <SettingsCard
                title="Appearance"
                description="Auto follows your system's own light/dark setting."
                onSave={(event) => {
                  const formData = new FormData(event.currentTarget);
                  const next = formData.get("theme");
                  if (next === "light" || next === "dark" || next === "auto") setMode(next);
                  showToast({ status: "positive", title: "Appearance updated" });
                }}
              >
                <Setting label="Theme" type="segmentedControl" name="theme" value={mode} options={THEME_OPTIONS} />
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
