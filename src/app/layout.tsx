import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import SubRootLayout from "./sub-root-layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Link from "next/link";
export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

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
      <body className="m-0 p-0">
        <NextTopLoader
          color="#ffcc00"
          height={5}
          showSpinner={false}
          shadow="0 0 10px #ffcc00,0 0 5px #ffcc00"
        />
        <SubRootLayout>
          {children}
          {auth}
        </SubRootLayout>
        <Toaster />
        <Sonner position="top-center" />
      </body>
    </html>
  );
}
