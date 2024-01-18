import React from "react";
import { fetchPart, getUserSession } from "@/lib/data";
import PartCarousel from "@/components/ui/carousel/part";
import AddToCartForm from "@/components/part/add-to-cart";

interface Props {
  params: { id: string };
}

const Page: React.FC<Props> = async ({ params: { id } }) => {
  const part = await fetchPart({ partId: id });
  const user = await getUserSession();

  return (
    <div className="mx-[200px] bg-transparent">
      <PartCarousel imagesUrls={part.imageUrls} />
      <p>{`${part.model} ${part.suitableFor} used for ${part.usedFor.join(
        ","
      )} brand ${part.brand}`}</p>
      {part.notices && (
        <ul>
          {part.notices.map((notice: any) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      )}
      <span>price: {part.price}</span>

      {user && <AddToCartForm partId={part.id} />}
    </div>
  );
};

export default Page;
