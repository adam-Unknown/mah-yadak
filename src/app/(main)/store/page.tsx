"use server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import StoreCarousel from "@/components/ui/carousel/store";
import { fetchSuggestions } from "@/lib/data";
import Link from "next/link";
import React, { Suspense } from "react";
import Image from "next/image";
import { MongoClient, ServerApiVersion } from "mongodb";

// This store compoenent ui going to be smilar to Digikala ui
export default async function Store() {
  const suggestion = await fetchSuggestions();

  return (
    <Carousel>
      <CarouselContent>
        {suggestion[0].parts.map((part) => (
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

    // {
    //   /* INFINIT SCROLL ITEMS below the page */
    // }
  );
}
