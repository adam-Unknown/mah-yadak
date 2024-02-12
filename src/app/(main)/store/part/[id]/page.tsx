"use server";
import React from "react";
import { getMongoDbCrudExecutor, getUserSession } from "@/lib/data";
import PartCarousel from "@/components/ui/carousel/part";
import EditCart from "@/components/cart/edit-cart";
import { ObjectId } from "mongodb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dot, Frown } from "lucide-react";
import ClosePageButton from "@/components/close";

interface Props {
  params: { id: string };
}

const Page: React.FC<Props> = async ({ params: { id } }) => {
  const { user } = await getUserSession();
  const projection = {
    $project: {
      _id: 1,
      category: 1,
      model: { $first: "$model" },
      properties: 1,
      usedFor: 1,
      imageUrls: 1,
      notes: 1,
      available: {
        $gte: [
          { $subtract: ["$warehouse.stock", "$withinOrderProcessing"] },
          1,
        ],
      },
      brand: 1,
      description: 1,
      price: user?.phone
        ? { $multiply: ["$sale.buyPrice", { $sum: ["$sale.vat", 1] }] }
        : `جهت اطلاع از قیمت لطفا از طریق پنل تماس با ما, تماس بگیرید.`,
      latestPriceUpdate: "$sale.updatedAt",
    },
  };
  const part = (await getMongoDbCrudExecutor("parts", async (parts) =>
    parts
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "orders",
            let: {
              partId: {
                $toString: "$_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$status",
                      ["تایید شده و در حال ارسال", "در انتظار تایید"],
                    ],
                  },
                },
              },
              {
                $unwind: {
                  path: "$items",
                },
              },
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$items.partId", "$$partId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  quantity: "$items.quantity",
                },
              },
            ],
            as: "withinOrderProcessing",
          },
        },
        {
          $addFields: {
            withinOrderProcessing: {
              $sum: ["$withinOrderProcessing.quantity"],
            },
          },
        },
        projection,
      ])
      .next()
  )()) as any;

  return (
    <div className="pt-14 p-2">
      <ClosePageButton />
      <Card className="rounded-sm p-2 space-y-3">
        <CardHeader className="p-0">
          <PartCarousel imagesUrls={part?.imageUrls} />
          <p className="m-3 text-center text-xl">
            <span className="font-bold">{`${part?.model} ${part?.properties} `}</span>
            {`${part?.usedFor.join(",")} `}
            <span className="font-bold">{`${part?.brand}`}</span>
          </p>
        </CardHeader>
        {part?.available ? (
          <>
            <CardContent className="space-y-4">
              <p className="text-lg">
                قیمت:{" "}
                <span className="font-bold">
                  {`${(part?.price as number).toLocaleString("fa-IR")} `}
                  {user && "تومان"}
                </span>
              </p>

              {user?.phone && (
                <EditCart
                  toAdd={true}
                  defaultValues={{ partId: part?._id.toString(), quantity: 1 }}
                />
              )}
              {part?.notes && part.notes?.lenght > 0 && (
                <Alert variant="destructive">
                  <AlertTitle className="font-bold">توجه</AlertTitle>
                  <AlertDescription className="w-full overflow-x-clip break-words">
                    <ul className="text-wrap">
                      {part.notes.map((notice: any, index: number) => (
                        <li key={index}>
                          <p>* {notice}</p>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {part?.description && (
                <Alert variant={"default"}>
                  <AlertTitle className="font-bold">توضیحات</AlertTitle>
                  <AlertDescription className="text-wrap">
                    <p>{part.description}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            {user && (
              <CardFooter>
                <small className="text-gray-400 font-bold mx-auto">
                  قیمت بروزشده:{" "}
                  {new Date(part?.latestPriceUpdate).toLocaleDateString(
                    "fa-IR"
                  )}
                </small>
              </CardFooter>
            )}
          </>
        ) : (
          <Alert>
            <Frown />
            <AlertTitle>اتمام موجودی!</AlertTitle>
            <AlertDescription>
              <p>متاسفانه موجودی این قطعه به اتمام رسیده.</p>
              <p>و بزودی موجود خواهد شد.</p>
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default Page;
