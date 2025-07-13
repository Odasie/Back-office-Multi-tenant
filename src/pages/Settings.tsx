import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings2, Users, Building2, Upload } from 'lucide-react';
import UserManagement from '@/components/settings/UserManagement';
import TenantManagement from '@/components/settings/TenantManagement';

export default function Settings() {
  const { user } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const canManageUsers = ['super_admin', 'admin'].includes(profile.role);
  const canManageTenants = profile.role === 'super_admin';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account, users, and system configuration
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="tenants" 
              className="flex items-center gap-2"
              disabled={!canManageTenants}
            >
              <Building2 className="h-4 w-4" />
              Tenant Management
            </TabsTrigger>
            <TabsTrigger 
              value="imports" 
              className="flex items-center gap-2"
              onClick={() => navigate('/settings/imports')}
            >
              <Upload className="h-4 w-4" />
              CSV Imports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {canManageUsers ? (
              <UserManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    You don't have permission to manage users.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tenants">
            {canManageTenants ? (
              <TenantManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    Only super administrators can manage tenants.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}