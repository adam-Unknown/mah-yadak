"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ShareDialog,
  ShareDialogCancel,
  ShareDialogContent,
  ShareDialogTrigger,
} from "@/components/ui/mah-yadak-share";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/actions/auth";
import {
  ChevronLeft,
  CircleUserRound,
  Hand,
  MapPin,
  MessageCircleMore,
  Moon,
  Phone,
  QrCode,
  ScrollText,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Nav({
  user,
  store,
  servicing,
}: {
  user?: any;
  store: boolean;
  servicing: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <NavigationMenu className="block sm:hidden fixed bottom-0 left-0 right-0">
      <NavigationMenuList className="justify-between w-full py-2 px-6 bg-white ">
        <NavigationMenuItem
          className={`${
            (pathname === "/store" ||
              pathname.includes("part") ||
              pathname.includes("/store/search")) &&
            "text-primary"
          }`}
        >
          <Link href="/store" legacyBehavior passHref>
            <NavigationMenuLink>
              <div className="flex flex-col justify-center items-center">
                <Store />
                <small className="font-bold">فروشگاه</small>
              </div>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem
          className={`${pathname === "/store/cart" && "text-primary"}`}
        >
          <Link href="/store/cart" legacyBehavior passHref>
            <NavigationMenuLink>
              <div className="flex flex-col justify-center items-center">
                <ShoppingBag />
                <small className="font-bold">سبد خرید</small>
              </div>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem
          className={`${pathname.includes("/dashboard") && "text-primary"}`}
        >
          <Drawer>
            <DrawerTrigger className="hover:outline-none m-0">
              <div className="flex flex-col justify-center items-center">
                <User />
                <small className="font-bold">حساب</small>
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  <Hand className="rotate-45 ml-2 w-4 h-4 inline" />
                  سلام
                  {user && `, ${user.fullname}`}
                </DrawerTitle>
              </DrawerHeader>
              <div className="mx-6">
                <ul className=" space-y-2">
                  {user ? (
                    <>
                      <li className="flex flex-row justify-between">
                        <p>
                          <Link
                            href={`/dashboard/details`}
                            legacyBehavior
                            passHref
                          >
                            <NavigationMenuLink>
                              <CircleUserRound className="w-4 h-4 inline ml-2" />
                              حساب
                            </NavigationMenuLink>
                          </Link>
                        </p>
                        <ChevronLeft className="w-4 h-4 inline my-auto" />
                      </li>
                      <Separator />
                      <li className="flex flex-row justify-between">
                        <p>
                          <Link
                            href={`/dashboard/orders`}
                            legacyBehavior
                            passHref
                          >
                            <NavigationMenuLink>
                              <ScrollText className="w-4 h-4 inline ml-2" />
                              تاریخچه سفارشات
                            </NavigationMenuLink>
                          </Link>
                        </p>
                        <ChevronLeft className="w-4 h-4 inline my-auto" />
                      </li>
                    </>
                  ) : (
                    <p></p>
                  )}
                </ul>
              </div>
              <DrawerFooter className="w-full">
                {user ? (
                  <Logout />
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.replace(`/login?redirect=${pathname}&open=1`);
                    }}
                  >
                    ورود
                  </Button>
                )}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Drawer>
            <DrawerTrigger className="hover:outline-none m-0">
              <div className="flex flex-col justify-center items-center">
                <MessageCircleMore />
                <small className="font-bold">تماس با ما</small>
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  <MessageCircleMore className="rotate-12 mb-3 ml-2 w-6 h-6 inline" />
                  تماس با ما
                </DrawerTitle>
              </DrawerHeader>
              <div className="mx-6">
                <ul className=" space-y-3">
                  <li>
                    <Moon
                      strokeWidth={3}
                      className={`${
                        store ? "text-primary" : "text-gray-500"
                      } w-4 h-4 inline ml-2`}
                    />
                    <span>
                      فروشگاه{" "}
                      {
                        <span className="font-bold">
                          {store ? "باز" : "بسته"}{" "}
                        </span>
                      }
                    </span>
                  </li>
                  <Separator />
                  <li>
                    <Moon
                      strokeWidth={3}
                      className={`${
                        servicing ? "text-primary" : "text-gray-500"
                      } w-4 h-4 inline ml-2`}
                    />
                    <span>
                      خدمات وب{" "}
                      {
                        <span className="font-bold">
                          {store ? "آنلاین" : "آفلاین"}
                        </span>
                      }
                    </span>
                  </li>
                  <Separator />
                  <li className="flex flex-row justify-between">
                    <ShareDialog>
                      <ShareDialogTrigger>
                        <QrCode className="w-4 h-4 inline ml-2" />
                        اشتراک گذاری
                      </ShareDialogTrigger>
                      <ShareDialogContent className="z-[20002]">
                        <Image
                          height={480}
                          width={480}
                          src="/mah-yadak.png"
                          alt="خطا در بارگذاری تصویر"
                          className="w-full aspect-square"
                        />
                        <ShareDialogCancel className="bg-primary">
                          بستن
                        </ShareDialogCancel>
                      </ShareDialogContent>
                    </ShareDialog>

                    <ChevronLeft className="w-4 h-4 inline my-auto" />
                  </li>
                  <Separator />
                  <li className="flex flex-row justify-between">
                    <Link href="tel:+989981339356" className="w-full">
                      <Phone className="w-4 h-4 inline ml-2" />
                      تماس
                    </Link>
                    <ChevronLeft className="w-4 h-4 inline my-auto" />
                  </li>
                  <Separator />
                  <li className="flex flex-row justify-between">
                    <p>
                      <MapPin className="w-4 h-4 inline ml-2" />
                      آدرس فروشگاه: خوزستان،در ابتدای خیابان سعیدی، روبروی مسجد
                      جواد الأمه, فروشگاه ماه یدک
                    </p>
                  </li>
                  <Separator />
                  <li className="flex flex-row justify-between">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d434.99266801782414!2d49.20936273100756!3d30.56178879841803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snl!4v1707400988826!5m2!1sen!2snl"
                      className="w-full aspect-video"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </li>
                  <Separator />
                </ul>
              </div>
            </DrawerContent>
          </Drawer>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function Logout() {
  const { handleSubmit, formState } = useForm();
  const pathname = usePathname();
  const router = useRouter();
  const submit = async () => {
    await logout(pathname);

    window.location.reload();
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Button
        className="w-full"
        variant="destructive"
        type="submit"
        disabled={formState.isSubmitting}
      >
        خروج از حساب
      </Button>
    </form>
  );
}
