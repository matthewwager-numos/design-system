import { Setting, SettingsCard } from "@numosai/ui";
import { useTheme } from "../theme/ThemeProvider";
import type { ThemeMode } from "../theme/ThemeProvider";
import { useToast } from "../toast/ToastProvider";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

export function SettingsPage() {
  const { mode, setMode } = useTheme();
  const showToast = useToast();

  return (
    <div className="app-body">
      <div className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Settings</h1>
            <p className="page__description">Preferences for this demo, stored in your browser.</p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
