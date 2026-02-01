import "react-native-url-polyfill/auto";
import Auth from "../../components/Auth";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // If there's a session, show sign out option (for debugging)
  // The _layout.tsx should redirect away from this page when authenticated
  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You are logged in as:</Text>
        <Text style={styles.text}>{session.user.email}</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    backgroundColor: "#000",
  },
  text: {
    marginTop: 20,
    color: "#fff",
    textAlign: "center",
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: "#dc2626",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
