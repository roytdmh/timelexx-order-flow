
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="timelexx-gradient text-white p-4 sm:p-6 shadow-premium-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-24 sm:h-32 md:h-40 object-contain mix-blend-lighten"
          />
          <p className="text-lg sm:text-xl italic -mt-2 sm:-mt-4 tracking-wide font-serif">
            Eat good, Feel good
          </p>
          {user && (
            <p className="text-sm opacity-90 mt-2">
              Logged in as: {user.user_metadata?.full_name || user.email}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
