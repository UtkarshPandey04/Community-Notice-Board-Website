import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const getCategoryColor = (cat) => {
  const colors = {
    general: 'bg-gray-100 text-gray-800',
    announcement: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    marketplace: 'bg-purple-100 text-purple-800',
    question: 'bg-yellow-100 text-yellow-800',
    discussion: 'bg-orange-100 text-orange-800',
  };
  return colors[cat] || colors.general;
};

const getVisibilityIcon = (visibility) => {
  switch (visibility) {
    case 'public':
      return '🌐';
    case 'community':
      return '👥';
    case 'private':
      return '🔒';
    default:
      return '📄';
  }
};

const PostListPage = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(`/api/posts?category=${category}`);

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [category, fetchWithAuth]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold capitalize">{category} Posts</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold capitalize">{category} Posts</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load posts: {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={fetchPosts}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{category} Posts</h1>
        <div className="text-sm text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-center">
              Be the first to create a {category} post!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <span className="text-sm ml-2" title={post.visibility}>
                    {getVisibilityIcon(post.visibility)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>by {post.authorName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    {post.authorRole === 'admin' && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {post.likes && (
                      <span>❤️ {post.likes.length}</span>
                    )}
                    {post.comments && (
                      <span>💬 {post.comments.length}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostListPage;
