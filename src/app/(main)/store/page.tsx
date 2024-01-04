import CardList from "@/components/card-list";
import { performMongoDbCRUD } from "@/lib/data";
import { FindCursor } from "mongodb";
import React from "react";

type Suggestions = {
  _id: string;
  name: string;
  background: {
    color: string;
    image: string;
  };
  description: string;
  parts: string[];
};

const fetchSuggestions = performMongoDbCRUD<Suggestions>(async (db) =>

);

// This store compoenent ui going to be smilar to Digikala ui
const Store: React.FC = async () => {
  const suggestions = await fetchSuggestions;

  return <div>{/* Add your store content here */}</div>;
};

export default Store;
