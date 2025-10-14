
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBadge } from '@/components/NotificationBadge';

const Header = () => {
  const { user, role } = useAuth();
  const showNotifications = user && (role === 'admin' || role === 'rider' || role === 'customer');

  return (
    <header className="timelexx-gradient text-white p-3 sm:p-4 md:p-6 shadow-premium-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-start">
          <div className="flex-1" />
          <div className="flex flex-col justify-center items-center flex-1">
            <img
              src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
              alt="Timelexx Inn Logo"
              className="h-20 sm:h-24 md:h-32 lg:h-40 object-contain mix-blend-lighten"
            />
            <p className="text-sm sm:text-lg md:text-xl italic -mt-1 sm:-mt-2 md:-mt-4 tracking-wide font-serif">
              Eat good, Feel good
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {showNotifications && user && role && (
              <NotificationBadge userId={user.id} userRole={role} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
