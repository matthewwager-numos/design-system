export type EmploymentType = "fulltime" | "parttime" | "contract";
export type EmployeeRole = "member" | "admin" | "owner";

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  employmentType: EmploymentType;
  role: EmployeeRole;
  notifyDigest: boolean;
  notifyMentions: boolean;
}

export const DEPARTMENT_OPTIONS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "people", label: "People" },
];

const SEED: Employee[] = [
  {
    id: "e1",
    fullName: "Maya Chen",
    email: "maya@numosai.com",
    jobTitle: "Product Designer",
    department: "design",
    employmentType: "fulltime",
    role: "admin",
    notifyDigest: true,
    notifyMentions: true,
  },
  {
    id: "e2",
    fullName: "Jordan Lee",
    email: "jordan@numosai.com",
    jobTitle: "Software Engineer",
    department: "engineering",
    employmentType: "fulltime",
    role: "member",
    notifyDigest: true,
    notifyMentions: false,
  },
  {
    id: "e3",
    fullName: "Priya Patel",
    email: "priya@numosai.com",
    jobTitle: "Account Executive",
    department: "sales",
    employmentType: "contract",
    role: "member",
    notifyDigest: false,
    notifyMentions: true,
  },
];

const STORAGE_KEY = "numosai-demo:employees";

export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function departmentLabel(value: string): string {
  return DEPARTMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
