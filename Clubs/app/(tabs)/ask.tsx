import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export default function AskScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I can help you find clubs that match your interests. What are you looking for?",
            isUser: false,
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const inputBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
    const userBubbleColor = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');
    const botBubbleColor = useThemeColor({ light: '#ffffff', dark: '#1f1f1f' }, 'background');
    const borderColor = useThemeColor({ light: 'rgba(128, 128, 128, 0.2)', dark: 'rgba(128, 128, 128, 0.2)' }, 'icon');
    const textColor = useThemeColor({ light: '#031103', dark: '#fff' }, 'text');

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');

        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm a demo chatbot! In a real implementation, I would analyze your interests and recommend specific clubs.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 800);
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.messagesContainer}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <ThemedText type="title" style={styles.title}>Ask</ThemedText>
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageBubble,
                                message.isUser ? styles.userBubble : styles.botBubble,
                                {
                                    backgroundColor: message.isUser ? userBubbleColor : botBubbleColor,
                                    alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                                },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.messageText,
                                    { color: message.isUser ? '#ffffff' : undefined },
                                ]}
                            >
                                {message.text}
                            </ThemedText>
                            <Text style={[styles.timestamp, { color: message.isUser ? 'rgba(255,255,255,0.7)' : '#9ca3af' }]}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: cardBg,
                        borderTopColor: borderColor,
                        paddingBottom: Math.max(insets.bottom, 20) + 70 // Clear the floating tabs
                    }
                ]}>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: borderColor }]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Ask about clubs..."
                            placeholderTextColor={textColor + '80'}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: inputText.trim() ? userBubbleColor : '#d1d5db',
                                    opacity: inputText.trim() ? 1 : 0.5,
                                }
                            ]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <IconSymbol name="arrow.up" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
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
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    botBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
