"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchPartsWithFilter } from "@/lib/actions/search";
import { Badge } from "@/components/ui/badge";
import InfiniteScroll from "react-infinite-scroll-component";
import { ChevronsUp } from "lucide-react";

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
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [partSearchResult, setPartSearchResult] = useState<
    PartSearchResultItemType[]
  >([]);

  useEffect(() => {
    fetchPartsWithFilter(query, 0, limit).then((result) => {
      if (result.length === 0) setHasMore(false);
      setPartSearchResult(result);
    });
  }, []);

  const limit = 10;

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

  const submit = async ({ query }: z.infer<typeof searchBarSchema>) => {
    if (!query) return;
    const result = await fetchPartsWithFilter(query, 0, 10);
    setPartSearchResult(result);
  };

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
                      className="w-full bg-white hover:outline-1 hover:outline-primary shadow-lg"
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
      <InfiniteScroll
        dataLength={partSearchResult.length}
        hasMore={hasMore}
        next={() => {
          setSkip((prev) => prev + limit);
          fetchPartsWithFilter(query, skip + limit, limit).then((result) => {
            setHasMore(!!Math.floor(result.length / limit));

            setPartSearchResult((prev) => [...prev, ...result]);
          });
        }}
        loader={<Loading />}
        endMessage={
          <p className="my-2 text-center font-bold text-black/50">
            نتایج بیشتری وجود ندارد.
          </p>
        }
      >
        <ul className="py-3 space-y-3">
          {partSearchResult.map((part, index) => (
            <li key={index}>
              <PartResultCard {...part} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
      <ScrollToTopButton />
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
    <ul className="-mt-2 space-y-3">
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-80">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-50">
        <div className="col-span-2 w-full h-full aspect-square animate-pulse bg-black/20 rounded-sm"></div>
        <div className="col-span-5 p-2 space-y-4">
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
          <div className="h-6 animate-pulse bg-black/20 rounded"></div>
        </div>
      </li>
      <li className="p-3 grid grid-cols-7 gap-2 border border-gray-200 bg-white rounded-sm shadow-md opacity-20">
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
    </ul>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = () => {
    if (!isVisible && window.pageYOffset > window.innerHeight) {
      setIsVisible(true);
    } else if (isVisible && window.pageYOffset <= window.innerHeight) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const variants = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: 100 },
  };

  return (
    <motion.button
      className="fixed z-10 bottom-20 opacity-70 right-4 p-2 rounded-full bg-slate-900 text-primary shadow-lg"
      onClick={scrollToTop}
      animate={isVisible ? "visible" : "hidden"}
      initial="hidden"
      variants={variants}
    >
      <ChevronsUp />
    </motion.button>
  );
}
