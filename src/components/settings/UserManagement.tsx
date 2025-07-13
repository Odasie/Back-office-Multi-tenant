import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { User } from '@/types/models';

export default function UserManagement() {
  const { profile: currentProfile } = useUser();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'user';
    department: 'sales' | 'operations' | 'finance' | 'customer_service' | 'management';
    is_active: boolean;
  }>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    department: 'sales',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('profiles').select('*');
      
      // If not super admin, only show users from same tenant
      if (currentProfile?.role !== 'super_admin') {
        query = query.eq('tenant_id', currentProfile?.tenant_id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            department: formData.department,
            is_active: formData.is_active,
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        toast({
          title: 'Info',
          description: 'New users must sign up through the authentication page',
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      department: user.department || 'sales',
      is_active: user.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      department: 'sales',
      is_active: true,
    });
  };

  const roleColors = {
    super_admin: 'destructive',
    admin: 'default',
    manager: 'secondary',
    agent: 'outline',
    user: 'outline',
  } as const;

  const departmentColors = {
    sales: 'default',
    operations: 'secondary',
    finance: 'outline',
    customer_service: 'outline',
    management: 'destructive',
  } as const;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Update user information and permissions'
                    : 'New users must sign up through the authentication page. You can only modify existing users here.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProfile?.role === 'super_admin' && (
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      )}
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value: any) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleColors[user.role]}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={departmentColors[user.department || 'sales']}>
                    {user.department?.replace('_', ' ') || 'Sales'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active !== false ? 'default' : 'outline'}>
                    {user.is_active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {user.is_active !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}