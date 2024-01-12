"use server";
import React from "react";
import { fetchPart } from "@/lib/data";
import PartCarousel from "@/components/ui/carousel/part";

interface Props {
  params: { id: string };
}

const Page: React.FC<Props> = async ({ params: { id } }) => {
  const {
    id: partId,
    category,
    model,
    brand,
    available,
    price,
    usedFor,
    suitableFor,
    imageUrls,
    notices,
    description,
  } = await fetchPart(id);
  return (
    <div className="mx-[200px] bg-transparent">
      <PartCarousel imagesUrls={imageUrls} />
      <p>{`${model} ${suitableFor} used for ${usedFor.join(
        ","
      )} brand ${brand}`}</p>
      {notices && (
        <ul>
          {notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      )}
      <span>price: {price}</span>
      <form>
        <label htmlFor="quantity">quantity:</label>
        <input type="number" name="quantity" id="quantity" />
        <button type="submit">Add to cart</button>
      </form>
    </div>
  );
};

export default Page;
