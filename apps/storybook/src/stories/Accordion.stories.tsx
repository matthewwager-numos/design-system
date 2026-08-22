import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionItem } from "@numosai/ui";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  // No "autodocs" tag — Accordion.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const PREVIEW_STYLE = { width: "36rem", maxWidth: "100%" };

export const Default: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Accordion>
        <AccordionItem title="What's included in the free plan?" defaultExpanded>
          Every workspace gets unlimited members, up to 3 projects, and 5GB of storage — no credit card required.
        </AccordionItem>
        <AccordionItem title="Can I change plans later?">
          Yes — upgrade or downgrade at any time from Settings → Billing. Changes take effect on your next billing cycle.
        </AccordionItem>
        <AccordionItem title="Do you offer refunds?">
          We offer a full refund within 14 days of any paid plan purchase, no questions asked.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const AllCollapsed: Story = {
  name: "All collapsed",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Accordion>
        {Array.from({ length: 4 }, (_, i) => (
          <AccordionItem key={i} title={`Section ${i + 1}`}>
            Panel content for section {i + 1}.
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Exclusive: Story = {
  name: "exclusive (only one open at a time)",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Accordion exclusive>
        <AccordionItem title="What's included in the free plan?" defaultExpanded>
          Every workspace gets unlimited members, up to 3 projects, and 5GB of storage — no credit card required.
        </AccordionItem>
        <AccordionItem title="Can I change plans later?">
          Yes — upgrade or downgrade at any time from Settings → Billing. Changes take effect on your next billing cycle.
        </AccordionItem>
        <AccordionItem title="Do you offer refunds?">
          We offer a full refund within 14 days of any paid plan purchase, no questions asked.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
