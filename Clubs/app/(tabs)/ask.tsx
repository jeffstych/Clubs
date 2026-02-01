import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { chatWithGemini, ChatMessage } from '@/lib/gemini';

import { useAuth } from '@/context/AuthContext';
import { getUserTags } from '@/lib/supabase';

export default function AskScreen() {
    const { session } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { text: "Hi! I can help you find clubs that match your interests. What are you looking for?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const [userTags, setUserTags] = useState<string[]>([]);
    
    // Prefetch user tags on mount
    useEffect(() => {
        if (session?.user?.id) {
            getUserTags(session.user.id).then(tags => {
                if (tags) setUserTags(tags);
            });
        }
    }, [session?.user?.id]);

    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const inputBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
    const greenText = useThemeColor({ light: '#2e632e', dark: '#2e632e' }, 'tint');
    const textColor = useThemeColor({ light: '#031103', dark: '#fff' }, 'text');
    const userMsgBg = useThemeColor({ light: '#2e632e', dark: '#fff' }, 'tint');
    const botMsgBg = useThemeColor({ light: '#f0f0f0', dark: '#1c1c1e' }, 'background');
    const iconColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userText = input.trim();
        setInput('');
        
        const userMessage = { text: userText, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const userId = session?.user?.id;
            console.log("AskScreen: handleSend called. UserId:", userId); // DEBUG LOG
            console.log("AskScreen: Current userTags state:", userTags); // DEBUG LOG
            
            // Critical optimization: Ensure we have tags BEFORE calling Gemini
            // This prevents the AI from falling back to a slow 2-step process
            let currentTags = userTags;
            if (userId && currentTags.length === 0) {
                 console.log("AskScreen: Tags missing, fetching now..."); // DEBUG LOG
                 const fetchedTags = await getUserTags(userId);
                 console.log("AskScreen: Fetched tags:", fetchedTags); // DEBUG LOG
                 if (fetchedTags && fetchedTags.length > 0) {
                     currentTags = fetchedTags;
                     setUserTags(fetchedTags); // Update state for next time
                 }
            } else {
                 console.log("AskScreen: Using existing tags:", currentTags); // DEBUG LOG
            }
            
            const responseText = await chatWithGemini(messages, userText, userId, currentTags);
            const botMessage = { text: responseText, isUser: false };
            setMessages(prev => [...prev, botMessage]);
        } catch (error: any) {
            console.error("AskScreen Error:", error);
            const errorMessage = error?.message || "Unknown error";
            setMessages(prev => [...prev, { text: `Sorry, I encountered an error: ${errorMessage}. Please try again.`, isUser: false }]);
        } finally {
            setIsThinking(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
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
                    
                    {isThinking && (
                        <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: botMsgBg }]}>
                             <ActivityIndicator size="small" color={textColor} />
                        </View>
                    )}
                </ScrollView>

                <View style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: cardBg,
                        paddingBottom: Math.max(insets.bottom, 20) + 70 
                    }
                ]}>
                    <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask about clubs..."
                            placeholderTextColor={textColor + '80'}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            editable={!isThinking}
                        />
                        <TouchableOpacity 
                            onPress={handleSend} 
                            disabled={!input.trim() || isThinking}
                            style={styles.sendButton}
                        >
                            <IconSymbol 
                                name="paperplane.fill" 
                                size={20} 
                                color={input.trim() && !isThinking ? greenText : iconColor} 
                            />
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
        flexGrow: 1,
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
        borderBottomRightRadius: 4,
    },
    botMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    inputWrapper: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        paddingLeft: 12,
        borderRadius: 24,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
        minHeight: 40,
    },
    sendButton: {
        padding: 10,
        borderRadius: 20,
    },
});

