import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import CSVImportInterface from '@/components/settings/CSVImportInterface';

export default function SettingsImports() {
  const { user } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();

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

  const canImportData = ['super_admin', 'admin', 'manager'].includes(profile.role);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-6 w-6" />
            <h1 className="text-3xl font-bold">CSV Data Import</h1>
          </div>
          <p className="text-muted-foreground">
            Import data from CSV files into your CRM system
          </p>
        </div>

        {canImportData ? (
          <CSVImportInterface />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to import data. Only administrators and managers can perform data imports.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}