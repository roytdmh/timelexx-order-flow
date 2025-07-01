
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerDetailsFormProps {
  customerName: string;
  customerNumber: string;
  customerLocationText: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerNumberChange: (value: string) => void;
  onCustomerLocationChange: (value: string) => void;
}

const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  customerName,
  customerNumber,
  customerLocationText,
  onCustomerNameChange,
  onCustomerNumberChange,
  onCustomerLocationChange
}) => {
  return (
    <>
      <div className="space-y-3">
        <Label>Customer Name (Optional)</Label>
        <Input
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Enter customer name"
        />
      </div>

      <div className="space-y-3">
        <Label>Customer Number (Optional)</Label>
        <Input
          value={customerNumber}
          onChange={(e) => onCustomerNumberChange(e.target.value)}
          placeholder="Enter customer phone number"
          type="tel"
        />
      </div>

      <div className="space-y-3">
        <Label>Customer Location (Optional)</Label>
        <Input
          value={customerLocationText}
          onChange={(e) => onCustomerLocationChange(e.target.value)}
          placeholder="Enter customer address or location"
        />
      </div>
    </>
  );
};

export default CustomerDetailsForm;
