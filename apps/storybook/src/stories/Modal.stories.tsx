import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter, Select, TextInput } from "@numosai/ui";
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
    variant: { control: "select", options: ["default", "drawer"] },
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
