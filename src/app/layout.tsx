import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import localFont from "next/font/local";
import SubRootLayout from "./sub-root-layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
export const metadata = {
  title: "ماه یدک",
  description: "فروشگاه بزرگ قطعات خودرو در ماهشهر!",
};

const VazirFont = localFont({ src: "./../asset/fonts/Vazir.ttf" });

// This layout not going to have and ui component but, context providers, fundamental styles, and other things that we want to be available to all pages.
export default function RootLayout({
  auth,
  children,
}: {
  auth: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`m-0 p-0 ${VazirFont.className}`}>
        <div className="sm:hidden">
          <NextTopLoader
            color="#ffcc00"
            height={6}
            showSpinner={false}
            shadow="0 0 10px #ffcc00,0 0 5px #ffcc00"
          />
          <SubRootLayout>
            {children}
            {auth}
          </SubRootLayout>
          <Toaster />
          <Sonner
            position="top-center"
            toastOptions={{
              style: {
                background: "#ffcc00",
                color: "#181818",
                border: "none",
              },
              className: VazirFont.className,
            }}
          />
        </div>
        <div className="hidden sm:flex flex-row justify-center items-center h-screen">
          <p>
            متاسفانه این سایت برای نمایش در دسکتاپ بهینه نشده است, و لطفا با
            نسخه موبایل استفاده شوید.
          </p>
        </div>
      </body>
    </html>
  );
}
