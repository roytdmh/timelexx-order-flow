import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

const SecurityNotice: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Enhancement Active</AlertTitle>
        <AlertDescription>
          This application now has enhanced security controls. Kitchen staff authentication is required to view orders, update order status, and perform administrative actions.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Required</AlertTitle>
        <AlertDescription>
          If you're seeing empty data or permission errors, you need to be authenticated with kitchen staff credentials. Contact your administrator to set up proper access.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityNotice;