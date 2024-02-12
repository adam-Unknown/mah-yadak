"use client";

import Login from "@/app/login/page";
import { Sheet, SheetContent } from "./sheet";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <Sheet
      open={!!searchParams.get("open")}
      onOpenChange={(opened) =>
        setTimeout(
          () =>
            !opened &&
            router.replace(
              `${window.location.origin}/${searchParams.get("redirect") ?? ""}`
            ),
          500
        )
      }
    >
      <SheetContent className="pt-12">
        <Login />
      </SheetContent>
    </Sheet>
  );
}
