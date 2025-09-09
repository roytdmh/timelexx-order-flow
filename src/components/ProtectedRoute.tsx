import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireKitchenStaff?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireKitchenStaff = false,
  fallback 
}) => {
  const { user, loading, isKitchenStaff } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-timelexx-red" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (requireKitchenStaff && !isKitchenStaff()) {
    return fallback || (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need kitchen staff permissions to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;