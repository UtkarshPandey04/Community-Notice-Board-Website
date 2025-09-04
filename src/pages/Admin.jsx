import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Megaphone, Calendar, ShoppingCart, Phone, Trash2, BarChart3 } from 'lucide-react';
import AllPosts from '@/components/posts/AllPosts';
import ProfileSettings from '@/components/auth/ProfileSettings';
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
} from '@/components/ui/alert-dialog';

export default function Admin() {
  const { user, fetchWithAuth } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    postsByCategory: [],
    highPriorityPosts: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchStats = async () => {
        try {
          const response = await fetchWithAuth('/api/posts/stats');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to fetch admin stats:', error);
        }
      };

      const fetchContent = async () => {
        try {
          // Fetch recent announcements
          const announcementsRes = await fetchWithAuth('/api/posts?category=announcement&limit=5');
          if (announcementsRes.ok) {
            const data = await announcementsRes.json();
            setAnnouncements(data.posts);
          }

          // Fetch upcoming events
          const eventsRes = await fetchWithAuth('/api/posts?category=event&limit=5');
          if (eventsRes.ok) {
            const data = await eventsRes.json();
            // Assuming events have a date property to filter for upcoming
            setEvents(data.posts.filter(e => new Date(e.eventDate) >= new Date()));
          }

          // Fetch recent activity
          const activityRes = await fetchWithAuth('/api/posts?limit=5');
          if (activityRes.ok) {
            const data = await activityRes.json();
            setRecentActivity(data.posts);
          }
        } catch (error) {
          console.error('Failed to fetch content for admin dashboard:', error);
        }
      };
      fetchStats();
      fetchContent();
    }
  }, [user, fetchWithAuth]);

  const getCategoryCount = (categoryName) => {
    const category = stats.postsByCategory.find(c => c._id === categoryName);
    return category ? category.count : 0;
  };

  

  const clearAllData = () => {
    alert('This is a demo feature and does not clear data.');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage community content and monitor activity</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="posts">Post Management</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCategoryCount('announcement')}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.highPriorityPosts} high priority
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCategoryCount('event')}</div>
                  <p className="text-xs text-muted-foreground">
                    &nbsp;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Marketplace Posts</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCategoryCount('marketplace')}</div>
                  <p className="text-xs text-muted-foreground">&nbsp;</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Important Contacts</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">Total Posts</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Platform Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Community Engagement</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total community posts: {stats.totalPosts}
                  </div>
                  <div className="text-sm text-gray-600">
                    High priority posts: {stats.highPriorityPosts}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement._id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{announcement.title}</p>
                            <p className="text-xs text-gray-500">by {announcement.author}</p>
                          </div>
                          <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                            {announcement.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No announcements yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event._id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline">{event.location}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>All Community Posts</CardTitle>
                <CardDescription>View and manage all posts from all users.</CardDescription>
              </CardHeader>
              <CardContent><AllPosts /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest community posts and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.category === 'announcement' && <Megaphone className="h-5 w-5 text-blue-500" />}
                          {activity.category === 'event' && <Calendar className="h-5 w-5 text-green-500" />}
                          {activity.category === 'marketplace' && <ShoppingCart className="h-5 w-5 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{activity.category}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Management</CardTitle>
                  <CardDescription>Manage community board settings and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <h3 className="font-medium text-red-800 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Clear all community data including announcements, events, marketplace posts, and contacts.
                      This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This is a demo feature. In a real application, this would permanently delete all community data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={clearAllData}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Version:</span> 1.0.0</p>
                    <p><span className="font-medium">Created:</span> Community Board Platform</p>
                    <p><span className="font-medium">Storage:</span> Local Browser Storage</p>
                    <p><span className="font-medium">User Management:</span> Demo Authentication</p>
                  </div>
                </CardContent>
              </Card>

              <ProfileSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}