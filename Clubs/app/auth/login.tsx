import "react-native-url-polyfill/auto";
import Auth from "../../components/Auth";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../lib/supabase";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LoginScreen() {
  const { session } = useAuth();
  const tintColor = useThemeColor({}, 'tint');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText type="subtitle">You are logged in as:</ThemedText>
          <ThemedText style={styles.emailText}>{session.user.email}</ThemedText>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: '#dc2626' }]}
            onPress={handleSignOut}
          >
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: tintColor + '20' }]}>
          <IconSymbol name="leaf.fill" size={40} color={tintColor} />
        </View>
        <ThemedText type="title" style={styles.title}>Clubs</ThemedText>
        <ThemedText style={styles.subtitle}>Discover your community at MSU</ThemedText>
      </View>
      <Auth />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emailText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
