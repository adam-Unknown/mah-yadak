"use server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import SearchBar from "./search-bar";
import { Card, CardContent } from "@/components/ui/card";

type ShowcaseItemType = {
  id: string;
  model: string;
  usedFor: string[];
  brand: string;
  properties: string;
  imageUrl: string;
};

type ShowcaseType = {
  id: string;
  backgroundUrl: string;
  backgroundColor: string;
  title: string;
  description: string;
  url?: string;
  items: ShowcaseItemType[];
};

// This store compoenent ui going to be smilar to Digikala ui
export default async function Store() {
  const messages =
    (await getMongoDbCrudExecutor("messages", async (messages) =>
      messages.find({}).toArray()
    )()) ?? [];

  const adsImageUrls = await getMongoDbCrudExecutor(
    "ads-imags-urls",
    async (adsImageUrls) => adsImageUrls.find({}).next()
  )();

  const showcases = await getMongoDbCrudExecutor<ShowcaseType[]>(
    "showcases",
    async (showcases) =>
      showcases
        .aggregate([
          {
            $unwind: {
              path: "$items",
            },
          },
          {
            $lookup: {
              from: "parts",
              let: {
                partIds: {
                  $toObjectId: "$items",
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$partIds"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    id: {
                      $toString: "$_id",
                    },
                    imageUrl: {
                      $first: "$imageUrls",
                    },
                    usedFor: 1,
                    model: { $first: "$model" },
                    brand: 1,
                    properties: 1,
                  },
                },
              ],
              as: "items",
            },
          },
          {
            $unwind: {
              path: "$items",
            },
          },
          {
            $group: {
              _id: "$_id",
              title: {
                $first: "$title",
              },
              description: {
                $first: "$description",
              },
              backgroundUrl: {
                $first: "$backgroundUrl",
              },
              backgroundColor: {
                $first: "$backgroundColor",
              },
              url: { $first: "$url" },
              items: {
                $push: "$items",
              },
            },
          },
        ])
        .toArray() as Promise<ShowcaseType[]>
  )();

  return (
    <div className="pt-20 pb-8 space-y-6 overflow-hidden">
      <div className="px-2 space-y-2">
        {messages.map((message, index) => (
          <Alert
            key={index}
            variant={"default"}
            className="rounded-sm bg-white"
          >
            <AlertTitle>
              <Mail className="h-4 w-4 inline" />
              {message?.title}
            </AlertTitle>
            <AlertDescription>{message?.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      <Carousel
        delay={5000}
        opts={{ loop: false, align: "start", direction: "rtl" }}
        className="w-full mx-auto shadow-lg"
        dir="rtl"
      >
        <CarouselContent>
          {(adsImageUrls?.imageUrls as string[]).map((imageUrl) => (
            <CarouselItem key={imageUrl}>
              <Image
                width={1920}
                height={1080}
                src={imageUrl}
                alt="خطا در بارگزاری تصویر"
                className="w-full aspect-video"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="space-y-4">
        {showcases.map((showcase) => (
          <div key={showcase.id} className="space-y-2">
            <div className="mx-2 h-full">
              <p className="mr-1 font-bold text-black/65 text-base">
                {showcase.title}
              </p>
              <ShowcaseTitleIcon
                style={{ color: showcase.backgroundColor }}
                height={6}
                width={180}
                sharpness={0.03}
              />
            </div>
            <div
              className="px-2 py-4 shadow-inner"
              style={{ background: showcase.backgroundColor }}
            >
              <Carousel
                opts={{ loop: false, align: "start", direction: "rtl" }}
                className="w-full mx-auto"
                dir="rtl"
              >
                <CarouselContent className="px-2 h-44">
                  <CarouselItem className="basis-2/5 h-full pl-4">
                    <Link
                      href={showcase.url ?? "#"}
                      className="h-full flex flex-col justify-center items-center"
                    >
                      <Image
                        width={480}
                        height={853}
                        src={showcase.backgroundUrl}
                        alt="x"
                        className="w-24 mx-auto"
                      />
                      <p className="mt-1 text-center text-sm text-ellipsis text-white">
                        {showcase.description}
                      </p>
                    </Link>
                  </CarouselItem>
                  {showcase.items.map((part) => (
                    <CarouselItem
                      key={part.id}
                      className="basis-1/3 h-full pl-2"
                    >
                      <Card className="h-full ">
                        <CardContent className="h-full grid grid-row-2 overflow-hidden p-0 rounded-sm">
                          <Image
                            width={128}
                            height={128}
                            alt="x"
                            src={part.imageUrl}
                            className="aspect-square w-24 h-24 mx-auto"
                          />
                          <p className="mt-1 text-center text-ellipsis">
                            <span className="font-bold">{`${part.model} ${part?.properties} `}</span>
                            {`${part.usedFor.join(",")} `}
                            <span className="font-bold">{`${part.brand}`}</span>
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        ))}
      </div>

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

function ShowcaseTitleIcon({
  className,
  sharpness,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  height: number;
  width: number;
  sharpness: number;
}) {
  return (
    <svg
      className={className}
      {...props}
      viewBox={`0 0 ${props.width} ${props.height}`} // Adjust these values to change the shape and size of the SVG
    >
      <polygon
        points={`${props.width * sharpness},0 ${props.width},0 ${
          props.width - props.width * sharpness
        },${props.height} 0,${props.height}`}
        fill="currentColor"
      />
    </svg>
  );
}
