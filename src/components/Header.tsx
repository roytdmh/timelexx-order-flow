
import React from 'react';

const Header = () => {
  return (
    <header className="timelexx-gradient text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col justify-center items-center">
        <img
          src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
          alt="Timelexx Inn Logo"
          className="h-40 object-contain mix-blend-lighten"
        />
        <p className="text-xl italic mt-2 tracking-wide font-serif">
          Eat good, Feel good
        </p>
      </div>
    </header>
  );
};

export default Header;
