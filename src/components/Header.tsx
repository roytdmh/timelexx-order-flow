
import React from 'react';
import UserProfile from './UserProfile';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { profile } = useAuth();

  const getHeaderSubtitle = () => {
    switch (profile?.role) {
      case 'timelexx_kitchen':
        return 'Kitchen Management System';
      case 'customer_hub':
        return 'Customer Portal';
      case 'timelexx_riders':
        return 'Rider Portal';
      default:
        return 'Eat good, Feel good';
    }
  };

  return (
    <header className="timelexx-gradient text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex flex-col justify-center items-center flex-1">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-40 object-contain mix-blend-lighten"
          />
          <p className="text-xl italic -mt-4 tracking-wide font-serif">
            {getHeaderSubtitle()}
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
