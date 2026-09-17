import { useState } from "react";
import type { FormEvent } from "react";
import { Setting, SettingsCard } from "@numosai/ui";
import { SettingsCategoryNav } from "../../components/SettingsCategoryNav";
import { useToast } from "../../toast/ToastProvider";

type CategoryId = "assignments" | "comments" | "requests" | "digests";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "assignments", label: "Assignments" },
  { id: "comments", label: "Comments" },
  { id: "requests", label: "Requests" },
  { id: "digests", label: "Digests" },
];

function AssignmentsCard() {
  const [values, setValues] = useState({ taskAssigned: true, reassigned: true });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({ taskAssigned: data.get("taskAssigned") != null, reassigned: data.get("reassigned") != null });
    showToast({ status: "positive", title: "Assignment settings saved" });
  }

  return (
    <SettingsCard title="Assignments" description="Work a teammate has handed to you across Collect, Pay, Accrue, and Reconcile." onSave={handleSave}>
      <Setting label="Notify when a task or accrual is assigned to me" type="toggle" name="taskAssigned" checked={values.taskAssigned} />
      <Setting label="Notify when one of my assignments is reassigned away from me" type="toggle" name="reassigned" checked={values.reassigned} />
    </SettingsCard>
  );
}

function CommentsCard() {
  const [values, setValues] = useState({ commented: true, mentioned: true });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({ commented: data.get("commented") != null, mentioned: data.get("mentioned") != null });
    showToast({ status: "positive", title: "Comment settings saved" });
  }

  return (
    <SettingsCard title="Comments" description="Discussion on items you're assigned to or following." onSave={handleSave}>
      <Setting label="Notify when someone comments on an item I'm assigned to" type="toggle" name="commented" checked={values.commented} />
      <Setting label="Notify when I'm mentioned directly in a comment" type="toggle" name="mentioned" checked={values.mentioned} />
    </SettingsCard>
  );
}

function RequestsCard() {
  const [values, setValues] = useState({ evidenceRequested: true, reviewRequested: true });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({ evidenceRequested: data.get("evidenceRequested") != null, reviewRequested: data.get("reviewRequested") != null });
    showToast({ status: "positive", title: "Request settings saved" });
  }

  return (
    <SettingsCard title="Requests" description="Items waiting on something only you can provide." onSave={handleSave}>
      <Setting label="Notify when a teammate requests evidence or an attachment from me" type="toggle" name="evidenceRequested" checked={values.evidenceRequested} />
      <Setting label="Notify when my review is requested on a submission" type="toggle" name="reviewRequested" checked={values.reviewRequested} />
    </SettingsCard>
  );
}

function DigestsCard() {
  const [values, setValues] = useState({ dailyDigest: false, weeklyDigest: true });
  const showToast = useToast();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({ dailyDigest: data.get("dailyDigest") != null, weeklyDigest: data.get("weeklyDigest") != null });
    showToast({ status: "positive", title: "Digest settings saved" });
  }

  return (
    <SettingsCard title="Digests" description="Rolled-up summaries, rather than one notification per event." onSave={handleSave}>
      <Setting label="Send a daily summary of unread notifications" type="toggle" name="dailyDigest" checked={values.dailyDigest} />
      <Setting label="Send a weekly summary of unread notifications" type="toggle" name="weeklyDigest" checked={values.weeklyDigest} />
    </SettingsCard>
  );
}

export function SettingsTab() {
  const [category, setCategory] = useState<CategoryId>("assignments");

  return (
    <div className="settings-layout">
      <div className="settings-list-pane">
        <SettingsCategoryNav categories={CATEGORIES} value={category} onChange={setCategory} />
      </div>

      <div className="settings-detail-pane">
        {category === "assignments" && <AssignmentsCard />}
        {category === "comments" && <CommentsCard />}
        {category === "requests" && <RequestsCard />}
        {category === "digests" && <DigestsCard />}
      </div>
    </div>
  );
}
