"use client";
import { AggregatedSuggestionsSchema } from "@/lib/definition";
import React from "react";
import { z } from "zod";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

interface Props {
  suggestion: z.infer<typeof AggregatedSuggestionsSchema.element>;
}

const StoreCarousel: React.FC<Props> = ({ suggestion }) => {
  return (
    <>
      <Carousel>
        <CarouselContent>
          {suggestion.parts.map((part) => (
            <React.Fragment key={part.id}>
              <CarouselItem>
                <Link
                  href={{
                    pathname: `/store/part/${part.id}`,
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      width={300}
                      height={300}
                      src={part.imageUrl}
                      alt="Test"
                    />
                    <div className="text-center text-xl">{`${part.category} ${part.model} ${part.suitableFor} ${part.usedFor} ${part.brand}`}</div>
                  </div>
                </Link>
              </CarouselItem>
            </React.Fragment>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );
};

export default StoreCarousel;
