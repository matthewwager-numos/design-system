import { useState } from "react";
import type { DragEvent, ReactNode } from "react";
import { GripHorizontal, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../DropdownMenu";
import { IconButton } from "../IconButton";
import "./DragList.css";

export interface DragListItem {
  id: string;
  label: ReactNode;
}

export interface DragListAddOption {
  value: string;
  label: ReactNode;
}

export interface DragListProps {
  items: DragListItem[];
  /** Called with the full list in its new order once a drag-and-drop reorder completes. */
  onReorder: (items: DragListItem[]) => void;
  /** Omit to hide every row's hover delete button. */
  onRemove?: (id: string) => void;
  /** Options offered by the "Add item" button's dropdown. Omit (or leave empty) to hide that button entirely — e.g. once every option has already been added. */
  addOptions?: DragListAddOption[];
  onAddOption?: (value: string) => void;
  className?: string;
}

/**
 * A reorderable list — drag any row by its grip handle to move it, hover a
 * row to reveal its own delete button, and (if `addOptions` is given) add
 * more rows from a dropdown at the bottom. Matches Figma's ListItem exactly
 * across its 4 states: Default, Hover (reveals the delete button), Active
 * (the row actually being dragged — bigger shadow, no delete button, since
 * a row you're mid-drag can't also be individually deleted), and Target
 * (the dashed "Drop here" placeholder shown in place of whichever row a
 * drag is currently over, marking where it'll land on drop).
 *
 * Built on the native HTML5 drag-and-drop API — no drag library dependency
 * — the same technique the demo app's own kanban board already uses. Same
 * inherent limitation as that board: native drag-and-drop has no keyboard
 * equivalent, so reordering itself is mouse/touch-only (the delete button
 * and the add dropdown remain fully keyboard operable either way).
 */
export function DragList({ items, onReorder, onRemove, addOptions = [], onAddOption, className }: DragListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDragStart(event: DragEvent<HTMLDivElement>, id: string) {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, id: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (id !== draggedId && id !== overId) setOverId(id);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
    setOverId(null);
    setDraggedId(null);
    if (!sourceId || sourceId === targetId) return;
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved!);
    onReorder(next);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setOverId(null);
  }

  return (
    <div className={clsx("ds-drag-list", className)}>
      {items.map((item) => {
        const isDragged = item.id === draggedId;
        const isTarget = item.id === overId && !isDragged;

        if (isTarget) {
          return (
            <div
              key={item.id}
              className="ds-drag-list__item ds-drag-list__item--target"
              onDragOver={(event) => handleDragOver(event, item.id)}
              onDrop={(event) => handleDrop(event, item.id)}
            >
              Drop here
            </div>
          );
        }

        return (
          <div
            key={item.id}
            className={clsx("ds-drag-list__item", isDragged && "ds-drag-list__item--active")}
            draggable
            onDragStart={(event) => handleDragStart(event, item.id)}
            onDragOver={(event) => handleDragOver(event, item.id)}
            onDrop={(event) => handleDrop(event, item.id)}
            onDragEnd={handleDragEnd}
          >
            <GripHorizontal size={16} className="ds-drag-list__grip" aria-hidden />
            <span className="ds-drag-list__label">{item.label}</span>
            {onRemove && !isDragged && (
              <button type="button" className="ds-drag-list__remove" onClick={() => onRemove(item.id)} aria-label="Remove item">
                <X size={16} aria-hidden />
              </button>
            )}
          </div>
        );
      })}

      {addOptions.length > 0 && (
        <DropdownMenu size="sm">
          <DropdownMenuTrigger>
            <IconButton icon={<Plus size={16} />} variant="ghost" size="sm" aria-label="Add item" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {addOptions.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => onAddOption?.(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
