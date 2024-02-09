"use server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import StoreCarousel from "@/components/ui/carousel/store";
import Link from "next/link";
import React, { Suspense } from "react";
import Image from "next/image";
import { MongoClient, ServerApiVersion } from "mongodb";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Moon, Terminal } from "lucide-react";
import SearchBar from "./search-bar";

// This store compoenent ui going to be smilar to Digikala ui
export default async function Store() {
  // const recommendationList = await fetchrecommendationLists();
  const messages =
    (await getMongoDbCrudExecutor("messages", async (messages) =>
      messages.find({}).toArray()
    )()) ?? [];
  const parts = await getMongoDbCrudExecutor("parts", async (parts) =>
    parts.find({}).toArray()
  )();

  return (
    <div className="pt-16 p-2 space-y-2">
      {messages.map((message, index) => (
        <Alert key={index} variant={"default"} className="rounded-sm bg-white">
          <AlertTitle>
            <Moon className="h-4 w-4 inline" />
            {message?.title}
          </AlertTitle>
          <AlertDescription>{message?.message}</AlertDescription>
        </Alert>
      ))}

      {parts.map((part, index) => {
        return (
          <>
            <div key={index}>
              <Link
                href={{
                  pathname: `/store/part/${part._id.toString()}`,
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <Image
                    width={300}
                    height={300}
                    src={part.imageUrls[0]}
                    alt="Test"
                  />
                  <div className="text-center text-xl">{`${part.category} ${part.model[0]} ${part.usedFor[0]} ${part.brand}`}</div>
                </div>
              </Link>
            </div>
          </>
        );
      })}
      <SearchBar />
    </div>
  );
}
// <Carousel>
//   <CarouselContent>
//     {recommendationList[0].parts.map((part) => (
//       <React.Fragment key={part.id}>
//         <CarouselItem>
//           <Link
//             href={{
//               pathname: `/store/part/${part.id}`,
//             }}
//           >
//             <div className="flex flex-col items-center justify-center">
//               <Image
//                 width={300}
//                 height={300}
//                 src={part.imageUrl}
//                 alt="Test"
//               />
//               <div className="text-center text-xl">{`${part.category} ${part.model} ${part.suitableFor} ${part.usedFor} ${part.brand}`}</div>
//             </div>
//           </Link>
//         </CarouselItem>
//       </React.Fragment>
//     ))}
//   </CarouselContent>
//   <CarouselPrevious />
//   <CarouselNext />
// </Carousel>

// {
//   /* INFINIT SCROLL ITEMS below the page */
// }
