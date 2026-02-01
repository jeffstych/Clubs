import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#E8E8E8', dark: '#2E2E2E' }, 'icon');
  const buttonTextColor = useThemeColor({ light: '#ffffff', dark: '#031103' }, 'background');

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session && !error)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="#86939e"
          autoCapitalize="none"
          style={[styles.input, { borderColor, color: textColor }]}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="#86939e"
          autoCapitalize="none"
          style={[styles.input, { borderColor, color: textColor }]}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }, loading && styles.buttonDisabled]}
          onPress={() => signInWithEmail()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={buttonTextColor} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>Sign in</ThemedText>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          style={[styles.outlineButton, { borderColor: tintColor }, loading && styles.buttonDisabled]}
          onPress={() => signUpWithEmail()}
          disabled={loading}
        >
          <ThemedText style={[styles.outlineButtonText, { color: tintColor }]}>Create Account</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
