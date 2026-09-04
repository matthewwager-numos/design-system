import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "@numosai/ui";
import type { FileUploadState, FileUploadVariant } from "@numosai/ui";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  argTypes: {
    variant: {
      control: "select",
      options: ["dropzone", "link"],
    },
    state: {
      control: "select",
      options: ["empty", "loading", "complete", "error"],
    },
    progress: { control: { type: "range", min: 0, max: 100 } },
    filename: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "dropzone",
    state: "empty",
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Empty: Story = {};

export const EmptyLink: Story = {
  name: "Empty (link variant)",
  args: { variant: "link" },
};

export const Loading: Story = {
  args: { state: "loading", progress: 65 },
};

export const LoadingLink: Story = {
  name: "Loading (link variant)",
  args: { variant: "link", state: "loading", progress: 40 },
};

export const Complete: Story = {
  args: { state: "complete", filename: "invoice-march.pdf" },
};

export const CompleteLink: Story = {
  name: "Complete (link variant)",
  args: { variant: "link", state: "complete", filename: "invoice-march.pdf" },
};

export const Error: Story = {
  args: { state: "error" },
};

export const ErrorLink: Story = {
  name: "Error (link variant)",
  args: { variant: "link", state: "error" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  name: "Every state, both variants",
  render: () => {
    const states: FileUploadState[] = ["empty", "loading", "complete", "error"];
    return (
      <div style={{ display: "flex", gap: "var(--space-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
          <p style={{ margin: 0, font: "var(--type-paragraph-s-medium)", color: "var(--content-subtle)" }}>Dropzone</p>
          {states.map((state) => (
            <FileUpload key={state} variant="dropzone" state={state} progress={65} filename="invoice-march.pdf" />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
          <p style={{ margin: 0, font: "var(--type-paragraph-s-medium)", color: "var(--content-subtle)" }}>Link</p>
          {states.map((state) => (
            <FileUpload key={state} variant="link" state={state} progress={65} filename="invoice-march.pdf" />
          ))}
        </div>
      </div>
    );
  },
};

// A real (fake-network) upload flow: dropping or browsing a file moves
// empty → loading (a real interval driving `progress`) → complete, and a
// forced failure demonstrates error → "Try again" going straight back to
// loading rather than back to empty.
function UploadDemo({ variant = "dropzone", failFirst = false }: { variant?: FileUploadVariant; failFirst?: boolean }) {
  const [state, setState] = useState<FileUploadState>("empty");
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState("");
  const failedOnce = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  function startUpload(name: string) {
    setFilename(name);
    setState("loading");
    setProgress(0);
  }

  useEffect(() => {
    if (state !== "loading") return;
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(timerRef.current);
          if (failFirst && !failedOnce.current) {
            failedOnce.current = true;
            setState("error");
          } else {
            setState("complete");
          }
          return 100;
        }
        return next;
      });
    }, 300);
    return () => clearInterval(timerRef.current);
  }, [state, failFirst]);

  function handleFilesSelected(files: FileList) {
    startUpload(files[0]?.name ?? "file");
  }

  return (
    <FileUpload
      variant={variant}
      state={state}
      progress={progress}
      filename={filename}
      onFilesSelected={handleFilesSelected}
      onRemove={() => {
        setState("empty");
        setFilename("");
      }}
      onRetry={() => startUpload(filename)}
    />
  );
}

export const UploadFlow: Story = {
  name: "A real upload flow (browse or drop a file)",
  render: () => <UploadDemo />,
};

export const UploadFlowWithFailure: Story = {
  name: "Upload flow, first attempt fails",
  render: () => <UploadDemo failFirst />,
};
