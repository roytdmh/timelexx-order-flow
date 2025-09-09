import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SecurityNotice: React.FC = () => {
  const { isKitchenStaff, profile } = useAuth();

  if (!isKitchenStaff()) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          This section requires kitchen staff permissions. Current role: {profile?.role || 'Unknown'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Access Granted</AlertTitle>
      <AlertDescription className="text-green-700">
        You have kitchen staff permissions. All features are available.
      </AlertDescription>
    </Alert>
  );
};

export default SecurityNotice;