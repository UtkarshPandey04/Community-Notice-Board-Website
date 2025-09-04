import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile, uploadProfilePicture, changePassword } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, updatingProfile, updatingPicture, updatingPassword

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!profilePictureFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePictureFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePictureFile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setStatus('updatingProfile');
    const result = await updateProfile(profileData);
    if (result.success) {
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setStatus('idle');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus('updatingPassword');
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      toast({ title: 'Success', description: 'Password changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setStatus('idle');
  };

  const handleProfilePictureUpdate = async () => {
    if (!profilePictureFile) return;
    setStatus('updatingPicture');
    const result = await uploadProfilePicture(profilePictureFile);
    if (result.success) {
      toast({ title: 'Success', description: 'Profile picture updated successfully.' });
      setProfilePictureFile(null);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setStatus('idle');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={status === 'updatingProfile'}>
              {status === 'updatingProfile' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your avatar.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profilePicture} alt={user.firstName} />
            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Change Picture</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile Picture</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="profile-pic-file">Select an image from your computer</Label>
                <Input
                  id="profile-pic-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
                />
                {previewUrl && (
                  <div className="mt-4 flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={previewUrl} alt="Profile picture preview" />
                    </Avatar>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={handleProfilePictureUpdate} disabled={status === 'updatingPicture' || !profilePictureFile}>
                  {status === 'updatingPicture' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload & Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your login password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={status === 'updatingPassword'}>
              {status === 'updatingPassword' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}