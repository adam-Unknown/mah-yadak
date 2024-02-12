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
    <div className="relative w-screen overflow-hidden h-screen px-6 flex flex-col justify-center content-around bg-top space-y-20 bg-[url('/moon.jpg')] bg-cover text-primary">
      <div>
        <h1 className="text-3xl mx-auto font-bold text-center mb-6">
          خوش آمدید <Moon className="inline" />
        </h1>
        <p className="text-center">
          به وب سایت ماه یدک خوش آمدید. ما با ارائه خدمات بی نظیر خود، به دنبال
          ایجاد تجربه ای متفاوت برای خرید قطعات یدکی هستیم. از قطعات با کیفیت
          برتر تا قطعات کمیاب، همه و همه در اینجا قابل دسترس هستند. اما هدف اصلی
          ما ارائه این محصولات با قیمت مناسب و رقابتی است. امیدواریم تجربه خرید
          خوبی را در وب سایت ماه یدک داشته باشید.
        </p>
      </div>

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
      <Link href="/store" className="mx-auto">
        <Button>ورود به فروشگاه</Button>
      </Link>
    </div>
  );
}
