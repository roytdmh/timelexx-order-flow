
import React from 'react';
import UserMenu from '@/components/UserMenu';

const Header = () => {
  return (
    <header className="timelexx-gradient text-white p-4 sm:p-6 shadow-premium-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col justify-center items-center flex-1">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-24 sm:h-32 md:h-40 object-contain mix-blend-lighten"
          />
          <p className="text-lg sm:text-xl italic -mt-2 sm:-mt-4 tracking-wide font-serif">
            Eat good, Feel good
          </p>
        </div>
        
        <div className="absolute top-4 right-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
