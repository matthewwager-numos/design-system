import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Setting, SettingsCard, Tab, TabList, Tabs } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";

type CategoryId = "general" | "notifications" | "approvals" | "vendors";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "approvals", label: "Approvals" },
  { id: "vendors", label: "Vendors" },
];

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "gbp", label: "GBP (£)" },
];

const APPROVER_OPTIONS = [
  { value: "maya", label: "Maya Chen" },
  { value: "jordan", label: "Jordan Lee" },
  { value: "priya", label: "Priya Patel" },
];

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "uncategorized", label: "Uncategorized" },
  { value: "cloud", label: "Cloud Infrastructure" },
  { value: "aiml", label: "AI/ML Platform" },
];

function GeneralCard() {
  const [values, setValues] = useState({
    name: "Accruals",
    description: "Track vendor spend and accrual amounts, subsidiary by subsidiary, month over month.",
    currency: "usd",
    autoLockClosedPeriods: true,
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      currency: String(data.get("currency") ?? "usd"),
      autoLockClosedPeriods: data.get("autoLockClosedPeriods") != null,
    });
    showToast({ status: "positive", title: "General settings saved" });
  }

  return (
    <SettingsCard title="General" description="Basic configuration for this app." onSave={handleSave}>
      <Setting label="App name" type="text" name="name" value={values.name} />
      <Setting label="Description" type="textarea" name="description" value={values.description} />
      <Setting label="Reporting currency" type="select" name="currency" value={values.currency} options={CURRENCY_OPTIONS} />
      <Setting label="Auto-lock closed periods" type="toggle" name="autoLockClosedPeriods" checked={values.autoLockClosedPeriods} />
    </SettingsCard>
  );
}

function NotificationsCard() {
  const [values, setValues] = useState({
    frequency: "weekly",
    notify: ["amountChanged", "periodClosed"] as string[],
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
    <SettingsCard title="Notifications" description="How often you hear about changes to accruals." onSave={handleSave}>
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
          { value: "amountChanged", label: "Accrual amount changed" },
          { value: "vendorAdded", label: "New vendor added" },
          { value: "flaggedForReview", label: "Accrual flagged for review" },
          { value: "periodClosed", label: "Period closed" },
        ]}
      />
    </SettingsCard>
  );
}

function ApprovalsCard() {
  const [values, setValues] = useState({
    requireApproval: true,
    threshold: "50000",
    defaultApprover: "maya",
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      requireApproval: data.get("requireApproval") != null,
      threshold: String(data.get("threshold") ?? "50000"),
      defaultApprover: String(data.get("defaultApprover") ?? "maya"),
    });
    showToast({ status: "positive", title: "Approval settings saved" });
  }

  return (
    <SettingsCard title="Approvals" description="When an accrual needs sign-off before a period can close." onSave={handleSave}>
      <Setting label="Require approval before period close" type="toggle" name="requireApproval" checked={values.requireApproval} />
      <Setting
        label="Approval threshold"
        type="slider"
        name="threshold"
        value={values.threshold}
        min={0}
        max={200_000}
        step={10_000}
        formatValue={(v) => `$${v.toLocaleString()}`}
      />
      <Setting label="Default approver" type="select" name="defaultApprover" value={values.defaultApprover} options={APPROVER_OPTIONS} />
    </SettingsCard>
  );
}

function VendorsCard() {
  const [values, setValues] = useState({
    defaultCategory: "uncategorized",
    requireCategory: true,
    varianceFlagThreshold: "25",
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      defaultCategory: String(data.get("defaultCategory") ?? "uncategorized"),
      requireCategory: data.get("requireCategory") != null,
      varianceFlagThreshold: String(data.get("varianceFlagThreshold") ?? "25"),
    });
    showToast({ status: "positive", title: "Vendor settings saved" });
  }

  return (
    <SettingsCard title="Vendors" description="Defaults applied to newly added vendors and subsidiaries." onSave={handleSave}>
      <Setting label="Default category" type="select" name="defaultCategory" value={values.defaultCategory} options={DEFAULT_CATEGORY_OPTIONS} />
      <Setting label="Require a category before first accrual" type="toggle" name="requireCategory" checked={values.requireCategory} />
      <Setting
        label="Flag month-over-month variance above"
        type="slider"
        name="varianceFlagThreshold"
        value={values.varianceFlagThreshold}
        min={5}
        max={100}
        step={5}
        formatValue={(v) => `${v}%`}
      />
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
        {category === "approvals" && <ApprovalsCard />}
        {category === "vendors" && <VendorsCard />}
      </div>
    </div>
  );
}
