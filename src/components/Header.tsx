
import React from 'react';

const Header = () => {
  return (
    <header className="timelexx-gradient text-white shadow-2xl shadow-black/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
      <div className="container mx-auto flex flex-col justify-center items-center py-8 px-4 relative z-10">
        <div className="floating-element">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-40 object-contain mix-blend-lighten drop-shadow-2xl"
          />
        </div>
        <p className="text-xl italic -mt-4 tracking-wide font-serif gradient-text bg-white text-transparent bg-clip-text drop-shadow-sm">
          Eat good, Feel good
        </p>
      </div>
    </header>
  );
};

export default Header;
