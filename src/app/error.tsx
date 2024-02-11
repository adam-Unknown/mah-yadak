"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen p-3 flex flex-col justify-center text-gray-600 space-y-4">
      <h2 className="mx-auto font-bold text-lg">
        خطایی رخ داده است, لطفا مجددا تلاش کنید.
      </h2>
      <div className="flex flex-row justify-evenly">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            window.location.reload.bind(window.location)
          }
        >
          تلاش مجدد
        </Button>
        <Link href="/">
          <Button>برو به صفحه اصلی</Button>
        </Link>
      </div>
      <p className="text-center">
        در صورت نمایش خطا پس از چندین تلاش مجدد, لطفا با پشتیبانی در میان
        بگذارید, با تشکر فراوان از تیم ماه یدک
      </p>
    </div>
  );
}
