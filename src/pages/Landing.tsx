import { LandingNav } from '@/components/LandingNav';
import { ImageCarousel } from '@/components/ImageCarousel';

const Landing = () => {
  return (
    <div className="min-h-screen timelexx-gradient">
      <LandingNav showContactUs={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <img
              src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
              alt="Timelexx Inn Logo"
              className="h-32 sm:h-40 mx-auto object-contain mb-6"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Welcome to Timelexx Inn
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 italic font-serif">
              Eat good, Feel good
            </p>
          </div>

          {/* Carousel Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ImageCarousel />
          </div>

          {/* CTA Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
