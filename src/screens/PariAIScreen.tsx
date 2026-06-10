import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage, sendMessage } from '../services/geminiService';
import { SUGGESTED_PROMPTS } from '../services/localKnowledgeBase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message extends ChatMessage {
  id: string;
}

const PariAIScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const getHistory = (msgs: Message[]): ChatMessage[] =>
    msgs.map(({ role, text }) => ({ role, text }));

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text: trimmed };
    const historySnapshot = getHistory(messages);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendMessage(historySnapshot, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'model', text: reply },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#10b981', '#059669']} start={[0, 0]} end={[1, 0]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons name="leaf" size={18} color="#fff" />
            <Text style={styles.headerTitle}> Pari AI Assistant</Text>
          </View>
          <Text style={styles.headerSub}>Ask anything about waste management</Text>
        </View>
        <View style={styles.headerOnline}>
          <View style={styles.onlineDot} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.welcome}>
                <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={styles.welcomeIconWrap}>
                  <MaterialCommunityIcons name="leaf" size={40} color="#10b981" />
                </LinearGradient>
                <Text style={styles.welcomeTitle}>Hi, I'm Pari! 🌱</Text>
                <Text style={styles.welcomeSubtitle}>
                  Your smart waste management assistant.{'\n'}Ask me anything about recycling & sustainability.
                </Text>
                <Text style={styles.promptsLabel}>Try asking:</Text>
                <View style={styles.promptsGrid}>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <TouchableOpacity
                      key={p.text}
                      style={styles.promptChip}
                      onPress={() => handleSend(p.text)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.promptText}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[
              styles.rowWrap,
              item.role === 'user' ? styles.rowRight : styles.rowLeft,
            ]}>
              {item.role === 'model' && (
                <View style={styles.avatarCircle}>
                  <MaterialCommunityIcons name="leaf" size={14} color="#fff" />
                </View>
              )}
              <View style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}>
                {item.role === 'model' && (
                  <Text style={styles.aiLabel}>Pari</Text>
                )}
                <Text style={[
                  styles.bubbleText,
                  item.role === 'user' ? styles.userText : styles.aiText,
                ]}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={styles.rowLeft}>
                <View style={styles.avatarCircle}>
                  <MaterialCommunityIcons name="leaf" size={14} color="#fff" />
                </View>
                <View style={styles.aiBubble}>
                  <Text style={styles.aiLabel}>Pari</Text>
                  <View style={styles.typingDots}>
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text style={styles.typingText}> thinking…</Text>
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask about waste management…"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => handleSend(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={(!input.trim() || loading) ? ['#d1d5db', '#d1d5db'] : ['#34d399', '#10b981']}
              style={styles.sendGradient}
            >
              <Feather name="send" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0fdf4' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  headerOnline: { width: 36, alignItems: 'center' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#a7f3d0', borderWidth: 2, borderColor: '#fff' },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },

  welcome: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 8 },
  welcomeIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#065f46', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  promptsLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 12, letterSpacing: 0.5 },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: SCREEN_WIDTH - 32,
  },
  promptChip: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#10b981',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  promptText: { color: '#065f46', fontSize: 13, fontWeight: '600' },

  rowWrap: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },

  bubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
    shadowColor: '#10b981',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  aiLabel: { fontSize: 10, fontWeight: '800', color: '#10b981', marginBottom: 3, letterSpacing: 0.3 },

  bubbleText: { fontSize: 14, lineHeight: 21 },
  userText: { color: '#fff', fontWeight: '500' },
  aiText: { color: '#1f2937' },

  typingDots: { flexDirection: 'row', alignItems: 'center' },
  typingText: { color: '#6b7280', fontSize: 13 },

  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
    marginHorizontal: 2,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: '#111827',
    maxHeight: 110,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 1,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PariAIScreen;
