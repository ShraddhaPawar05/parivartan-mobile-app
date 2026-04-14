import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, Modal, TextInput,
  KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection, query, where, onSnapshot, deleteDoc, doc,
  addDoc, updateDoc, increment, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';

interface Post {
  id: string;
  userId: string;
  userName: string;
  caption: string;
  imageUrl?: string;
  likes: number;
  likedBy: string[];
  commentCount: number;
  createdAt: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

const MyPostsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'communityPosts'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post)).sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const promptDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const deletePost = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'communityPosts', postToDelete));
      setShowDeleteModal(false);
      setPostToDelete(null);
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  useEffect(() => {
    if (!activePostId) return;
    const commentsRef = collection(db, 'communityPosts', activePostId, 'comments');
    const unsubscribe = onSnapshot(commentsRef, snapshot => {
      const fetchedComments = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Comment)).sort((a, b) => {
        const aTime = a.createdAt?.toDate?.().getTime() || new Date(a.createdAt).getTime();
        const bTime = b.createdAt?.toDate?.().getTime() || new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      setComments(fetchedComments);
    }, error => {
      console.error('Error loading comments:', error);
    });
    return () => unsubscribe();
  }, [activePostId]);

  const openComments = (postId: string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId || !user?.uid) return;
    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'communityPosts', activePostId, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'User',
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'communityPosts', activePostId), {
        commentCount: increment(1),
      });
      setCommentText('');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#10b981" size="large" />
          <Text style={styles.loadingText}>Loading your posts...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.header}>My Posts</Text>
          <View style={{ width: 36 }} />
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="post-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Share your recycling journey with the community!</Text>
            <TouchableOpacity
              style={styles.createPostBtn}
              onPress={() => navigation.navigate('Community')}
            >
              <Text style={styles.createPostText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>{post.userName?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.postUser}>{post.userName}</Text>
                  <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => promptDeletePost(post.id)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>

              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
              ) : null}

              <Text style={styles.postCaption}>{post.caption}</Text>

              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="heart" size={16} color="#ef4444" />
                  <Text style={styles.statText}>{post.likes || 0} likes</Text>
                </View>
                <TouchableOpacity style={styles.statItem} onPress={() => openComments(post.id)}>
                  <MaterialCommunityIcons name="comment-outline" size={16} color="#6b7280" />
                  <Text style={styles.statText}>{post.commentCount || 0} comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showCommentModal} transparent={false} animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.commentModalContainer}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={[styles.emptyText, { textAlign: 'center', paddingVertical: 24, color: '#111827' }]}>No comments yet. Be the first to reply.</Text>}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{item.userName?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentUser}>{item.userName}</Text>
                      <Text style={styles.commentTime}>{new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
              style={{ flex: 1, backgroundColor: '#fff' }}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                returnKeyType="send"
                onSubmitEditing={submitComment}
              />
              <TouchableOpacity onPress={submitComment} disabled={submittingComment} style={styles.sendBtn}>
                {submittingComment ? <ActivityIndicator color="#10b981" size="small" /> : <MaterialCommunityIcons name="send" size={22} color="#10b981" />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.actionOverlay}>
          <View style={styles.actionBox}>
            <Text style={styles.actionTitle}>Delete Post</Text>
            <Text style={styles.actionMessage}>This post will be permanently removed. Do you want to continue?</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={deletePost}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  header: { fontSize: 20, fontWeight: '900', color: '#111827' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  createPostBtn: { backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  createPostText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  postCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { fontWeight: '800', color: '#10b981', fontSize: 16 },
  postUser: { fontWeight: '700', color: '#111827' },
  postTime: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  menuBtn: { padding: 8 },
  postImage: { width: '100%', height: 200 },
  postCaption: { padding: 12, color: '#374151', fontSize: 14, lineHeight: 20 },
  postStats: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },

  commentModalContainer: { flex: 1, backgroundColor: '#fff' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  commentTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  commentItem: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 4 },
  commentAvatarText: { fontWeight: '800', color: '#10b981', fontSize: 14 },
  commentBody: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 },
  commentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  commentUser: { fontWeight: '700', color: '#111827', fontSize: 14 },
  commentTime: { fontSize: 11, color: '#6b7280' },
  commentText: { color: '#111827', fontSize: 14, lineHeight: 20 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb', padding: 12, backgroundColor: '#fff' },
  commentInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827' },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  actionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  actionBox: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 10 },
  actionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 10 },
  actionMessage: { color: '#4b5563', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionButton: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6' },
  deleteButton: { backgroundColor: '#ef4444' },
  cancelText: { color: '#374151', fontWeight: '700', fontSize: 15 },
  deleteText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default MyPostsScreen;