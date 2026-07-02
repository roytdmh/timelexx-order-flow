import { LandingNav } from '@/components/LandingNav';
import { ImageCarousel } from '@/components/ImageCarousel';
import janysLogo from '@/assets/janys-logo.jpg';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
  // Coordinates: 5°36'18.5"N 0°04'15.7"W  ->  5.605139, -0.070750
  const mapSrc =
    'https://www.google.com/maps?q=5.605139,-0.070750&hl=en&z=17&output=embed';

  return (
    <div className="min-h-screen timelexx-gradient">
      <LandingNav />

      <div className="pt-40 sm:pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <img
              src={janysLogo}
              alt="Jany's Cuisine Logo"
              className="h-24 sm:h-32 md:h-40 lg:h-48 mx-auto object-contain mb-4 sm:mb-6 rounded-xl shadow-premium-lg"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 px-4 drop-shadow-md">
              Welcome to Jany's Cuisine
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 italic font-serif px-4 drop-shadow">
              Where good food is found
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto space-y-10">
            {/* Carousel */}
            <div className="animate-fade-in">
              <ImageCarousel />
            </div>

            {/* About + Map */}
            <Card
              className="bg-white/15 backdrop-blur-sm border-white/25 animate-fade-in shadow-premium-lg"
              style={{ animationDelay: '0.2s' }}
            >
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6 pb-6 space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    About Us
                  </h2>
                  <p className="text-white/95 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                    Jany's Cuisine is located in Nungua and is known for the best
                    Cuisines and top notch quality service. Visit or order on the
                    app for some of Jany's Cuisines.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Find Us
                  </h3>
                </div>

                <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-premium-lg">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Jany's Cuisine Location"
                  />
                </div>
                <p className="text-white/90 text-center text-sm sm:text-base">
                  Nungua, Accra, Ghana
                </p>
              </CardContent>
            </Card>

            {/* CTA */}
            <div
              className="text-center animate-fade-in px-4"
              style={{ animationDelay: '0.4s' }}
            >
              <p className="text-white text-base sm:text-lg mb-3 sm:mb-4 drop-shadow">
                Select your role above to get started
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <span>🍽️ Fresh Food</span>
                <span>🚀 Fast Delivery</span>
                <span>⭐ Quality Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
