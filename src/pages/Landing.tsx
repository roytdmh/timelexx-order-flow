import { LandingNav } from '@/components/LandingNav';
import { ImageCarousel } from '@/components/ImageCarousel';
import timelexxMenu from '@/assets/timelexx-menu.jpeg';
import timelexxLogo from '@/assets/timelexx-logo.png';
import { Carrot, Apple, Leaf, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';

const Landing = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'info' ? 'info' : 'home';

  return (
    <div className="min-h-screen timelexx-gradient">
      <LandingNav />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <img
              src={timelexxLogo}
              alt="Timelexx Inn Logo"
              className="h-24 sm:h-32 md:h-40 mx-auto object-contain mb-4 sm:mb-6"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
              }}
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-4">
              Welcome to Timelexx Inn
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 italic font-serif px-4">
              Eat good, Feel good
            </p>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} className="w-full max-w-6xl mx-auto">

            <TabsContent value="home" className="space-y-12">
              {/* Carousel Section */}
              <div className="animate-fade-in">
                <ImageCarousel />
              </div>

              {/* Menu Section */}
              <div className="animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
                <div className="relative max-w-4xl mx-auto">
                  {/* Decorative Veggie Icons - Hide on small mobile */}
                  <Carrot 
                    className="hidden sm:block absolute -top-4 -left-8 w-8 h-8 sm:w-10 sm:h-10 text-timelexx-red animate-pulse z-10"
                    style={{ transform: 'rotate(-25deg)' }}
                  />
                  <Leaf 
                    className="hidden sm:block absolute top-1/3 -right-6 w-10 h-10 sm:w-12 sm:h-12 text-green-500 animate-pulse z-10"
                    style={{ transform: 'rotate(15deg)', animationDelay: '0.5s' }}
                  />
                  <Apple 
                    className="hidden sm:block absolute -bottom-6 left-1/4 w-8 h-8 sm:w-10 sm:h-10 text-timelexx-red animate-pulse z-10"
                    style={{ transform: 'rotate(45deg)', animationDelay: '1s' }}
                  />
                  
                  {/* Menu Image with Blended Edges */}
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-premium-lg">
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
              <div className="text-center animate-fade-in px-4" style={{ animationDelay: '0.4s' }}>
                <p className="text-white text-base sm:text-lg mb-3 sm:mb-4">
                  Select your role above to get started
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
                  <span>🍽️ Fresh Food</span>
                  <span>🚀 Fast Delivery</span>
                  <span>⭐ Quality Service</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-6 sm:space-y-8 px-4">
              {/* Bio Section */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">About Us</h2>
                  <p className="text-white/90 text-base sm:text-lg leading-relaxed text-center max-w-3xl mx-auto">
                    Timelexx Inn is a hub for great food and cool vibes. Based in Nungua, Timelexx Inn captures the life and taste of the Neighbourhood, offering the best in foods, drinks, service and soul. Welcome to Timelexx Inn!
                  </p>
                </CardContent>
              </Card>

              {/* Map Section */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-timelexx-red" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Find Us</h2>
                  </div>
                  <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-premium-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8982895847396!2d-0.07468519999999999!3d5.6044812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf87003d1cf659%3A0x31d171072b5e2cc6!2sTimelexx%20Inn!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Timelexx Inn Location"
                    />
                  </div>
                  <p className="text-white/80 text-center mt-3 sm:mt-4 text-sm sm:text-base">
                    Nungua, Accra, Ghana
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Landing;
