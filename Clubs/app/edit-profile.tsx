import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function EditProfileScreen() {
    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Edit Profile",
                    headerBackTitle: "Back",
                }}
            />
            <View style={styles.content}>
                <ThemedText>Edit Profile page is coming soon.</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
