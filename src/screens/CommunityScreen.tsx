import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  Image, TextInput, Modal, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, doc, increment, serverTimestamp, limit, deleteDoc, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

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
  badge?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

interface LeaderUser {
  id: string;
  name: string;
  postCount: number;
}

const QUOTES = [
  'Small actions create big impact ♻️',
  'Your waste can become someone\'s resource 🌱',
  'Together, we build a cleaner future 🌍',
  'Every small step counts towards a greener planet 🌿',
  'Recycle today for a better tomorrow ✨',
];

const AWARENESS_POSTS = [
  { id: 'sys1', badge: '♻️ Tip', caption: 'Segregate your waste at source: wet, dry, and hazardous. It makes recycling 3x more efficient!' },
  { id: 'sys2', badge: '🌍 Fact', caption: 'Only 9% of all plastic ever produced has been recycled. Your actions make a real difference.' },
  { id: 'sys3', badge: '📦 Guide', caption: 'Flatten cardboard boxes before recycling — it saves 60% more space in collection vehicles.' },
];

const CommunityScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showCommentActionModal, setShowCommentActionModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userName, setUserName] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Rotate quotes every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      setQuoteIdx(i => (i + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load user name
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) setUserName(snap.data().fullName || 'User');
    });
    return () => unsub();
  }, [user?.uid]);

  // Load posts real-time
  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, snap => {
      const fetched: Post[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      setPosts(fetched);
      setLoading(false);

      // Build leaderboard from post counts
      const countMap: Record<string, { name: string; count: number }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const uid = data.userId;
        const name = data.userName || 'User';
        if (!countMap[uid]) countMap[uid] = { name, count: 0 };
        countMap[uid].count += 1;
      });
      const sorted = Object.entries(countMap)
        .map(([id, v]) => ({ id, name: v.name, postCount: v.count }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3);
      setLeaders(sorted);
    });
    return () => unsub();
  }, []);

  // Load comments for active post
  useEffect(() => {
    if (!activePostId) return;
    const commentsRef = collection(db, 'communityPosts', activePostId, 'comments');
    const unsub = onSnapshot(commentsRef, snap => {
      const fetchedComments = snap.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as Comment;
      }).sort((a, b) => {
        const getTime = (timestamp: any) => {
          if (timestamp?.toDate) return timestamp.toDate().getTime();
          if (timestamp instanceof Date) return timestamp.getTime();
          return new Date(timestamp).getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setComments(fetchedComments);
    }, error => {
      console.error('❌ Error loading comments:', error);
    });
    return () => unsub();
  }, [activePostId]);

  const handleLike = async (post: Post) => {
    if (!user?.uid) return;
    const ref = doc(db, 'communityPosts', post.id);
    const alreadyLiked = post.likedBy?.includes(user.uid);
    await updateDoc(ref, {
      likes: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked
        ? post.likedBy.filter(id => id !== user.uid)
        : [...(post.likedBy || []), user.uid],
    });
  };

  const openComments = (postId: string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
  };

  const openCommentMenu = (comment: Comment) => {
    setSelectedComment(comment);
    setShowCommentActionModal(true);
  };

  const reportComment = async () => {
    if (!activePostId || !selectedComment || !user?.uid) return;
    try {
      await addDoc(collection(db, 'reports'), {
        postId: activePostId,
        commentId: selectedComment.id,
        reportedBy: user.uid,
        reportedUserId: selectedComment.userId,
        reportedText: selectedComment.text,
        reason: 'Inappropriate comment',
        createdAt: serverTimestamp(),
      });
      setShowCommentActionModal(false);
      setSelectedComment(null);
      Alert.alert('Success', 'Comment reported successfully');
    } catch (error) {
      console.error('Error reporting comment:', error);
      Alert.alert('Error', 'Failed to report comment');
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId) return;
    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'communityPosts', activePostId, 'comments'), {
        userId: user?.uid,
        userName,
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

  const showPostMenu = (post: Post) => {
    setSelectedPost(post);
    setShowMenuModal(true);
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'communityPosts', selectedPost.id));
              setShowMenuModal(false);
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const reportPost = async () => {
    if (!selectedPost || !user?.uid) return;
    try {
      await addDoc(collection(db, 'reports'), {
        postId: selectedPost.id,
        reportedBy: user.uid,
        reason: 'Inappropriate content', // Could be made selectable in future
        createdAt: serverTimestamp()
      });
      setShowMenuModal(false);
      Alert.alert('Success', 'Post reported successfully');
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', 'Failed to report post');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!activePostId) return;
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'communityPosts', activePostId, 'comments', commentId));
              await updateDoc(doc(db, 'communityPosts', activePostId), {
                commentCount: increment(-1),
              });
              Alert.alert('Success', 'Comment deleted successfully');
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setPickedImage(result.assets[0].uri);
  };

  const submitPost = async () => {
    if (!caption.trim()) { Alert.alert('Add a caption'); return; }
    setPosting(true);
    try {
      let imageUrl: string | undefined;
      if (pickedImage) imageUrl = await uploadImageToCloudinary(pickedImage);
      await addDoc(collection(db, 'communityPosts'), {
        userId: user?.uid,
        userName,
        caption: caption.trim(),
        imageUrl: imageUrl || null,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setCaption('');
      setPickedImage(null);
      setShowPostModal(false);
    } catch {
      Alert.alert('Error', 'Failed to post. Try again.');
    } finally {
      setPosting(false);
    }
  };

  const buildFeed = () => {
    const feed: (Post & { _sys?: boolean } | typeof AWARENESS_POSTS[0] & { _sys: boolean })[] = [];
    let sysIdx = 0;
    posts.forEach((p, i) => {
      feed.push(p as any);
      if ((i + 1) % 3 === 0 && sysIdx < AWARENESS_POSTS.length) {
        feed.push({ ...AWARENESS_POSTS[sysIdx++], _sys: true } as any);
      }
    });
    return feed;
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.header}>Community</Text>
          <TouchableOpacity style={styles.myPostsBtn} onPress={() => navigation.navigate('MyPosts')} activeOpacity={0.8}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Hero Quote Card */}
        <LinearGradient colors={['#10b981', '#059669']} start={[0, 0]} end={[1, 1]} style={styles.heroCard}>
          <MaterialCommunityIcons name="leaf" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBg} />
          <Text style={styles.heroLabel}>💬 DAILY INSPIRATION</Text>
          <Animated.Text style={[styles.heroQuote, { opacity: fadeAnim }]}>
            {QUOTES[quoteIdx]}
          </Animated.Text>
        </LinearGradient>

        {/* Community Feed */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>📰 Community Feed</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
        ) : buildFeed().length === 0 ? (
          <View style={styles.emptyFeed}>
            <MaterialCommunityIcons name="post-outline" size={40} color="#d1d5db" />
            <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
          </View>
        ) : buildFeed().map((item: any, idx) => {
          if (item._sys) {
            return (
              <View key={item.id + idx} style={styles.sysPost}>
                <Text style={styles.sysBadge}>{item.badge}</Text>
                <Text style={styles.sysCaption}>{item.caption}</Text>
              </View>
            );
          }
          const post = item as Post;
          const liked = post.likedBy?.includes(user?.uid || '');
          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>{post.userName?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.postUser}>{post.userName}</Text>
                  {post.badge && <Text style={styles.verifiedBadge}>{post.badge}</Text>}
                </View>
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => showPostMenu(post)}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
              ) : null}
              <Text style={styles.postCaption}>{post.caption}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post)}>
                  <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#ef4444' : '#6b7280'} />
                  <Text style={[styles.actionText, liked && { color: '#ef4444' }]}>{post.likes || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(post.id)}>
                  <MaterialCommunityIcons name="comment-outline" size={20} color="#6b7280" />
                  <Text style={styles.actionText}>{post.commentCount || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Leaderboard */}
        <View style={[styles.sectionRow, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>🥇 Leaderboard</Text>
        </View>
        <View style={styles.leaderCard}>
          {leaders.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet</Text>
          ) : leaders.map((u, i) => (
            <View key={u.id} style={[styles.leaderRow, i < leaders.length - 1 && styles.leaderBorder]}>
              <Text style={styles.medal}>{medals[i]}</Text>
              <Text style={styles.leaderName}>{u.name}</Text>
              <Text style={styles.leaderPosts}>{u.postCount} posts</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowPostModal(true)} activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal visible={showPostModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Share Your Impact</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {pickedImage ? (
                  <Image source={{ uri: pickedImage }} style={styles.pickedImg} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePickerInner}>
                    <Feather name="image" size={24} color="#9ca3af" />
                    <Text style={styles.imagePickerText}>Add Photo (optional)</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.captionInput}
                placeholder="What did you recycle today? (e.g., 3 plastic bottles)"
                placeholderTextColor="#9ca3af"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={200}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPostModal(false); setCaption(''); setPickedImage(null); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postBtn} onPress={submitPost} disabled={posting}>
                  {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' }]}> 
            <View style={[styles.modalBox, { height: '75%', backgroundColor: '#fff' }]}>
              <View style={styles.commentHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity onPress={() => { setShowCommentModal(false); setCommentText(''); }}>
                  <Feather name="x" size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { textAlign: 'center', paddingVertical: 24, color: '#111827' }]}>No comments yet. Start the conversation!</Text>
                }
                renderItem={({ item: c }) => {
                  return (
                    <View style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>{c.userName?.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.commentBody}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={styles.commentUser}>{c.userName}</Text>
                          <Text style={styles.commentTime}>
                            {(() => {
                              try {
                                const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
                                return date.toLocaleDateString();
                              } catch (e) {
                                console.error('❌ Date parsing error:', e, c.createdAt);
                                return 'N/A';
                              }
                            })()}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.commentMenuBtn}
                        onPress={() => openCommentMenu(c)}
                      >
                        <MaterialCommunityIcons name="dots-vertical" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                style={{ flex: 1, backgroundColor: '#fff' }}
                contentContainerStyle={{ paddingBottom: 20, minHeight: 120 }}
                ListFooterComponent={<View style={{ height: 20 }} />}
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
                  {submittingComment
                    ? <ActivityIndicator color="#10b981" size="small" />
                    : <MaterialCommunityIcons name="send" size={22} color="#10b981" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comment Action Modal */}
      <Modal visible={showCommentActionModal} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <View style={styles.menuBox}>
            {selectedComment && selectedComment.userId === user?.uid ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setShowCommentActionModal(false);
                deleteComment(selectedComment.id);
              }}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete Comment</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={reportComment}>
                <MaterialCommunityIcons name="flag-outline" size={20} color="#f97316" />
                <Text style={[styles.menuText, { color: '#f97316' }]}>Report Comment</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}
              onPress={() => {
                setShowCommentActionModal(false);
                setSelectedComment(null);
              }}
            >
              <Text style={[styles.menuText, { color: '#6b7280' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Post Menu Modal */}
      <Modal visible={showMenuModal} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <View style={styles.menuBox}>
            {selectedPost && selectedPost.userId === user?.uid && (
              <TouchableOpacity style={styles.menuItem} onPress={deletePost}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete Post</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={reportPost}>
              <MaterialCommunityIcons name="flag-outline" size={20} color="#f97316" />
              <Text style={[styles.menuText, { color: '#f97316' }]}>Report Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={[styles.menuText, { color: '#6b7280' }]}>Cancel</Text>
            </TouchableOpacity>
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
  myPostsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  header: { fontSize: 20, fontWeight: '900', color: '#111827' },

  heroCard: { borderRadius: 18, padding: 22, marginBottom: 24, overflow: 'hidden' },
  heroBg: { position: 'absolute', right: -10, bottom: -10 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 10 },
  heroQuote: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 26 },

  sectionRow: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },

  postCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { fontWeight: '800', color: '#10b981', fontSize: 16 },
  postUser: { fontWeight: '700', color: '#111827' },
  verifiedBadge: { fontSize: 11, color: '#10b981', fontWeight: '700', marginTop: 2 },
  menuBtn: { padding: 8 },
  postImage: { width: '100%', height: 200 },
  postCaption: { padding: 12, color: '#374151', fontSize: 14, lineHeight: 20 },
  postActions: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },

  sysPost: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#10b981' },
  sysBadge: { fontSize: 12, fontWeight: '800', color: '#065f46', marginBottom: 6 },
  sysCaption: { color: '#374151', fontSize: 14, lineHeight: 20 },

  emptyFeed: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#9ca3af', marginTop: 8, fontSize: 14 },

  leaderCard: { backgroundColor: '#fff', borderRadius: 14, padding: 4, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  leaderBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  medal: { fontSize: 22, width: 34 },
  leaderName: { flex: 1, fontWeight: '700', color: '#111827', fontSize: 14, marginLeft: 6 },
  leaderPosts: { fontWeight: '800', color: '#10b981', fontSize: 13 },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  imagePicker: { borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed', height: 110, marginBottom: 14, overflow: 'hidden' },
  imagePickerInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  imagePickerText: { color: '#9ca3af', fontSize: 13 },
  pickedImg: { width: '100%', height: '100%' },
  captionInput: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  postBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
  postBtnText: { fontWeight: '800', color: '#fff' },

  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  commentItem: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start', backgroundColor: '#fff', minHeight: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 12 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 4 },
  commentAvatarText: { fontWeight: '800', color: '#10b981', fontSize: 13 },
  commentBody: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  commentMenuBtn: { padding: 8, marginLeft: 8, alignSelf: 'flex-start' },
  commentUser: { fontWeight: '700', color: '#111827', fontSize: 14, marginBottom: 2 },
  commentTime: { fontSize: 11, color: '#6b7280' },
  commentText: { color: '#000', fontSize: 14, lineHeight: 20 },
  deleteCommentBtn: { padding: 8, marginLeft: 8 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 8, gap: 8 },
  commentInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  sendBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuBox: { backgroundColor: '#fff', borderRadius: 12, padding: 8, minWidth: 200 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  menuText: { fontSize: 16, fontWeight: '600' },
});

export default CommunityScreen;
