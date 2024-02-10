"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchPartsWithFilter } from "@/lib/actions/search";
import { Badge } from "@/components/ui/badge";

const searchBarSchema = z.object({ query: z.string().optional() });

export type PartSearchResultItemType = {
  id: string;
  imageUrl: string;
  model: string;
  usedFor: string[];
  brand: string;
  properties?: string;
  price: number;
  available: boolean;
};

export default function Page() {
  const params = useSearchParams();
  const form = useForm<z.infer<typeof searchBarSchema>>({
    resolver: zodResolver(searchBarSchema),
    defaultValues: { query: params.get("q") || "" },
  });
  const [query, setQuery] = useState(params.get("q") || "");

  const [partSearchResult, setPartSearchResult] = useState<
    PartSearchResultItemType[]
  >([]);

  const control = useAnimation();
  const initial = { top: "1.15rem" };

  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    function handleScroll() {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollTop(st <= 0 ? 0 : st);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    if (isVisible) {
      control.start({ top: initial.top });
    } else {
      control.start({ top: "-8rem" });
    }
  }, [isVisible, control]);

  const result = z.coerce.number().min(1).safeParse(params.get("more"));
  const more = result.success ? result.data : 0;
  const submit = async ({ query }: z.infer<typeof searchBarSchema>) => {
    if (!query) return;
    const result = await fetchPartsWithFilter(query, 0, 10);
    setPartSearchResult(result);
  };

  useEffect(() => {
    form.handleSubmit(submit)(); // manually triggers the submit event
  }, []);

  // TODO add load more feature
  return (
    <div className="pt-16 px-2 overflow-x-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <motion.div
                  className="z-[100] fixed left-2 right-2"
                  initial={initial} // Initial statetate
                  animate={control}
                  transition={{ duration: 0.3 }} // Optional: Animation settings
                >
                  <FormControl>
                    <Input
                      className="w-full bg-white hover:outline-1 hover:outline-primary"
                      {...field}
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      autoSave="off"
                      placeholder="جستجو"
                    />
                  </FormControl>
                </motion.div>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <p className="overflow-clip">
        <span className="m-2 font-bold text-lg">نتایج جستجو:</span>
      </p>
      <ul className="py-3 space-y-3">
        {form.formState.isSubmitting ? (
          <Loading />
        ) : (
          partSearchResult.map((part, index) => (
            <li key={index}>
              <PartResultCard {...part} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function PartResultCard(part: PartSearchResultItemType) {
  return (
    <Link
      className="p-3 grid grid-cols-3 gap-2 border border-gray-200 bg-white rounded-sm shadow-md"
      href={`/store/part/${part.id}`}
    >
      <Image
        width={128}
        height={128}
        src={part.imageUrl}
        alt="x"
        className="-my-2 -mr-1.5 w-32 aspect-square rounded-sm"
      />
      <div className="h-full col-span-2 flex flex-col justify-between">
        <p className="overflow-x-scroll overflow-y-clip">
          <span className="font-bold">{`${part?.model} ${part?.properties} `}</span>
          {`${part?.usedFor.join(",")} `}
          <span className="font-bold">{`${part?.brand}`}</span>
        </p>
        <div className="flex flex-row justify-between py-1">
          {part.available ? (
            <>
              <Badge variant="default">
                <small>موجود</small>
              </Badge>
              <p>
                <span className="font-bold">
                  {part.price.toLocaleString("fa-IR")}
                </span>{" "}
                تومان
              </p>
            </>
          ) : (
            <Badge variant="secondary">
              <small>ناموجود</small>
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function Loading() {
  return (
    <>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-65">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-30">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-10">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
    </>
  );
}
