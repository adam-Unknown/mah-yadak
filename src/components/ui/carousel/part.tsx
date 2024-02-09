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
import { Dot } from "lucide-react";

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
    <Carousel
      setApi={setApi}
      opts={{ align: "center" }}
      className="overflow-hidden border border-primary rounded-sm"
      dir="ltr"
    >
      <CarouselContent>
        {imagesUrls.map((url, index) => (
          <React.Fragment key={index}>
            <CarouselItem>
              <Image
                width={500}
                height={500}
                src={url}
                alt="x"
                className="aspect-square w-full"
              />
            </CarouselItem>
          </React.Fragment>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:block" />
      <CarouselNext className="hidden md:block" />
      <div className="flex">
        <small className="mx-auto my-2 inline text-gray-400">{`تصویر ${current.toLocaleString(
          "fa-IR"
        )} از ${count.toLocaleString("fa-IR")}`}</small>
      </div>
    </Carousel>
  );
};

export default PartCarousel;
