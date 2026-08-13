import { useState } from "react";
import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Setting, SettingsCard } from "@numosai/ui";

const meta: Meta<typeof SettingsCard> = {
  title: "Components/SettingsCard",
  component: SettingsCard,
  // No "autodocs" tag — SettingsCard.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SettingsCard>;

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const NOTIFY_OPTIONS = [
  { value: "digest", label: "Weekly digest" },
  { value: "mentions", label: "Mentions" },
  { value: "comments", label: "Comments" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "fulltime", label: "Full-time" },
  { value: "parttime", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

function ObjectSettingsExample() {
  const [values, setValues] = useState({
    name: "Maya Chen",
    bio: "Product designer focused on data-heavy tools.",
    role: "admin",
    employmentType: "fulltime",
    notify: ["digest", "mentions"] as string[],
    storage: "75",
    twoFactor: true,
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setValues({
      name: String(data.get("name") ?? ""),
      bio: String(data.get("bio") ?? ""),
      role: String(data.get("role") ?? ""),
      employmentType: String(data.get("employmentType") ?? ""),
      notify: data.getAll("notify").map(String),
      storage: String(data.get("storage") ?? "0"),
      twoFactor: data.get("twoFactor") != null,
    });
  }

  return (
    <div style={{ width: "45rem", maxWidth: "100%" }}>
      <SettingsCard title="Object Settings" description="This is a brief description about the object" onSave={handleSave}>
        <Setting label="Name" type="text" name="name" value={values.name} />
        <Setting label="Bio" type="textarea" name="bio" value={values.bio} />
        <Setting label="Role" type="select" name="role" value={values.role} options={ROLE_OPTIONS} />
        <Setting label="Employment type" type="radio" name="employmentType" value={values.employmentType} options={EMPLOYMENT_OPTIONS} />
        <Setting label="Notifications" type="checkbox" name="notify" values={values.notify} options={NOTIFY_OPTIONS} />
        <Setting label="Storage used" type="slider" name="storage" value={values.storage} />
        <Setting label="Two-factor authentication" type="toggle" name="twoFactor" checked={values.twoFactor} />
        <Setting label="Plan" type="segmentedControl" name="plan" value="fulltime" options={EMPLOYMENT_OPTIONS} />
      </SettingsCard>
    </div>
  );
}

export const Default: Story = {
  name: "Object Settings",
  render: () => <ObjectSettingsExample />,
};

export const EditingByDefault: Story = {
  name: "Editing (open by default)",
  render: () => (
    <div style={{ width: "45rem", maxWidth: "100%" }}>
      <SettingsCard title="Object Settings" description="This is a brief description about the object" defaultEditing onSave={() => {}}>
        <Setting label="Name" type="text" name="name" value="Maya Chen" />
        <Setting label="Role" type="select" name="role" value="admin" options={ROLE_OPTIONS} />
      </SettingsCard>
    </div>
  ),
};
