"use server";
import StoreCarousel from "@/components/ui/carousel/store";
import { fetchSuggestions, getMongoDbCrudExecutor } from "@/lib/data";
import React, { Suspense } from "react";

// This store compoenent ui going to be smilar to Digikala ui
const Page: React.FC = async () => {
  const suggestions = await fetchSuggestions();
  return (
    <div>
      {suggestions.length && <StoreCarousel suggestion={suggestions[0]} />}

      {/* INFINIT SCROLL ITEMS below the page */}
    </div>
  );
};

export default Page;
