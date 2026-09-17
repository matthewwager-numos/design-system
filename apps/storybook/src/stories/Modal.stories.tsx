import { useState } from "react";
import { Paperclip } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, Banner, Button, ButtonGroup, Checkbox, Header, Modal, ModalBody, ModalFooter, Select, TextInput, Textarea, Toggle } from "@numosai/ui";
import type { ModalSide, ModalVariant } from "@numosai/ui";

interface ModalPlaygroundArgs {
  variant: ModalVariant;
  side: ModalSide;
  closeOnOverlayClick: boolean;
}

function ModalPlayground({ variant, side, closeOnOverlayClick }: ModalPlaygroundArgs) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project…</Button>
      <Modal open={open} onOpenChange={setOpen} variant={variant} side={side} closeOnOverlayClick={closeOnOverlayClick}>
        <Header variant="modal" title="Delete project" onClose={() => setOpen(false)} />
        <ModalBody>
          <p style={{ margin: 0, font: "var(--type-paragraph-m-regular)", color: "var(--content-base)" }}>
            This can't be undone. Are you sure you want to delete "Q3 roadmap"?
          </p>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  );
}

const meta: Meta<typeof ModalPlayground> = {
  title: "Components/Modal",
  component: ModalPlayground,
  // No "autodocs" tag — Modal.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["default", "drawer", "fullscreen"] },
    side: { control: "select", options: ["top", "right", "bottom", "left"], if: { arg: "variant", eq: "drawer" } },
    closeOnOverlayClick: { control: "boolean" },
  },
  args: {
    variant: "default",
    side: "right",
    closeOnOverlayClick: true,
  },
};

export default meta;
type Story = StoryObj<typeof ModalPlayground>;

export const Default: Story = {};

export const Drawer: Story = {
  args: { variant: "drawer", side: "right" },
};

export const DrawerLeft: Story = {
  name: 'side="left"',
  args: { variant: "drawer", side: "left" },
};

export const DrawerTop: Story = {
  name: 'side="top"',
  args: { variant: "drawer", side: "top" },
};

export const DrawerBottom: Story = {
  name: 'side="bottom"',
  args: { variant: "drawer", side: "bottom" },
};

export const ManualClose: Story = {
  name: "closeOnOverlayClick={false}",
  args: { closeOnOverlayClick: false },
};

export const Fullscreen: Story = {
  args: { variant: "fullscreen" },
};

export const WithFormFields: Story = {
  name: "With form fields",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>New project…</Button>
          <Modal open={open} onOpenChange={setOpen} variant="default">
            <Header variant="modal" title="New project" onClose={() => setOpen(false)} />
            <ModalBody>
              <TextInput label="Name" size="md" placeholder="Q3 roadmap" />
              <Select
                label="Team"
                size="md"
                placeholder="Select a team"
                options={[
                  { value: "design", label: "Design" },
                  { value: "engineering", label: "Engineering" },
                ]}
              />
            </ModalBody>
            <ModalFooter>
              <ButtonGroup>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  Create
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};

interface ReviewItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  person: string;
  message: string;
  reply: string;
  attachment?: string;
}

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "1",
    title: "Notify Acme Corp — contract renewal",
    subtitle: "Contract #4471",
    description: "Acme's annual contract renews in 14 days — a renewal notice is queued to send.",
    person: "Jordan Lee",
    message: "Can we hold this until legal signs off?",
    reply: "Hi Jordan,\n\nHolding for now — I'll send once legal confirms.\n\nThanks,",
    attachment: "Contract-4471.pdf",
  },
  {
    id: "2",
    title: "Notify Brightside LLC — contract renewal",
    subtitle: "Contract #4502",
    description: "Brightside's annual contract renews in 9 days — a renewal notice is queued to send.",
    person: "Priya Patel",
    message: "Approved, please proceed.",
    reply: "Hi Priya,\n\nThanks — sending the notice now.\n\nBest,",
  },
  {
    id: "3",
    title: "Notify Delacroix Studio — contract renewal",
    subtitle: "Contract #4519",
    description: "Delacroix's annual contract renews in 21 days — a renewal notice is queued to send.",
    person: "Sam Rivera",
    message: "",
    reply: "",
  },
];

