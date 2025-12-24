import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { checkAgentRequestStatus } from "../functions/supabase-actions/check-agent-request";

const supabase = createClient();

// =======================
// Tipos
// =======================
interface PlanoAgente {
  id: string;
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaques_permitidos: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  primeiro_nome: string;
  ultimo_nome: string;
  username?: string | null;
  telefone?: string | null;
  empresa?: string | null;
  licenca?: string | null;
  website?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  sobre_mim?: string | null;
  pacote_agente?: PlanoAgente | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
  current_agent_request_status?: string | null;
}

type UserStore = {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false, // 🚀 não começa preso em loading

      setUser: (user) => set({ user, isLoading: false }),

      fetchUserProfile: async (userId) => {
        set({ isLoading: true });
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select(`*, pacote_agente:planos_agente(*)`)
            .eq("id", userId)
            .single();

          if (error || !profile) throw error || new Error("Profile not found");

          const formattedUser: UserProfile = {
            id: userId,
            email: profile.email || "",
            primeiro_nome: profile.primeiro_nome || "",
            ultimo_nome: profile.ultimo_nome || "",
            username: profile.username || null,
            telefone: profile.telefone || null,
            empresa: profile.empresa || null,
            licenca: profile.licenca || null,
            website: profile.website || null,
            facebook: profile.facebook || null,
            linkedin: profile.linkedin || null,
            instagram: profile.instagram || null,
            youtube: profile.youtube || null,
            sobre_mim: profile.sobre_mim || null,
            pacote_agente: profile.pacote_agente || null,
            role: profile.role || null,
            avatar_url: profile.avatar_url || null,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            current_agent_request_status: null, // Initial value
          };

          // Fetch agent request status
          const requestStatus = await checkAgentRequestStatus(userId);
          formattedUser.current_agent_request_status = requestStatus;

          set({ user: formattedUser, isLoading: false });
          return formattedUser;
        } catch (err) {
          console.error("❌ Error fetching profile:", err);
          set({ user: null, isLoading: false });
          return null;
        }
      },

      updateUser: async (updates) => {
        const user = get().user;
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });

        try {
          await supabase.from("profiles").update(updates).eq("id", user.id);
        } catch (err) {
          console.error("❌ Error updating user:", err);
          set({ user }); // rollback
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, isLoading: false });
        } catch (err) {
          console.error("❌ Error signing out:", err);
        }
      },
    }),
    {
      name: "user-storage", // chave no localStorage
      partialize: (state) => ({ user: state.user }), // só persiste o user
      onRehydrateStorage: () => (state) => {
        // 🚀 Assim que o persist hidratar, desliga o loading
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
