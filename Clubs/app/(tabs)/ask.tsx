import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
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
            text: `Hi! I can help you find clubs that match your interests. What are you looking for?`,
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const bgColor = useThemeColor({ light: '#f9fafb', dark: '#0a0a0a' }, 'background');
    const userBubbleColor = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');
    const botBubbleColor = useThemeColor({ light: '#ffffff', dark: '#1f1f1f' }, 'background');
    const inputBgColor = useThemeColor({ light: '#ffffff', dark: '#1f1f1f' }, 'background');
    const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#2f2f2f' }, 'icon');

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

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm your AI assistant! I'll help you explore clubs on campus.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: bgColor }]}
            keyboardVerticalOffset={90}
        >
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
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
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.inputContainer, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
                <View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: borderColor }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about clubs..."
                        placeholderTextColor="#9ca3af"
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
                        <IconSymbol name="paperplane.fill" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        marginBottom: 20,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
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
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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
