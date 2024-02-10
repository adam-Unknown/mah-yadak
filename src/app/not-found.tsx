import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen p-3 flex flex-col justify-center text-gray-600 space-y-4">
      <h1 className="mx-auto font-bold text-primary opacity-70 text-5xl">
        {(404).toLocaleString("fa-IR")}!
      </h1>
      <h2 className="mx-auto font-bold text-lg">صفحه مورد نظر شما پیدا نشد.</h2>
      <Link href="/" className="mx-auto">
        <Button>برو به صفحه اصلی</Button>
      </Link>
    </div>
  );
}
