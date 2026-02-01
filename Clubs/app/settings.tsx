import { StyleSheet, Switch, View } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
    const { toggleTheme, isDark } = useTheme();

    // Use theme colors for styling
    const containerBg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const itemBg = useThemeColor({ light: '#f9f9f9', dark: '#151718' }, 'background');
    const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Profile' }} />

            <View style={[styles.section, { backgroundColor: itemBg, borderColor }]}>
                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <ThemedText type="defaultSemiBold">Dark Mode</ThemedText>
                        <ThemedText style={styles.rowSubtext}>Use dark theme for the application</ThemedText>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#3c823c' }}
                        thumbColor={isDark ? '#fff' : '#f4f3f4'}
                    />
                </View>
            </View>

            <View style={styles.versionContainer}>
                <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowText: {
        flex: 1,
        paddingRight: 16,
    },
    rowSubtext: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    versionText: {
        fontSize: 12,
        opacity: 0.5,
    },
});
