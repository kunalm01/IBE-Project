import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import "./Carousel.scss";
import { CarouselProps } from "../../utils/interface";

export function ImageCarousel({ images, height }: Readonly<CarouselProps>) {
  return (
    <Carousel
      showThumbs={false}
      autoPlay
      infiniteLoop
      interval={3000}
      showStatus={false}
    >
      {images.map((step) => (
        <img
          key={step}
          src={step}
          style={{ borderRadius: "4px 4px 0px 0px ", height: `${height}px` }}
          alt={step}
        />
      ))}
    </Carousel>
  );
}
