import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Auth from "../../components/Auth";
import { View, Text, StyleSheet } from "react-native";
import { JwtPayload, Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Auth />
      {session && session.user && (
        <Text style={styles.text}>User ID: {session.user.id}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#000", // Ensure background is defined
  },
  text: {
    marginTop: 20,
    color: "#fff", // Ensure text is white to be visible
    textAlign: "center",
  },
});
