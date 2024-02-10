"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Search } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchBarSchema = z.object({ query: z.string().optional() });

export default function Index() {
  const form = useForm<z.infer<typeof searchBarSchema>>({
    resolver: zodResolver(searchBarSchema),
    defaultValues: { query: "" },
  });

  const submit = (data: z.infer<typeof searchBarSchema>) => {
    document.getElementById("searchLink")?.click();
  };

  return (
    <div className="relative w-screen overflow-clip h-screen p-3 flex flex-col justify-center space-y-6 bg-[url('/wallpaper.jpg')] bg-cover text-primary">
      <h1 className="text-xl mx-auto font-bold text-center">
        خوش آمدید <Moon className="inline" />
      </h1>
      <p className="text-center">
        معرفی: به وب سایت ماه یدک خوش آمدید, هدف از راه اندازی این وب سرویس جهت
        ایجاد سهولت در دسترسی به انواع قطعات با کیفیت, کمیاب, برند برتر و از همه
        مهم تر قیمت مناسب قطعات
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="flex flex-row space-x-2 justify-center"
        >
          <Link
            id="searchLink"
            href={`/store/search?q=${form.watch("query")}`}
          />
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="w-auto bg-white hover:outline-1 hover:outline-primary text-gray-600"
                    {...field}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    autoSave="off"
                    placeholder="جستجو قطعه ..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button>
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Form>
      <div className="absolute left-0 right-0 bottom-16 flex flex-row justify-center">
        <Link href="/store">
          <Button>ورود به فروشگاه</Button>
        </Link>
      </div>
    </div>
  );
}
