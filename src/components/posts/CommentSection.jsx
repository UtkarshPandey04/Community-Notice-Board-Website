import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getInitials = (name) => (name || '').split(' ').map(n => n[0]).join('');

const Comment = React.memo(({ comment, canDelete, onDelete }) => {
  const relativeTime = useMemo(() => {
    return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  }, [comment.createdAt]);

  const initials = useMemo(() => getInitials(comment.authorName), [comment.authorName]);

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{comment.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {relativeTime}
            </p>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(comment._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
      </div>
    </div>
  );
});
Comment.displayName = 'Comment';

export default function CommentSection({ post, onCommentAdded, onCommentDeleted }) {
  const { user, getAuthHeaders } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });
      if (response.ok) {
        const newComments = await response.json();
        onCommentAdded(newComments);
        setComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, getAuthHeaders, onCommentAdded, post._id]);

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      const response = await fetch(`/api/posts/${post._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        onCommentDeleted(data.comments);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }, [getAuthHeaders, onCommentDeleted, post._id]);

  const canDeleteComment = useCallback((commentAuthorId) => {
    return user?.role === 'admin' || user?._id === commentAuthorId;
  }, [user]);

  return (
    <div className="pt-4 mt-4 border-t">
      {user && (
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-4 mb-6">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
            />
            <Button type="submit" size="sm" className="mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {post.comments.map((c) => (
          <Comment
            key={c._id}
            comment={c}
            canDelete={canDeleteComment(c.authorId)}
            onDelete={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}