import { useState, useEffect, useCallback, useReducer } from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Heart, MessageCircle } from 'lucide-react';
import EditPostForm from './EditPostForm';
import CommentSection from './CommentSection';

const initialState = {
  posts: [],
  newPost: {
    title: '',
    content: '',
    category: 'general',
    visibility: 'public',
    priority: 'medium',
  },
  status: 'idle', // 'idle', 'creating', 'updatingProfile', 'fetching'
  showCreateForm: false,
  editingPost: null,
  visibleComments: {},
  isProfileDialogOpen: false,
  profilePictureFile: null,
  previewUrl: null,
  activeTab: 'my-posts',
  profileForm: {
    firstName: '',
    lastName: '',
  },
  passwordForm: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
};

function userPostsReducer(state, action) {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'TOGGLE_CREATE_FORM':
      return { ...state, showCreateForm: !state.showCreateForm };
    case 'UPDATE_NEW_POST':
      return { ...state, newPost: { ...state.newPost, ...action.payload } };
    case 'RESET_NEW_POST':
      return { ...state, newPost: initialState.newPost, showCreateForm: false };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_EDITING_POST':
      return { ...state, editingPost: action.payload };
    case 'TOGGLE_COMMENTS':
      return { ...state, visibleComments: { ...state.visibleComments, [action.payload]: !state.visibleComments[action.payload] } };
    case 'SET_PROFILE_DIALOG_OPEN':
      return { ...state, isProfileDialogOpen: action.payload };
    case 'SET_PROFILE_PICTURE_FILE':
      return { ...state, profilePictureFile: action.payload };
    case 'SET_PREVIEW_URL':
      return { ...state, previewUrl: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, showCreateForm: false };
    case 'UPDATE_PROFILE_FORM':
      return { ...state, profileForm: { ...state.profileForm, ...action.payload } };
    case 'UPDATE_PASSWORD_FORM':
      return { ...state, passwordForm: { ...state.passwordForm, ...action.payload } };
    case 'RESET_PASSWORD_FORM':
      return { ...state, passwordForm: { currentPassword: '', newPassword: '', confirmPassword: '' } };
    case 'INITIALIZE_PROFILE_FORM':
      return { ...state, profileForm: { firstName: action.payload.firstName, lastName: action.payload.lastName } };
    default:
      return state;
  }
}

