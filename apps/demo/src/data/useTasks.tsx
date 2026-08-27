import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Task, TaskStage } from "./tasks";
import { loadTasks, saveTasks, nextTaskId } from "./tasks";

export type NewTask = Omit<Task, "id">;

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: NewTask) => string;
  /** Moves a task to a new stage, optionally patching other fields (assignee, review due date) in the same update — for drag-and-drop and the Assign/Review modals, which both need to change stage and a field atomically. */
  moveTask: (id: string, stage: TaskStage, patch?: Partial<Task>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

/** Same shape as `EmployeesProvider` — one shared list via context, persisted to localStorage, rather than each consumer (the board, the list view) holding its own copy that could drift out of sync. */
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(task: NewTask) {
    const id = nextTaskId();
    setTasks((prev) => [...prev, { ...task, id }]);
    return id;
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function moveTask(id: string, stage: TaskStage, patch?: Partial<Task>) {
    updateTask(id, { ...patch, stage });
  }

  return <TasksContext.Provider value={{ tasks, addTask, moveTask, updateTask }}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (!value) throw new Error("useTasks must be used within a TasksProvider");
  return value;
}
