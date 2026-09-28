import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  emailVerified?: string | null;
  createdAt?: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
}

interface AuthStore {
  user: UserProfile | null;
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: UserProfile | null, workspaces?: WorkspaceSummary[]) => void;
  setActiveWorkspace: (workspace: WorkspaceSummary | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, workspaces = []) =>
    set((state) => ({
      user,
      workspaces,
      activeWorkspace: state.activeWorkspace || workspaces[0] || null,
      isAuthenticated: !!user,
      isLoading: false,
    })),

  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),

  logout: () =>
    set({
      user: null,
      workspaces: [],
      activeWorkspace: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
