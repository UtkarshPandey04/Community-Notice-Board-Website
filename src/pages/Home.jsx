import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Bell, Calendar, ShoppingCart, Phone, Users, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const features = [
  {
    icon: <Megaphone className="h-8 w-8 text-blue-500" />,
    title: 'Announcements',
    description: 'Stay updated with important community notices and updates',
    path: '/announcements'
  },
  {
    icon: <Calendar className="h-8 w-8 text-green-500" />,
    title: 'Local Events',
    description: 'Discover and participate in community events and activities',
    path: '/events'
  },
  {
    icon: <ShoppingCart className="h-8 w-8 text-purple-500" />,
    title: 'Marketplace',
    description: 'Buy, sell, or rent items within the community',
    path: '/marketplace'
  },
  {
    icon: <Phone className="h-8 w-8 text-red-500" />,
    title: 'Important Contacts',
    description: 'Quick access to essential community contacts and services',
    path: '/contacts'
  }
];

const getCategoryBorderColor = (category) => {
  const colors = { announcement: 'border-blue-500', event: 'border-green-500', marketplace: 'border-purple-500' };
  return colors[category] || 'border-gray-500';
};

export default function Home() {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetchWithAuth('/api/posts?limit=3');
        if (response.ok) {
          const data = await response.json();
          // Assuming the API now returns authorProfilePicture with each post
          setRecentPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch recent posts:', error);
      }
    };
    fetchRecentPosts();
  }, [fetchWithAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Community Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your digital hub for community announcements, local events, marketplace, and important contacts. 
            Stay connected and engaged with your neighbors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(feature.path)}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  {feature.description}
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Explore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Bell className="h-6 w-6 mr-2 text-blue-600" />
            Recent Activity
          </h2>
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post._id} className={`border-l-4 ${getCategoryBorderColor(post.category)} pl-4`}>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-600">{post.content.substring(0, 100)}{post.content.length > 100 && '...'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.authorProfilePicture} alt={post.authorName} />
                      <AvatarFallback>{post.authorName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} by {post.authorName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent activity to show.</p>
          )}
          <Button className="mt-6" variant="outline" onClick={() => navigate('/announcements')}>
            View All Updates
          </Button>
        </div>
      </div>
    </div>
  );
}