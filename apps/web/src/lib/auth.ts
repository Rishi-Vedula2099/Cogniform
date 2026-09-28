export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
