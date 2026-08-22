import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Setting, SettingsCard, Tab, TabList, Tabs } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";

type CategoryId = "general" | "notifications" | "access" | "directory";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "access", label: "Access" },
  { id: "directory", label: "Directory display" },
];

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

const VISIBILITY_OPTIONS = [
  { value: "team", label: "Team" },
  { value: "private", label: "Private" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

function GeneralCard() {
  const [values, setValues] = useState({
    name: "People",
    description: "Manage the people at your company — profiles, roles, and access.",
    recordsPerPage: "25",
    autoArchive: false,
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      recordsPerPage: String(data.get("recordsPerPage") ?? "25"),
      autoArchive: data.get("autoArchive") != null,
    });
    showToast({ status: "positive", title: "General settings saved" });
  }

  return (
    <SettingsCard title="General" description="Basic configuration for this app." onSave={handleSave}>
      <Setting label="App name" type="text" name="name" value={values.name} />
      <Setting label="Description" type="textarea" name="description" value={values.description} />
      <Setting label="Records per page" type="slider" name="recordsPerPage" value={values.recordsPerPage} min={10} max={100} step={5} formatValue={(v) => String(v)} />
      <Setting label="Auto-archive departed employees" type="toggle" name="autoArchive" checked={values.autoArchive} />
    </SettingsCard>
  );
}

function NotificationsCard() {
  const [values, setValues] = useState({
    frequency: "weekly",
    notify: ["newHire", "roleChange"] as string[],
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      frequency: String(data.get("frequency") ?? "weekly"),
      notify: data.getAll("notify").map(String),
    });
    showToast({ status: "positive", title: "Notification settings saved" });
  }

  return (
    <SettingsCard title="Notifications" description="How often you hear about changes to the roster." onSave={handleSave}>
      <Setting
        label="Digest frequency"
        type="radio"
        name="frequency"
        value={values.frequency}
        options={[
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ]}
      />
      <Setting
        label="Notify on"
        type="checkbox"
        name="notify"
        values={values.notify}
        options={[
          { value: "newHire", label: "New hire" },
          { value: "departure", label: "Departure" },
          { value: "roleChange", label: "Role change" },
        ]}
      />
    </SettingsCard>
  );
}

function AccessCard() {
  const [values, setValues] = useState({
    defaultRole: "member",
    visibility: "team",
    requireTwoFactor: false,
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      defaultRole: String(data.get("defaultRole") ?? "member"),
      visibility: String(data.get("visibility") ?? "team"),
      requireTwoFactor: data.get("requireTwoFactor") != null,
    });
    showToast({ status: "positive", title: "Access settings saved" });
  }

  return (
    <SettingsCard title="Access" description="Defaults applied to newly added employees." onSave={handleSave}>
      <Setting label="Default role" type="select" name="defaultRole" value={values.defaultRole} options={ROLE_OPTIONS} />
      <Setting label="Profile visibility" type="segmentedControl" name="visibility" value={values.visibility} options={VISIBILITY_OPTIONS} />
      <Setting label="Require two-factor authentication" type="toggle" name="requireTwoFactor" checked={values.requireTwoFactor} />
    </SettingsCard>
  );
}

function DirectoryCard() {
  const [values, setValues] = useState({
    density: "comfortable",
    showJobTitle: true,
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      density: String(data.get("density") ?? "comfortable"),
      showJobTitle: data.get("showJobTitle") != null,
    });
    showToast({ status: "positive", title: "Directory display settings saved" });
  }

  return (
    <SettingsCard title="Directory display" description="How the employee list looks in the People tab." onSave={handleSave}>
      <Setting label="Row density" type="segmentedControl" name="density" value={values.density} options={DENSITY_OPTIONS} />
      <Setting label="Show job title" type="toggle" name="showJobTitle" checked={values.showJobTitle} />
    </SettingsCard>
  );
}

export function SettingsTab() {
  const [category, setCategory] = useState<CategoryId>("general");
  // Only meaningful below the desktop breakpoint, where list and detail are
  // separate full-width "screens" rather than side-by-side panes — see
  // .settings-layout in app.css.
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  function handleCategoryChange(value: string) {
    setCategory(value as CategoryId);
    setMobileView("detail");
  }

  return (
    <div className="settings-layout" data-mobile-view={mobileView}>
      <div className="settings-list-pane">
        <Tabs orientation="vertical" value={category} onValueChange={handleCategoryChange}>
          <TabList>
            {CATEGORIES.map((c) => (
              <Tab key={c.id} value={c.id}>
                {c.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </div>

      <div className="settings-detail-pane">
        <Button variant="link" size="sm" leadingIcon={<ArrowLeft size={16} />} className="settings-back" onClick={() => setMobileView("list")}>
          Categories
        </Button>
        {category === "general" && <GeneralCard />}
        {category === "notifications" && <NotificationsCard />}
        {category === "access" && <AccessCard />}
        {category === "directory" && <DirectoryCard />}
      </div>
    </div>
  );
}
