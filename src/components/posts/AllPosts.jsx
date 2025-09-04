import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { Trash2, Heart, MessageCircle } from 'lucide-react';

export default function AllPosts() {
  const { getAuthHeaders } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/posts/all', {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch all posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, [getAuthHeaders]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const getPriorityVariant = (priority) => {
    if (priority === 'high') return 'destructive';
    if (priority === 'low') return 'secondary';
    return 'default';
  };

  if (loading) {
    return <p>Loading all posts...</p>;
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No posts found in the system.</p>
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
                    <span>By {post.authorName}</span>
                    <Badge variant={post.authorRole === 'admin' ? 'default' : 'secondary'}>
                      {post.authorRole}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                    <Badge variant="outline">{post.visibility}</Badge>
                    <Badge variant={getPriorityVariant(post.priority)}>
                      {post.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes.length}</span>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
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
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}