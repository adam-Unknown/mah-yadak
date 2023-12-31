"use server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  ActionReturn,
  AuthViaMobileNumberFormSchema,
  AuthViaSmsFormSchema,
  CODE_EXPIRATION,
  MoblieNumberSchema,
  sessionData,
  VerifyCodeFormSchema,
} from "./definition";
import { z } from "zod";
import { genVrfCode, getErrMsgFromZod } from "@/utils/auth-utils";
import { sessionOptions } from "@/session.config";

export const login = async (data: unknown): Promise<ActionReturn> => {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);

  // check the no user logged in
  if (session.user)
    if (session.verified)
      return {
        succ: false,
        err: [{ msg: "You are already logged in!", path: "root" }],
      };

  // check the form fields
  const validatedFields = AuthViaSmsFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      succ: false,
      err: getErrMsgFromZod(validatedFields.error),
    };
  }
  const { mobileNumber, vrfCode } = validatedFields.data;

  // TODO: check if the moblie number is already in the database and belong to a user
  if (mobileNumber !== "123")
    return {
      succ: false,
      err: [
        {
          msg: "The moblie number is not registerd in server yet!",
          path: "mobileNumber",
        },
      ],
    };

  // check the expiration of the verify code
  if (Date.now() - (session.vrfCode?.expire || Date.now()) > 0)
    return {
      succ: false,
      err: [{ msg: "The verification code is expired!", path: "vrfCode" }],
    };

  if (session.vrfCode?.code !== vrfCode)
    return {
      succ: false,
      err: [{ msg: "The verification code is incorrect!", path: "vrfCode" }],
    };

  session.user = { name: "Adam" };
  session.moblieNumber = mobileNumber;
  session.verified = true;
  await session.save();
  return { succ: true };
};

export const logout = async (): Promise<ActionReturn> => {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);

  if (!session.user)
    return {
      succ: false,
      err: [{ msg: "You are not logged in!", path: "root" }],
    };

  session.destroy();

  return { succ: true };
};

export const sendCode = async (data: unknown): Promise<ActionReturn> => {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);

  // If the user is already logged in, return 400 Bad Request
  if (session.verified || session.user)
    return {
      succ: false,
      err: [{ msg: "You already logged in!", path: "root" }],
    };

  // validate the user' mobile number schema
  if (!MoblieNumberSchema.safeParse(data).success)
    return {
      succ: false,
      err: [{ msg: "It's not a mobile number!", path: "root" }],
    };

  // TODO: check the user's moblie number is already registered
  if (data !== "123")
    return {
      succ: false,
      err: [
        {
          msg: "The moblie number is not registerd in server yet!",
          path: "mobileNumber",
        },
      ],
    };

  // check if first time sending code or not
  if (session.vrfCode?.code) {
    const a = Date.now();
    const b = a - (session.vrfCode?.expire - CODE_EXPIRATION);
    if (b < 10 * 1000) {
      // if the code time left to resend not elapsed than
      return {
        succ: false,
        err: [{ msg: "Can't send now so plz be patient", path: "root" }],
      };
    }
  }

  // generate a VRF code and store it in the session
  const code = "321"; // getVrfCode();
  // TODO: send the code to the user's mobile number
  // store in session
  session.vrfCode = { code: "321", expire: Date.now() + CODE_EXPIRATION };
  await session.save();

  return { succ: true };
};
