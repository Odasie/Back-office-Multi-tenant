import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2, Palette } from 'lucide-react';
import { Tenant } from '@/types/models';

export default function TenantManagement() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    css_overrides: '',
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tenants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let cssOverrides = {};
      if (formData.css_overrides.trim()) {
        try {
          cssOverrides = JSON.parse(formData.css_overrides);
        } catch {
          toast({
            title: 'Error',
            description: 'Invalid JSON format for CSS overrides',
            variant: 'destructive',
          });
          return;
        }
      }

      if (editingTenant) {
        const { error } = await supabase
          .from('tenants')
          .update({
            name: formData.name,
            css_overrides: cssOverrides,
          })
          .eq('id', editingTenant.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Tenant updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('tenants')
          .insert({
            name: formData.name,
            css_overrides: cssOverrides,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Tenant created successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingTenant(null);
      resetForm();
      fetchTenants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tenant',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      css_overrides: JSON.stringify(tenant.css_overrides || {}, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      });
      fetchTenants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tenant',
        variant: 'destructive',
      });
    }
  };

  const applyTenantStyles = (tenant: Tenant) => {
    if (tenant.css_overrides && typeof tenant.css_overrides === 'object') {
      Object.entries(tenant.css_overrides).forEach(([property, value]) => {
        if (typeof value === 'string') {
          document.documentElement.style.setProperty(`--${property}`, value);
        }
      });
      
      toast({
        title: 'Success',
        description: `Applied ${tenant.name} theme styles`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      css_overrides: '',
    });
  };

  const defaultCssExample = {
    primary: "220 90% 56%",
    "primary-foreground": "0 0% 100%",
    background: "0 0% 100%",
    foreground: "240 10% 3.9%"
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading tenants...</span>
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
            <CardTitle>Tenant Management</CardTitle>
            <CardDescription>
              Manage tenants and their custom CSS styling
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
                </DialogTitle>
                <DialogDescription>
                  Create or modify tenant settings and custom CSS overrides
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="css_overrides">CSS Overrides (JSON)</Label>
                  <Textarea
                    id="css_overrides"
                    value={formData.css_overrides}
                    onChange={(e) => setFormData({ ...formData, css_overrides: e.target.value })}
                    placeholder={JSON.stringify(defaultCssExample, null, 2)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use HSL values for colors (e.g., "220 90% 56%"). Properties will be prefixed with "--".
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTenant ? 'Update Tenant' : 'Create Tenant'}
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
              <TableHead>CSS Overrides</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  {tenant.css_overrides && Object.keys(tenant.css_overrides).length > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(tenant.css_overrides).length} properties
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(tenant.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyTenantStyles(tenant)}
                      title="Apply theme styles"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tenant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{tenant.name}"? This action cannot be undone and will affect all users associated with this tenant.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tenant.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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