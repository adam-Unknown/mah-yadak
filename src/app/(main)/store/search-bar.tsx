"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, useAnimation } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import Link from "next/link";
import fetchAutoComplete from "@/lib/actions/search";
import React from "react";

const searchBarSchema = z.object({ query: z.string().optional() });

export type AutoCompleteItemType = {
  id: string;
  imageUrl: string;
  name: string;
};

export default function SearchBar() {
  const form = useForm<z.infer<typeof searchBarSchema>>({
    resolver: zodResolver(searchBarSchema),
    defaultValues: { query: "" },
  });

  const [autoCompletes, setAutoCompletes] = useState<AutoCompleteItemType[]>(
    []
  );
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const control = useAnimation();
  const initial = { top: "1.25rem", right: "0.5rem" };
  const finial = { top: "0.5rem", right: "2.25rem" };

  const [formFocus, setFormFocus] = useState(false);

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
    if (!formFocus)
      if (isVisible) {
        control.start({ top: initial.top });
      } else {
        control.start({ top: "-8rem" });
      }
  }, [isVisible, control]);

  useEffect(() => {
    if (!formFocus) control.start(initial);
  }, [formFocus]);

  useEffect(() => {
    const query = form.watch("query");
    if (query === undefined || query === "") return;

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    setTimeoutId(
      setTimeout(async () => {
        setIsLoading(true);
        const result = await fetchAutoComplete(query);
        setIsLoading(false);
        if (!timeoutId) return;
        setAutoCompletes(result);
      }, 500)
    );
  }, [form.watch("query")]);

  const submit = ({ query }: z.infer<typeof searchBarSchema>) => {
    if (query === undefined || query === "") return;
    const _link = document.getElementById("searchLink") as HTMLLinkElement;
    _link.href = `/search?q=${query}`;
    _link.click();
  };

  return (
    <>
      <Link className="hidden" id="searchLink" href={``} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <motion.div
                  className="z-[100] fixed left-2"
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
                      onFocus={() => {
                        setFormFocus(true);
                        setTimeout(() => {
                          control.start(finial);
                        }, 300);
                      }}
                      placeholder="جستجو"
                    />
                  </FormControl>
                </motion.div>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div
        className={`fixed inset-0 m-0 z-[99] pt-12 overflow-x-scroll bg-background`}
        hidden={!formFocus}
      >
        <button
          className="fixed right-3 top-5 text-gray-600"
          onClick={() => setFormFocus(false)}
        >
          <X size={16} />
        </button>
        <Separator className="w-[100vw] mb-2 shadow-lg bg-primary" />

        <ul className="p-2">
          {isLoading
            ? "Loading"
            : autoCompletes.map((autoComplete, index) => (
                <React.Fragment key={autoComplete.id}>
                  {index !== 0 && <Separator className="my-1" />}
                  <AutoCompleteListItem {...autoComplete} />
                </React.Fragment>
              ))}
        </ul>
      </div>
    </>
  );
}

function AutoCompleteListItem(data: AutoCompleteItemType) {
  return (
    <li className="">
      <Link
        href={`/store/part/${data.id}`}
        className="flex items-center felx-row gap-3"
      >
        <Image
          width={52}
          height={52}
          src={data.imageUrl}
          alt="x"
          className="w-[52px] h-[52px] rounded-sm"
        />
        <span className="grow">{data.name}</span>
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </li>
  );
}
