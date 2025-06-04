'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTitle } from '@/components/shared/PageTitle';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCleanupAll = async () => {
    const confirmed = confirm(
      '⚠️ WARNING: This will permanently delete ALL data!\n\n' +
      '• All users (except you will need to re-login)\n' +
      '• All halls\n' +
      '• All bookings\n\n' +
      'This action cannot be undone. Are you absolutely sure?'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      '🚨 FINAL CONFIRMATION\n\n' +
      'You are about to delete EVERYTHING from the database.\n' +
      'Type "DELETE" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const finalConfirm = prompt(
      'Type "DELETE" (in capital letters) to confirm the complete data wipe:'
    );

    if (finalConfirm !== 'DELETE') {
      toast({
        title: 'Cleanup Cancelled',
        description: 'Data cleanup was cancelled.',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧹 Starting complete data cleanup...');
      const response = await api.cleanupAllData();
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Clear frontend caches
      localStorage.clear();
      sessionStorage.clear();

      toast({
        title: 'Database Cleaned Successfully!',
        description: 'All users, halls, and bookings have been removed.',
        className: 'bg-green-600 text-white',
      });

      console.log('✅ Cleanup completed successfully');
      
      // Redirect to login since all users are deleted
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      toast({
        title: 'Cleanup Failed',
        description: error instanceof Error ? error.message : 'Failed to cleanup database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      title: 'Cache Cleared',
      description: 'Frontend cache has been cleared.',
      className: 'bg-blue-600 text-white',
    });

    // Refresh the page to reload data
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle>
        Database Cleanup
      </PageTitle>
      <p className="text-gray-600 mb-6">Manage and reset application data</p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Clear Frontend Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Clear Frontend Cache
            </CardTitle>
            <CardDescription>
              Clear stored data in browser (localStorage, sessionStorage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will clear cached user data, tokens, and other frontend storage. 
              You may need to login again.
            </p>
            <Button 
              onClick={handleClearCache}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
          </CardContent>
        </Card>

        {/* Complete Database Cleanup */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Complete Database Cleanup
            </CardTitle>
            <CardDescription className="text-red-600">
              ⚠️ DANGER: This will permanently delete ALL data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All users (admin and faculty)</li>
                <li>• All halls and their data</li>
                <li>• All bookings and requests</li>
              </ul>
              <p className="text-sm font-medium text-red-600">
                This action cannot be undone!
              </p>
              <Button 
                onClick={handleCleanupAll}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">After Cleanup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            After running the complete cleanup, you&apos;ll need to:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>1. Create new admin and faculty users</li>
            <li>2. Add new halls to the system</li>
            <li>3. Faculty can then create new bookings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
