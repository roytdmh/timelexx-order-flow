import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import food1 from '@/assets/food-1.jpg';
import food2 from '@/assets/food-2.jpg';
import food3 from '@/assets/food-3.jpg';
import food4 from '@/assets/food-4.jpg';
import food5 from '@/assets/food-5.jpg';
import food6 from '@/assets/food-6.jpg';
import food7 from '@/assets/food-7.jpg';

const images = [
  { src: food1, alt: 'Chicken wings, fries and salad platter' },
  { src: food2, alt: 'Grilled chicken with fried rice and vegetables' },
  { src: food3, alt: 'Fried chicken with fries and dipping sauces' },
  { src: food4, alt: 'Stir-fried noodles with vegetables and chicken' },
  { src: food5, alt: 'Rice bowl with spicy stew, egg and fried plantain' },
  { src: food6, alt: 'Jollof rice with roasted chicken and plantain' },
  { src: food7, alt: 'Fried chicken platter with fries and sauces' },
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
