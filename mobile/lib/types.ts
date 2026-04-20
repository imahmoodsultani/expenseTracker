export interface User {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  type: "PREDEFINED" | "CUSTOM";
  scope: "GLOBAL" | "PROJECT";
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  _count: { expenses: number };
}

export interface Expense {
  id: string;
  title: string;
  amount: string;
  date: string;
  description?: string;
  categoryId: string;
  category: Category;
  projectId?: string;
  project?: Project;
  isRecurring: boolean;
  recurrenceFrequency?: "WEEKLY" | "MONTHLY" | "YEARLY";
}

export interface AuthResponse {
  token: string;
  user: User;
}
