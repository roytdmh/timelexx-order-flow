import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBadge } from '@/components/NotificationBadge';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';
import { RealtimeConnectionStatus } from '@/components/RealtimeConnectionStatus';
import janysLogo from '@/assets/janys-logo.jpg';

const Header = () => {
  const { user, role, profile } = useAuth();
  const showNotifications = user && (role === 'admin' || role === 'rider' || role === 'customer');

  return (
    <>
      <header className="timelexx-gradient text-white p-3 sm:p-4 md:p-6 shadow-premium-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <div className="flex flex-col justify-center items-center flex-1">
              <img
                src={janysLogo}
                alt="Jany's Cuisine Logo"
                className="h-20 sm:h-24 md:h-32 lg:h-40 object-contain rounded-lg"
                style={{
                  filter: 'brightness(1.05) contrast(1.1) saturate(1.15)'
                }}
              />
              <p className="text-sm sm:text-lg md:text-xl italic mt-1 tracking-wide font-serif">
                Where good food is found
              </p>
            </div>
            <div className="flex-1 flex justify-end items-start gap-3">
              {user && (
                profile?.full_name ? (
                  <p className="text-sm sm:text-base font-medium">
                    Hi {profile.full_name}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-medium text-white/70">
                    Loading...
                  </p>
                )
              )}
              {showNotifications && user && role && (
                <NotificationBadge userId={user.id} userRole={role} />
              )}
            </div>
          </div>
        </div>
      </header>
      {showNotifications && <NotificationPermissionPrompt userRole={role} />}
      {showNotifications && <RealtimeConnectionStatus />}
    </>
  );
};

export default Header;
