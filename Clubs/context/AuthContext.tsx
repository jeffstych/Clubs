import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  tookQuiz: boolean | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  tookQuiz: null,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tookQuiz, setTookQuiz] = useState<boolean | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('took_quiz')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setTookQuiz(false); // Default to false if error
      } else {
        setTookQuiz(data?.took_quiz ?? false);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setTookQuiz(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: starting session fetch');
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthProvider: getSession result', !!session);
      setSession(session);
      
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    }).catch(err => {
      console.error('AuthProvider: getSession error', err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthProvider: onAuthStateChange', _event, !!session);
      setSession(session);
      
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      } else {
        setTookQuiz(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, tookQuiz, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
