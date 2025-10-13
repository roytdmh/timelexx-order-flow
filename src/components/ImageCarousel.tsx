import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-4/5 md:basis-3/4">
              <div className="p-1">
                <Card className="border-none shadow-premium-lg overflow-hidden transform transition-all duration-500 hover:scale-105">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
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
