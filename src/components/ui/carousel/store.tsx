"use server";
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
  suggestion: any;
}

const StoreCarousel: React.FC<Props> = ({ suggestion }) => {
  return <></>;
};

export default StoreCarousel;
