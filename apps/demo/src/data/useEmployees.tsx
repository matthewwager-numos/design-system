import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Employee } from "./employees";
import { loadEmployees, saveEmployees } from "./employees";

export type NewEmployee = Omit<Employee, "id">;

interface EmployeesContextValue {
  employees: Employee[];
  addEmployee: (employee: NewEmployee) => string;
  removeEmployee: (id: string) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
}

const EmployeesContext = createContext<EmployeesContextValue | null>(null);

/**
 * Single source of truth for the employees list, shared via context rather
 * than each consumer holding its own `useState`/localStorage copy — separate
 * copies (e.g. the Wizard's `addEmployee` and the table's own `employees`)
 * would otherwise go stale relative to each other, since neither remounts
 * when a sibling's copy changes.
 */
export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const nextId = useRef(100);

  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  function addEmployee(employee: NewEmployee) {
    const id = `e${nextId.current++}`;
    setEmployees((prev) => [...prev, { ...employee, id }]);
    return id;
  }

  function removeEmployee(id: string) {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  }

  function updateEmployee(id: string, patch: Partial<Employee>) {
    setEmployees((prev) => prev.map((employee) => (employee.id === id ? { ...employee, ...patch } : employee)));
  }

  return (
    <EmployeesContext.Provider value={{ employees, addEmployee, removeEmployee, updateEmployee }}>{children}</EmployeesContext.Provider>
  );
}

export function useEmployees(): EmployeesContextValue {
  const value = useContext(EmployeesContext);
  if (!value) throw new Error("useEmployees must be used within an EmployeesProvider");
  return value;
}
