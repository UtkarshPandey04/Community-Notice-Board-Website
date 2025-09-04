import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditPostForm({ post, onSave, onCancel }) {
  // If there's no post object, don't render the form. This prevents
  // the component from crashing when the edit dialog is closed and `post` becomes null.
  if (!post) {
    return null;
  }

  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    category: post.category,
    visibility: post.visibility,
    priority: post.priority || 'medium'
  });

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const categories = [
    'general',
    'announcement',
    'event',
    'marketplace',
    'question',
    'discussion'
  ];

  

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(post._id, editData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-content">Content</Label>
        <Textarea
          id="edit-content"
          value={editData.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Select
            value={editData.category}
            onValueChange={(value) => setEditData({ ...editData, category: value })}
          >
            <SelectTrigger id="edit-category">
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
          <Label htmlFor="edit-priority">Priority</Label>
          <Select
            value={editData.priority}
            onValueChange={(value) => setEditData({ ...editData, priority: value })}
          >
            <SelectTrigger id="edit-priority">
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
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save Changes
        </Button>
      </div>
    </form>
  );
}