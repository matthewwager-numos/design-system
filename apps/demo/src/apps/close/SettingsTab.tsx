import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Setting, SettingsCard, Tab, TabList, Tabs } from "@numosai/ui";
import { useToast } from "../../toast/ToastProvider";

type CategoryId = "general" | "notifications" | "workflow" | "templates";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "workflow", label: "Workflow" },
  { id: "templates", label: "Templates" },
];

const VIEW_OPTIONS = [
  { value: "board", label: "Board" },
  { value: "list", label: "List" },
];

const ASSIGNEE_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "maya", label: "Maya Chen" },
  { value: "jordan", label: "Jordan Lee" },
  { value: "priya", label: "Priya Patel" },
  { value: "alex", label: "Alex Kim" },
  { value: "sam", label: "Sam Rivera" },
];

function GeneralCard() {
  const [values, setValues] = useState({
    name: "Close Checklist",
    description: "Track and assign the tasks that make up each month's close.",
    defaultView: "board",
    autoArchiveReconciled: true,
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      defaultView: String(data.get("defaultView") ?? "board"),
      autoArchiveReconciled: data.get("autoArchiveReconciled") != null,
    });
    showToast({ status: "positive", title: "General settings saved" });
  }

  return (
    <SettingsCard title="General" description="Basic configuration for this app." onSave={handleSave}>
      <Setting label="App name" type="text" name="name" value={values.name} />
      <Setting label="Description" type="textarea" name="description" value={values.description} />
      <Setting label="Default view" type="segmentedControl" name="defaultView" value={values.defaultView} options={VIEW_OPTIONS} />
      <Setting label="Auto-archive reconciled tasks" type="toggle" name="autoArchiveReconciled" checked={values.autoArchiveReconciled} />
    </SettingsCard>
  );
}

function NotificationsCard() {
  const [values, setValues] = useState({
    frequency: "daily",
    notify: ["assignedToMe", "movedToReview"] as string[],
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      frequency: String(data.get("frequency") ?? "daily"),
      notify: data.getAll("notify").map(String),
    });
    showToast({ status: "positive", title: "Notification settings saved" });
  }

  return (
    <SettingsCard title="Notifications" description="How often you hear about changes to the checklist." onSave={handleSave}>
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
          { value: "assignedToMe", label: "Task assigned to me" },
          { value: "movedToReview", label: "Task moved to review" },
          { value: "reconciled", label: "Task reconciled" },
          { value: "overdue", label: "Task overdue" },
        ]}
      />
    </SettingsCard>
  );
}

function WorkflowCard() {
  const [values, setValues] = useState({
    requireReview: true,
    defaultAssignee: "unassigned",
    escalateAfterDays: "3",
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      requireReview: data.get("requireReview") != null,
      defaultAssignee: String(data.get("defaultAssignee") ?? "unassigned"),
      escalateAfterDays: String(data.get("escalateAfterDays") ?? "3"),
    });
    showToast({ status: "positive", title: "Workflow settings saved" });
  }

  return (
    <SettingsCard title="Workflow" description="How a task moves from backlog to reconciled." onSave={handleSave}>
      <Setting label="Require review before reconciled" type="toggle" name="requireReview" checked={values.requireReview} />
      <Setting label="Default assignee for new tasks" type="select" name="defaultAssignee" value={values.defaultAssignee} options={ASSIGNEE_OPTIONS} />
      <Setting
        label="Escalate overdue tasks after"
        type="slider"
        name="escalateAfterDays"
        value={values.escalateAfterDays}
        min={1}
        max={14}
        step={1}
        formatValue={(v) => `${v} day${v === 1 ? "" : "s"}`}
      />
    </SettingsCard>
  );
}

function TemplatesCard() {
  const [values, setValues] = useState({
    autoCreateNextMonth: true,
    createDaysBeforePeriodEnd: "5",
    defaultOwner: "unassigned",
  });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      autoCreateNextMonth: data.get("autoCreateNextMonth") != null,
      createDaysBeforePeriodEnd: String(data.get("createDaysBeforePeriodEnd") ?? "5"),
      defaultOwner: String(data.get("defaultOwner") ?? "unassigned"),
    });
    showToast({ status: "positive", title: "Template settings saved" });
  }

  return (
    <SettingsCard title="Templates" description="How next month's checklist gets built." onSave={handleSave}>
      <Setting label="Auto-create next month's checklist" type="toggle" name="autoCreateNextMonth" checked={values.autoCreateNextMonth} />
      <Setting
        label="Create tasks this many days before period end"
        type="slider"
        name="createDaysBeforePeriodEnd"
        value={values.createDaysBeforePeriodEnd}
        min={1}
        max={14}
        step={1}
        formatValue={(v) => `${v} day${v === 1 ? "" : "s"}`}
      />
      <Setting label="Default task owner" type="select" name="defaultOwner" value={values.defaultOwner} options={ASSIGNEE_OPTIONS} />
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
        {category === "workflow" && <WorkflowCard />}
        {category === "templates" && <TemplatesCard />}
      </div>
    </div>
  );
}