const categories = [
  'general',
  'announcement',
  'event',
  'marketplace',
  'question',
  'discussion'
];

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'community', label: 'Community Only' },
  { value: 'private', label: 'Private' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const getPriorityVariant = (priority) => {
  if (priority === 'high') return 'destructive';
  if (priority === 'low') return 'secondary';
  return 'default';
};

export default function UserPosts() {
  const { user, fetchWithAuth, uploadProfilePicture, updateProfile, changePassword } = useAuth();
  const [state, dispatch] = useReducer(userPostsReducer, initialState);
  const {
    posts,
    newPost,
    status,
    showCreateForm,
    editingPost,
    visibleComments,
    isProfileDialogOpen,
    profilePictureFile,
    previewUrl,
    activeTab,
    profileForm,
    passwordForm,
  } = state;
  const { toast } = useToast();

  const fetchPosts = useCallback(async (tab) => {
    dispatch({ type: 'SET_STATUS', payload: 'fetching' });
    try {
      let endpoint;
      if (tab === 'my-posts') {
        endpoint = `/api/posts/user/${user._id}`;
      } else { // all-posts tab
        endpoint = user.role === 'admin' ? '/api/posts/all' : '/api/posts';
      }
      const response = await fetchWithAuth(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_POSTS', payload: data.posts });
      } else {
        dispatch({ type: 'SET_POSTS', payload: [] });
        toast({
          title: "Failed to fetch posts",
          description: "Could not load posts for this view.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      dispatch({ type: 'SET_POSTS', payload: [] });
      toast({
        title: "Network Error",
        description: "Could not fetch posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
    }
  }, [user, fetchWithAuth, toast]);

  useEffect(() => {
    if (user) {
      fetchPosts(activeTab);
    }
  }, [user, activeTab, fetchPosts]);

  useEffect(() => {
    if (activeTab === 'profile-settings' && user) {
      dispatch({ type: 'INITIALIZE_PROFILE_FORM', payload: user });
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!profilePictureFile) {
      dispatch({ type: 'SET_PREVIEW_URL', payload: null });
      return;
    }
    const objectUrl = URL.createObjectURL(profilePictureFile);
    dispatch({ type: 'SET_PREVIEW_URL', payload: objectUrl });

    // free memory when this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePictureFile]);

  const handleProfilePictureUpdate = async () => {
    if (!profilePictureFile) return;
    dispatch({ type: 'SET_STATUS', payload: 'updatingProfile' });
    const result = await uploadProfilePicture(profilePictureFile);
    if (result.success) {
      toast({
        title: "Profile Picture Updated",
        description: "Your new profile picture has been saved successfully.",
      });
      dispatch({ type: 'SET_PROFILE_PICTURE_FILE', payload: null });
      dispatch({ type: 'SET_PROFILE_DIALOG_OPEN', payload: false });
      if (['my-posts', 'all-posts'].includes(activeTab)) {
        fetchPosts(activeTab);
      }
    } else {
      toast({
        title: "Upload Error",
        description: result.message || 'An unknown error occurred.',
        variant: "destructive",
      });
    }
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_STATUS', payload: 'creating' });

    try {
      const response = await fetchWithAuth('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The backend should determine the author from the authentication token
        // to ensure data integrity and security. Sending author details from the
        // client is not a secure practice.
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        const createdPost = await response.json();
        const updatedPosts = [createdPost.post, ...posts];
        dispatch({ type: 'SET_POSTS', payload: updatedPosts });
        dispatch({ type: 'RESET_NEW_POST' });
        toast({
          title: "Post Created",
          description: "Your new post has been successfully published.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to create post",
          description: errorData.message || 'An unknown error occurred.',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      const response = await fetchWithAuth(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedPost = await response.json();
        const updatedPosts = posts.map(post => 
          post._id === postId ? updatedPost.post : post
        );
        dispatch({ type: 'SET_POSTS', payload: updatedPosts });
        toast({ title: "Post Updated", description: "Your post has been successfully updated." });
        dispatch({ type: 'SET_EDITING_POST', payload: null });
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetchWithAuth(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedPosts = posts.filter(post => post._id !== postId);
        dispatch({ type: 'SET_POSTS', payload: updatedPosts });
        toast({ title: "Post Deleted", description: "Your post has been successfully deleted." });
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    // Store the original state for potential rollback
    const originalPosts = [...posts];

    // Optimistically update the UI
    const updatedPosts = posts.map(p => {
      if (p._id === postId) {
        const isLiked = p.likes.includes(user?._id);
        const newLikes = isLiked
          ? p.likes.filter(id => id !== user?._id)
          : [...p.likes, user?._id];
        return { ...p, likes: newLikes };
      }
      return p;
    });
    dispatch({ type: 'SET_POSTS', payload: updatedPosts });

    try {
      const response = await fetchWithAuth(`/api/posts/${postId}/like`, {
        method: 'PUT',
      });

      if (!response.ok) {
        // If the API call fails, throw an error to trigger the catch block
        throw new Error('Failed to update like status on the server.');
      }

      // Optionally, you can re-sync with the server's response to ensure consistency
      const { likes } = await response.json();
      const serverUpdatedPosts = originalPosts.map(p => p._id === postId ? { ...p, likes } : p);
      dispatch({ type: 'SET_POSTS', payload: serverUpdatedPosts });
    } catch (error) {
      console.error('Failed to like post:', error);
      // Rollback to the original state on error
      dispatch({ type: 'SET_POSTS', payload: originalPosts });
      toast({
        title: "Error",
        description: "Could not update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_STATUS', payload: 'updatingProfile' });
    const result = await updateProfile(profileForm);
    if (result.success) {
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    } else {
      toast({ title: "Update Failed", description: result.message, variant: "destructive" });
    }
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "The new password and confirmation password must be the same.",
        variant: "destructive"
      });
      return;
    }
    dispatch({ type: 'SET_STATUS', payload: 'updatingProfile' });
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      dispatch({ type: 'RESET_PASSWORD_FORM' });
    } else {
      toast({
        title: "Change Failed",
        description: result.message || "Could not change password.",
        variant: "destructive"
      });
    }
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  };

  const handleCommentAdded = (postId, newComments) => {
    const updatedPosts = posts.map(p => p._id === postId ? { ...p, comments: newComments } : p);
    dispatch({ type: 'SET_POSTS', payload: updatedPosts });
  };

  const handleCommentDeleted = (postId, newComments) => {
    const updatedPosts = posts.map(p => p._id === postId ? { ...p, comments: newComments } : p);
    dispatch({ type: 'SET_POSTS', payload: updatedPosts });
  };

  const toggleComments = (postId) => {
    dispatch({ type: 'TOGGLE_COMMENTS', payload: postId });
  };

  const canEditPost = (post) => {
    return user.role === 'admin' || post.authorId === user._id;
  };

  const canDeletePost = (post) => {
    return user.role === 'admin' || post.authorId === user._id;
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your posts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Dialog open={isProfileDialogOpen} onOpenChange={(isOpen) => dispatch({ type: 'SET_PROFILE_DIALOG_OPEN', payload: isOpen })}>
            <DialogTrigger asChild>
              <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile Picture</DialogTitle>
                <DialogDescription>
                  Choose a new profile picture from your computer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="profile-pic-file">Image File</Label>
                <Input
                  id="profile-pic-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => dispatch({ type: 'SET_PROFILE_PICTURE_FILE', payload: e.target.files?.[0] || null })}
                />
                {previewUrl && (
                  <div className="mt-4 flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={previewUrl} alt="Profile picture preview" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={handleProfilePictureUpdate} disabled={status === 'updatingProfile' || !profilePictureFile}>
                  {status === 'updatingProfile' ? 'Uploading...' : 'Upload & Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <h1 className="text-3xl font-bold text-gray-900">
            Post Dashboard
          </h1>
        </div>
        {activeTab === 'my-posts' && (
          <Button onClick={() => dispatch({ type: 'TOGGLE_CREATE_FORM' })} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'my-posts' })}
            className={`${
              activeTab === 'my-posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Posts
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'all-posts' })}
            className={`${
              activeTab === 'all-posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Posts
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'profile-settings' })}
            className={`${
              activeTab === 'profile-settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile Settings
          </button>
        </nav>
      </div>

      {/* Create New Post Form */}
      {showCreateForm && activeTab === 'my-posts' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newPost.title}
              onChange={(e) => dispatch({ type: 'UPDATE_NEW_POST', payload: { title: e.target.value } })}
              placeholder="Enter post title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={newPost.content}
              onChange={(e) => dispatch({ type: 'UPDATE_NEW_POST', payload: { content: e.target.value } })}
              placeholder="Write your post content..."
              rows={4}
              required
            />
          </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => dispatch({ type: 'UPDATE_NEW_POST', payload: { category: value } })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={newPost.visibility}
                    onValueChange={(value) => dispatch({ type: 'UPDATE_NEW_POST', payload: { visibility: value } })}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newPost.priority}
                  onValueChange={(value) => dispatch({ type: 'UPDATE_NEW_POST', payload: { priority: value } })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={status === 'creating'}>
                  {status === 'creating' ? 'Creating...' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatch({ type: 'TOGGLE_CREATE_FORM' })}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List - only show on post-related tabs */}
      {['my-posts', 'all-posts'].includes(activeTab) && <div className="space-y-4">
        {status === 'fetching' ? (
          <div className="text-center py-8 text-gray-600">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">
                {activeTab === 'my-posts' ? 'No posts yet. Create your first post!' : 'No posts to display.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map(post => (
            <Card key={post._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.authorProfilePicture} alt={post.authorName} />
                        <AvatarFallback>{post.authorName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>By {post.authorName}</span>
                      <Badge variant={post.authorRole === 'admin' ? 'default' : 'secondary'}>
                        {post.authorRole}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                      <Badge variant="outline">{post.visibility}</Badge>
                      <Badge variant={getPriorityVariant(post.priority)}>
                        {post.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {canEditPost(post) && (
                    <div className="flex gap-2">
                      <Dialog open={editingPost?._id === post._id} onOpenChange={(isOpen) => !isOpen && dispatch({ type: 'SET_EDITING_POST', payload: null })}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_EDITING_POST', payload: post })}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                          </DialogHeader>
                          <EditPostForm post={editingPost} onSave={handleUpdatePost} onCancel={() => dispatch({ type: 'SET_EDITING_POST', payload: null })} />
                        </DialogContent>
                      </Dialog>
                      {canDeletePost(post) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this post.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post._id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </CardContent>
              <CardFooter className="flex gap-4 border-t pt-4 mt-4">
                <Button variant="ghost" size="sm" onClick={() => handleLikePost(post._id)} className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${post.likes.includes(user?._id) ? 'text-red-500 fill-current' : ''}`} />
                  {post.likes.length}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleComments(post._id)} className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments.length}
                </Button>
              </CardFooter>
              {visibleComments[post._id] && (
                <CardContent>
                  <CommentSection post={post} onCommentAdded={(comments) => handleCommentAdded(post._id, comments)} onCommentDeleted={(comments) => handleCommentDeleted(post._id, comments)} />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
      }

      {/* Profile Settings - only show on profile-settings tab */}
      {activeTab === 'profile-settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal details.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => dispatch({ type: 'UPDATE_PROFILE_FORM', payload: { firstName: e.target.value } })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => dispatch({ type: 'UPDATE_PROFILE_FORM', payload: { lastName: e.target.value } })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={status === 'updatingProfile'}>
                  {status === 'updatingProfile' ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">Update your password. Make sure it's a strong one.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => dispatch({ type: 'UPDATE_PASSWORD_FORM', payload: { currentPassword: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => dispatch({ type: 'UPDATE_PASSWORD_FORM', payload: { newPassword: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => dispatch({ type: 'UPDATE_PASSWORD_FORM', payload: { confirmPassword: e.target.value } })}
                    required
                  />
                </div>
                <Button type="submit" disabled={status === 'updatingProfile'}>
                  {status === 'updatingProfile' ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}