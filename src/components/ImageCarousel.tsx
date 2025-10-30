import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import timelexxSign from '@/assets/timelexx-sign.webp';
import timelexxExterior from '@/assets/timelexx-exterior.webp';
import timelexxPackaging from '@/assets/timelexx-packaging.webp';
import timelexxInterior from '@/assets/timelexx-interior.webp';

const images = [
  { src: timelexxSign, alt: 'Timelexx Inn Sign' },
  { src: timelexxExterior, alt: 'Timelexx Restaurant Exterior' },
  { src: timelexxPackaging, alt: 'Timelexx Packaging' },
  { src: timelexxInterior, alt: 'Timelexx Restaurant Interior' },
];

export const ImageCarousel = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Carousel
        opts={{
          align: "center",
          loop: true,
          duration: 30,
        }}
        plugins={[
          Autoplay({
            delay: 10000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-full">
              <div className="p-1">
                <Card className="border-none shadow-premium-lg overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-opacity duration-1000"
                    />
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};
