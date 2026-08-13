import { useState } from "react";
import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { X } from "lucide-react";
import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Form,
  FormBody,
  FormFooter,
  FormHeader,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedControlOption,
  Select,
  TextInput,
  Toggle,
} from "@numosai/ui";

const meta: Meta<typeof Form> = {
  title: "Components/Form",
  component: Form,
  // No "autodocs" tag — Form.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Form>;

// Every field below is a real form control (TextInput/Select/CheckboxGroup/
// RadioGroup/SegmentedControl/Toggle all render real <input>s or a hidden
// one) — submitting logs the actual collected FormData, not a stand-in.
function ExampleForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(JSON.stringify(Object.fromEntries(data), null, 2));
  }

  return (
    <div style={{ width: "22rem" }}>
      <Form onSubmit={handleSubmit}>
        <FormHeader
          actions={
            <button
              type="button"
              aria-label="Close"
              style={{ display: "flex", border: "none", background: "none", borderRadius: "var(--radius-full)", padding: "var(--space-1)", color: "var(--content-subtle)", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          }
        >
          New project
        </FormHeader>
        <FormBody>
          <TextInput name="name" label="Name" size="md" placeholder="Q3 roadmap" />
          <TextInput name="owner" label="Owner" size="md" placeholder="Maya Chen" />
          <Select
            name="team"
            label="Team"
            size="md"
            placeholder="Select a team"
            options={[
              { value: "design", label: "Design" },
              { value: "engineering", label: "Engineering" },
              { value: "product", label: "Product" },
            ]}
          />
          <CheckboxGroup label="Notify">
            <Checkbox name="notify" value="comments" label="Comments" defaultChecked />
            <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
            <Checkbox name="notify" value="digest" label="Weekly digest" />
          </CheckboxGroup>
          <RadioGroup name="visibility" label="Visibility" defaultValue="team">
            <Radio value="private" label="Private" />
            <Radio value="team" label="Team" />
            <Radio value="public" label="Public" />
          </RadioGroup>
          <SegmentedControl name="priority" defaultValue="medium">
            <SegmentedControlOption value="low">Low</SegmentedControlOption>
            <SegmentedControlOption value="medium">Medium</SegmentedControlOption>
            <SegmentedControlOption value="high">High</SegmentedControlOption>
          </SegmentedControl>
          <Toggle name="archived" label="Archive when complete" />
        </FormBody>
        <FormFooter
          secondaryAction={
            <Button variant="link" type="reset">
              Reset
            </Button>
          }
        >
          <ButtonGroup>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </ButtonGroup>
        </FormFooter>
      </Form>
      {submitted && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "var(--background-element)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            overflow: "auto",
          }}
        >
          {submitted}
        </pre>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <ExampleForm />,
};

export const TitleOnly: Story = {
  name: "Title only (no header actions)",
  render: () => (
    <div style={{ width: "22rem" }}>
      <Form>
        <FormHeader>Delete project</FormHeader>
        <FormBody>
          <p style={{ margin: 0, font: "var(--type-paragraph-m-regular)", color: "var(--content-base)" }}>
            This can't be undone. Type the project name to confirm.
          </p>
          <TextInput name="confirm" label="Project name" size="md" placeholder="Q3 roadmap" />
        </FormBody>
        <FormFooter>
          <ButtonGroup>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="destructive" type="submit">
              Delete
            </Button>
          </ButtonGroup>
        </FormFooter>
      </Form>
    </div>
  ),
};
