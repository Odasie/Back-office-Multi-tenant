import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Tenant, UserRole, Department } from '@/types/models';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  profile: User | null;
  tenant: Tenant | null;
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isDepartmentUser: (department: Department) => boolean;
  canAccessDepartment: (department: Department) => boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
  switchTenant: (tenantId: string) => Promise<{ error: any }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch tenant data
      if (profileData?.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
        } else {
          setTenant(tenantData);
          
          // Apply tenant CSS overrides
          if (tenantData.css_overrides && typeof tenantData.css_overrides === 'object') {
            applyTenantStyles(tenantData.css_overrides as Record<string, any>);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTenantStyles = (cssOverrides: Record<string, any>) => {
    const root = document.documentElement;
    
    Object.entries(cssOverrides).forEach(([property, value]) => {
      if (property.startsWith('--')) {
        root.style.setProperty(property, value);
      }
    });
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setProfile(null);
      setTenant(null);
      setLoading(false);
    }
  }, [session, user]);

  const hasRole = (role: UserRole): boolean => {
    if (!profile) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      super_admin: 5,
      admin: 4,
      manager: 3,
      agent: 2,
      user: 1,
    };
    
    return roleHierarchy[profile.role] >= roleHierarchy[role];
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Super admins have all permissions
    if (profile.role === 'super_admin') return true;
    
    // Define role-based permissions
    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: ['*'], // All permissions
      admin: [
        'manage_users',
        'manage_tenants',
        'view_all_departments',
        'manage_leads',
        'manage_bookings',
        'manage_finances',
        'manage_tasks',
        'manage_tickets',
      ],
      manager: [
        'view_department_data',
        'manage_department_leads',
        'manage_department_tasks',
        'view_department_finances',
        'assign_agents',
      ],
      agent: [
        'manage_own_leads',
        'view_own_tasks',
        'create_tickets',
        'view_own_bookings',
      ],
      user: [
        'view_own_data',
        'create_tickets',
      ],
    };
    
    const userPermissions = rolePermissions[profile.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const isDepartmentUser = (department: Department): boolean => {
    return profile?.department === department;
  };

  const canAccessDepartment = (department: Department): boolean => {
    if (!profile) return false;
    
    // Super admins and admins can access all departments
    if (hasRole('admin')) return true;
    
    // Managers can access their own department
    if (hasRole('manager') && profile.department === department) return true;
    
    // For specific cross-department access rules
    if (profile.department === 'management') return true;
    
    return profile.department === department;
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!profile) return { error: 'No profile loaded' };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const switchTenant = async (tenantId: string) => {
    if (!profile) return { error: 'No profile loaded' };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', profile.id);
      
      if (error) {
        toast({
          title: "Tenant switch failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      // Refresh profile data to load new tenant
      await fetchProfile();
      
      toast({
        title: "Tenant switched",
        description: "You have successfully switched tenants.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Tenant switch failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    profile,
    tenant,
    loading,
    hasRole,
    hasPermission,
    isDepartmentUser,
    canAccessDepartment,
    refreshProfile,
    updateProfile,
    switchTenant,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};