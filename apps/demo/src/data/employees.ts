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

export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "fulltime", label: "Full-time" },
  { value: "parttime", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

export const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
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
  {
    id: "e4",
    fullName: "Alex Rivera",
    email: "alex@numosai.com",
    jobTitle: "Engineering Manager",
    department: "engineering",
    employmentType: "fulltime",
    role: "admin",
    notifyDigest: true,
    notifyMentions: true,
  },
  {
    id: "e5",
    fullName: "Sam Okafor",
    email: "sam@numosai.com",
    jobTitle: "Product Marketing Manager",
    department: "sales",
    employmentType: "fulltime",
    role: "member",
    notifyDigest: true,
    notifyMentions: false,
  },
  {
    id: "e6",
    fullName: "Taylor Kim",
    email: "taylor@numosai.com",
    jobTitle: "People Ops Specialist",
    department: "people",
    employmentType: "fulltime",
    role: "admin",
    notifyDigest: true,
    notifyMentions: true,
  },
  {
    id: "e7",
    fullName: "Morgan Diaz",
    email: "morgan@numosai.com",
    jobTitle: "UX Researcher",
    department: "design",
    employmentType: "parttime",
    role: "member",
    notifyDigest: false,
    notifyMentions: false,
  },
  {
    id: "e8",
    fullName: "Casey Nguyen",
    email: "casey@numosai.com",
    jobTitle: "Backend Engineer",
    department: "engineering",
    employmentType: "contract",
    role: "member",
    notifyDigest: true,
    notifyMentions: false,
  },
  {
    id: "e9",
    fullName: "Riley Thompson",
    email: "riley@numosai.com",
    jobTitle: "Recruiter",
    department: "people",
    employmentType: "parttime",
    role: "member",
    notifyDigest: false,
    notifyMentions: true,
  },
  {
    id: "e10",
    fullName: "Jamie Alvarez",
    email: "jamie@numosai.com",
    jobTitle: "VP of Sales",
    department: "sales",
    employmentType: "fulltime",
    role: "owner",
    notifyDigest: true,
    notifyMentions: true,
  },
  {
    id: "e11",
    fullName: "Drew Bennett",
    email: "drew@numosai.com",
    jobTitle: "Frontend Engineer",
    department: "engineering",
    employmentType: "fulltime",
    role: "member",
    notifyDigest: true,
    notifyMentions: false,
  },
  {
    id: "e12",
    fullName: "Skyler Brooks",
    email: "skyler@numosai.com",
    jobTitle: "HR Business Partner",
    department: "people",
    employmentType: "fulltime",
    role: "member",
    notifyDigest: true,
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

export function employmentTypeLabel(value: EmploymentType): string {
  return EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function roleLabel(value: EmployeeRole): string {
  return ROLE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
