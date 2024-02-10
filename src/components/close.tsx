"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronRight, XSquare } from "lucide-react";
import { motion, useAnimation, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClosePageButton({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const controls = useAnimation();

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
      controls.start({ opacity: 1 });
    } else {
      controls.start({ opacity: 0 });
    }
  }, [isVisible, controls]);

  const router = useRouter();
  return (
    <motion.div
      style={{}}
      className="fixed z-50 top-0 right-0 left-0 bg-white shadow-md"
      animate={controls}
    >
      <Link className="hidden" id="redirectTo" href={redirectTo ?? "/"}></Link>
      <button
        className="p-0 m-3 text-gray-500"
        onClick={() =>
          redirectTo
            ? document.getElementById("redirectTo")?.click()
            : router.back()
        }
      >
        <ChevronRight className="inline ml-1" />
        <span className="font-bold">بازگشت</span>
      </button>
    </motion.div>
  );
}
