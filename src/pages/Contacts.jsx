import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Clock, Search, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Contacts() {
  const [contacts, setContacts] = useLocalStorage('contacts', [
    {
      id: '1',
      name: 'National Emergency Number',
      role: 'Emergency Response',
      phone: '112',
      email: 'email@cdac.in',
      department: 'Emergency',
      availability: '24/7'
    },
    {
      id: '2',
      name: 'Community Security',
      role: 'Security Guard',
      phone: '555-0100',
      email: 'security@community.com',
      department: 'Security',
      availability: '24/7'
    },
    {
      id: '3',
      name: 'Rohit Singh',
      role: 'Property Manager',
      phone: '9896738540',
      email: 'r.singh@community.com',
      department: 'Management',
      availability: 'Mon-Fri 9AM-5PM'
    },
    {
      id: '4',
      name: 'Maintenance Desk',
      role: 'Maintenance Team',
      phone: '8529637415',
      email: 'maintenance@community.com',
      department: 'Maintenance',
      availability: 'Mon-Sat 8AM-6PM'
    },
    {
      id: '5',
      name: 'Dr. Sarah',
      role: 'Community Physician',
      phone: '7894561236',
      email: 'dr.sarah@healthcenter.com',
      department: 'Healthcare',
      availability: 'Mon-Fri 9AM-5PM'
    },
    {
      id: '6',
      name: 'City Utilities',
      role: 'Utility Services',
      phone: '9998885962',
      email: 'utilities@city.gov',
      department: 'Utilities',
      availability: 'Mon-Fri 8AM-5PM'
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    department: '',
    availability: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') return;

    const contact = {
      id: Date.now().toString(),
      name: newContact.name,
      role: newContact.role,
      phone: newContact.phone,
      email: newContact.email || undefined,
      department: newContact.department,
      availability: newContact.availability || undefined
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', role: '', phone: '', email: '', department: '', availability: '' });
    setIsDialogOpen(false);
  };

  const getDepartmentColor = (department) => {
    switch (department.toLowerCase()) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      case 'management': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'healthcare': return 'bg-purple-100 text-purple-800';
      case 'utilities': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const department = contact.department;
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(contact);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Important Contacts</h1>
            <p className="text-gray-600 mt-2">Essential community contacts and services</p>
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Add an important community contact or service
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role/Position</Label>
                    <Input
                      id="role"
                      value={newContact.role}
                      onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newContact.department}
                      onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability">Availability (optional)</Label>
                    <Input
                      id="availability"
                      value={newContact.availability}
                      onChange={(e) => setNewContact({ ...newContact, availability: e.target.value })}
                      placeholder="e.g., Mon-Fri 9AM-5PM"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Contact
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts by Department */}
        <div className="space-y-8">
          {Object.entries(groupedContacts).map(([department, departmentContacts]) => (
            <div key={department}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                {department}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getDepartmentColor(contact.department)}>
                          {contact.department}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription>{contact.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                      {contact.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.availability && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600">{contact.availability}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No contacts have been added yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}