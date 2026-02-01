import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AskScreen() {
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
        { text: "Hi! I can help you find clubs that match your interests. What are you looking for?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();

    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const inputBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
    const greenText = useThemeColor({ light: '#2e632e', dark: '#2e632e' }, 'tint');
    const textColor = useThemeColor({ light: '#031103', dark: '#fff' }, 'text');
    const userMsgBg = useThemeColor({ light: '#2e632e', dark: '#fff' }, 'tint');
    const botMsgBg = useThemeColor({ light: '#f0f0f0', dark: '#1c1c1e' }, 'background');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const botResponse = {
                text: "I'm a demo chatbot. In a full version, I would analyze your interests and recommend clubs like Robotics Team, Debate Club, or others based on what you're looking for!",
                isUser: false
            };
            setMessages(prev => [...prev, botResponse]);
        }, 500);

        setInput('');
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.messagesContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedText type="title" style={styles.title}>Ask</ThemedText>
                    {messages.map((msg, index) => {
                        let textStyle = { color: textColor };
                        if (msg.isUser) {
                            textStyle = { color: colorScheme === 'dark' ? '#031103' : '#fff' };
                        } else {
                            textStyle = { color: colorScheme === 'dark' ? '#fff' : '#031103' };
                        }

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.messageBubble,
                                    msg.isUser ? styles.userMessage : styles.botMessage,
                                    { backgroundColor: msg.isUser ? userMsgBg : botMsgBg }
                                ]}
                            >
                                <ThemedText style={[styles.messageText, textStyle]}>
                                    {msg.text}
                                </ThemedText>
                            </View>
                        );
                    })}
                </ScrollView>

                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: cardBg,
                        paddingBottom: Math.max(insets.bottom, 20) + 70 // Added 70 to clear the floating tabs
                    }
                ]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask about clubs..."
                        placeholderTextColor={textColor + '80'}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        marginBottom: 16,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    input: {
        padding: 12,
        borderRadius: 20,
        fontSize: 15,
    },
});

