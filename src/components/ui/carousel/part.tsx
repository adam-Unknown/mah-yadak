"use client";
import React, { useEffect, useState } from "react";
import {
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselApi,
  Carousel,
} from "../carousel";
import Image from "next/image";

interface CarouselProps {
  imagesUrls: string[];
}

const PartCarousel: React.FC<CarouselProps> = ({ imagesUrls }) => {
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{ align: "center" }}
        className="bg-green-400"
      >
        <CarouselContent>
          {imagesUrls.map((url, index) => (
            <React.Fragment key={index}>
              <CarouselItem>
                <Image
                  width={500}
                  height={500}
                  src={url}
                  alt="test"
                  className="aspect-square bg-orange-600"
                />
              </CarouselItem>
            </React.Fragment>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex justify-center items-center space-x-2">
        <span>
          {current} of {count}
        </span>
      </div>
    </div>
  );
};

export default PartCarousel;
