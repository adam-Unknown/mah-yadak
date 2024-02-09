"use server";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getUserSession } from "@/lib/data";
import { CircleUser, MapPin, Phone, User, Wrench } from "lucide-react";
import Link from "next/link";

const Account = async () => {
  const { user } = await getUserSession();
  return (
    <div className="px-2 pt-6 space-y-2">
      <fieldset className="w-full border border-gray-300 rounded-sm bg-white space-y-3 p-4">
        <legend>
          <span className="m-2 font-bold text-lg">مشخصات حساب کاربری</span>
        </legend>
        <p>
          <CircleUser className="inline w-4 h-4 ml-2" />
          نام و نام خانوادگی: <span className="font-bold">{user.fullname}</span>
        </p>
        <p>
          <Phone className="inline w-4 h-4 ml-2" />
          شماره همراه: <span className="font-bold">{user.phone}</span>
        </p>
        <p>
          <Wrench className="inline w-4 h-4 ml-2" /> نوع خدمات تعمیرگاه:{" "}
          <span className="font-bold">{user.profession}</span>
        </p>
        <p>
          <MapPin className="inline w-4 h-4 ml-2" />
          آدرس: <span className="font-bold">{user.address}</span>
        </p>
      </fieldset>
      <div className="w-full border border-gray-300 rounded-sm bg-white p-4">
        <p>
          در صورت وجود مغاییرت در اطلاعات ثبت شده, لطفا با از طریق{" "}
          <span className="font-bold">تماس با ما</span>, تماس بگیرید.
        </p>
      </div>
    </div>
  );
};

export default Account;
