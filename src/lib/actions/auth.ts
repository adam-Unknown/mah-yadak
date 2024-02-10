"use server";
import { authSessionOptions, userSessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { isRegistered, fetchUser } from "../data";
import {
  PhoneEnterFormSchema,
  AuthSessionData,
  UserSessionData,
  SEC_TO_RESEND,
} from "../definition";
import { generateSmsCode } from "../utils";
import { ActionResultType } from "./cart";
import { revalidatePath } from "next/cache";

export const sendCode = async (
  phone: string
): Promise<ActionResultType & { data?: { resendOn: Date } }> => {
  // fetch the session
  const session = await getIronSession<AuthSessionData>(
    cookies(),
    authSessionOptions
  );

  // TODO: in middleware check if the user is logged in

  // Code is already sent and time to resend is not passed
  if (
    session.code &&
    session.resendOn &&
    new Date(session.resendOn).getTime() > new Date().getTime()
  ) {
    return {
      success: false,
      message: "لطفا کمی صبر کنید و سپس مجدد تلاش کنید.",
      data: {
        resendOn: session.resendOn,
      },
    };
  }

  if (phone) {
    //  TODO: check the form fields
    let validatedFields = PhoneEnterFormSchema.safeParse({ phone: phone });
    if (!validatedFields.success) {
      return {
        success: false,
        message: "لطفا شماره همراه خود را به درستی وارد کنید!",
      };
    }

    // check if the phone number is registered
    if (!(await isRegistered(validatedFields.data.phone)))
      return {
        success: false,
        message: "شماره همراه وارد شده در سیستم ما ثبت نشده است!",
      };
    session.phone = validatedFields.data.phone;
  }

  // generate a VRF code and store it in the session
  const code = generateSmsCode(); // getVrfCode();

  // send the code to the user
  const smsBody = JSON.stringify({
    to: session.phone,
    text: `فروشگاه ماه یدک \nکد تایید شما: ${code}`,
  });
  await fetch(
    "https://console.melipayamak.com/api/send/simple/723526f21e484e6591bd4c2dd3dcf95c",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: smsBody,
    }
  );
  // store in session
  session.code = code;
  const temp = new Date();
  temp.setSeconds(temp.getSeconds() + SEC_TO_RESEND);
  session.resendOn = temp;
  await session.save();

  return {
    success: true,
    message: "کد تایید به شماره همراه شما ارسال شد.",
    data: {
      resendOn: session.resendOn,
    },
  };
};

export const logout = async (redirectTo: string) => {
  const session = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );

  session.destroy();

  revalidatePath(redirectTo);
};

export const verify = async (code: number): Promise<ActionResultType> => {
  // TODO: in middleware check if the user is logged in
  const authSession = await getIronSession<AuthSessionData>(
    cookies(),
    authSessionOptions
  );

  if (authSession.timesAttempted && authSession.timesAttempted > 6)
    return {
      success: false,
      message: "شما بیش از حد تلاش کردید",
    };

  if (!authSession.phone)
    return {
      success: false,
      message: "خطا, لطفا صفحه رو ریفرش کنید.",
    };

  // verify the code
  if (authSession.code !== code) {
    authSession.timesAttempted = (authSession.timesAttempted ?? 0) + 1;
    await authSession.save();
    return {
      success: false,
      message: "کد وارد شده صحیح نمی باشد!",
    };
  }

  const userSession = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );

  try {
    // Check user existence
    const user = await fetchUser(authSession.phone);

    userSession.user = user;

    await userSession.save();

    revalidatePath("/store");

    return {
      success: true,
      message: `${user.fullname}`,
    };
  } catch (err) {
    // failure
    userSession.destroy();
    return {
      success: false,
      message:
        "خطای سیستمی رخ داده است. لطفا در زمانی دیگر مجدد تلاش بفرمایید.",
    };
  } finally {
    authSession.destroy();
  }
};

export const getPhone = async () =>
  (await getIronSession<AuthSessionData>(cookies(), authSessionOptions)).phone;
