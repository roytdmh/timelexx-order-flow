import { LandingNav } from '@/components/LandingNav';
import { ImageCarousel } from '@/components/ImageCarousel';
import timelexxMenu from '@/assets/timelexx-menu.jpeg';
import { Carrot, Apple, Leaf } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen timelexx-gradient">
      <LandingNav />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <img
              src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
              alt="Timelexx Inn Logo"
              className="h-32 sm:h-40 mx-auto object-contain mb-6 mix-blend-lighten opacity-90"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Welcome to Timelexx Inn
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 italic font-serif">
              Eat good, Feel good
            </p>
          </div>

          {/* Carousel Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ImageCarousel />
          </div>

          {/* Menu Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative max-w-4xl mx-auto">
              {/* Decorative Veggie Icons */}
              <Carrot 
                className="absolute -top-4 -left-8 w-10 h-10 text-timelexx-red animate-pulse z-10"
                style={{ transform: 'rotate(-25deg)' }}
              />
              <Leaf 
                className="absolute top-1/3 -right-6 w-12 h-12 text-green-500 animate-pulse z-10"
                style={{ transform: 'rotate(15deg)', animationDelay: '0.5s' }}
              />
              <Apple 
                className="absolute -bottom-6 left-1/4 w-10 h-10 text-timelexx-red animate-pulse z-10"
                style={{ transform: 'rotate(45deg)', animationDelay: '1s' }}
              />
              
              {/* Menu Image with Blended Edges */}
              <div className="relative rounded-2xl overflow-hidden shadow-premium-lg">
                <img
                  src={timelexxMenu}
                  alt="Timelexx Inn Menu"
                  className="w-full h-auto"
                  style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 10%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.9) 90%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 10%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.9) 90%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-white text-lg mb-4">
              Select your role above to get started
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
              <span>🍽️ Fresh Food</span>
              <span>🚀 Fast Delivery</span>
              <span>⭐ Quality Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