/**
 * A full-screen List & Detail review: the whole modal is one dismissible
 * unit (only the header's own × closes it — the detail pane has none of its
 * own), the detail is always showing something (defaults to the first row,
 * never "nothing focused"), and the select-all/count sits pinned to the top
 * of the list pane while its rows scroll beneath it.
 */
function FullscreenListDetailDemo() {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(REVIEW_ITEMS.map((item) => item.id));
  const [focusedId, setFocusedId] = useState(REVIEW_ITEMS[0]!.id);
  const focused = REVIEW_ITEMS.find((item) => item.id === focusedId)!;

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Send 3 contract renewal notices…</Button>
      <Modal open={open} onOpenChange={setOpen} variant="fullscreen">
        <Header variant="modal" title={`Send ${selectedIds.length} contract renewal notices`} onClose={() => setOpen(false)} />

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "20rem",
              flexShrink: 0,
              borderRight: "1px solid var(--border-subtle)",
              background: "var(--background-secondary)",
            }}
          >
            {/* Pinned — doesn't scroll with the rows below it. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-4)",
                borderBottom: "1px solid var(--border-subtle)",
                flexShrink: 0,
              }}
            >
              <Checkbox
                checked={selectedIds.length === REVIEW_ITEMS.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < REVIEW_ITEMS.length}
                onChange={(event) => setSelectedIds(event.target.checked ? REVIEW_ITEMS.map((item) => item.id) : [])}
                aria-label="Select all"
              />
              <span style={{ font: "var(--type-paragraph-s-medium)", color: "var(--content-subtle)" }}>
                {selectedIds.length} of {REVIEW_ITEMS.length} selected
              </span>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {REVIEW_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFocusedId(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                    width: "100%",
                    padding: "var(--space-3) var(--space-4)",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: item.id === focusedId ? "var(--background-selected)" : "var(--background-default)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span onClick={(event) => event.stopPropagation()}>
                    <Checkbox checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} aria-label={`Select ${item.title}`} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.125rem", minWidth: 0 }}>
                    <span
                      style={{
                        font: "var(--type-paragraph-s-medium)",
                        color: "var(--content-emphasis)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </span>
                    <span style={{ font: "var(--type-paragraph-xs-regular)", color: "var(--content-subtle)" }}>{item.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Always shows the focused item — no close button of its own,
              since the modal's own header × is the only way to dismiss. */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                borderBottom: "1px solid var(--border-disabled)",
                flexShrink: 0,
              }}
            >
              <div>
                <p style={{ margin: 0, font: "var(--type-heading-m)", color: "var(--content-emphasis)" }}>{focused.title}</p>
                <p style={{ margin: 0, font: "var(--type-paragraph-s-regular)", color: "var(--content-subtle)" }}>{focused.subtitle}</p>
              </div>
              <Toggle label="Include" labelPlacement="left" size="md" checked={selectedIds.includes(focused.id)} onChange={() => toggle(focused.id)} />
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Banner status="info" title="AI Summary" description={focused.description} />
              {focused.message && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Avatar name={focused.person} size="sm" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ font: "var(--type-paragraph-s-medium)", color: "var(--content-emphasis)" }}>{focused.person}</span>
                    <span style={{ font: "var(--type-paragraph-xs-regular)", color: "var(--content-subtle)" }}>{focused.message}</span>
                  </div>
                </div>
              )}
              <Textarea value={focused.reply} readOnly rows={6} aria-label="Reply" />
              {focused.attachment && (
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Paperclip size={16} style={{ color: "var(--content-link-default)" }} aria-hidden />
                  <span style={{ font: "var(--type-paragraph-s-regular)", color: "var(--content-link-default)" }}>{focused.attachment}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Send {selectedIds.length} notices
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  );
}

export const FullscreenListDetail: Story = {
  name: "Fullscreen — List & Detail review",
  render: () => <FullscreenListDetailDemo />,
};
