"use server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  MS_TO_RESEND,
  CodeVerifyFormSchema,
  PhoneEnterFormSchema,
  AuthSessionData,
  State,
  UserSessionData,
  UserData,
} from "../definition";
import { authSessionOptions, userSessionOptions } from "@/session.config";
import { z } from "zod";
import { getMongoDbCrudExecutor, isRegistered } from "../data";
import { redirect } from "next/navigation";

interface PhoneEnterFormState
  extends State<z.infer<typeof PhoneEnterFormSchema>> {
  succ?: boolean;
  ResendError?: string;
  data?: { msToResend: number };
}

interface CodeVerifyFormSchema
  extends State<z.infer<typeof CodeVerifyFormSchema>> {}

export const sendCode = async (
  prevState: PhoneEnterFormState | undefined,
  formData: FormData
): Promise<PhoneEnterFormState | undefined> => {
  // fetch the session
  const session = await getIronSession<AuthSessionData>(
    cookies(),
    authSessionOptions
  );

  // TODO: in middleware check if the user is logged in

  // Code is already sent and time to resend is not passed
  if (
    session.code &&
    session.sentAt &&
    Date.now() - session.sentAt < MS_TO_RESEND
  ) {
    return {
      succ: false,
      ResendError: "You can resend the code after 1 minute",
      data: {
        msToResend: await getMsToResend(session.sentAt),
      },
    };
  }

  if (!session.phone) {
    //  TODO: check the form fields
    let validatedFields = PhoneEnterFormSchema.safeParse({
      phone: formData.get("phone"),
    });
    if (!validatedFields.success) {
      return {
        formErrors: validatedFields.error.flatten().formErrors,
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    validatedFields = await PhoneEnterFormSchema.refine(async ({ phone }) => {
      //  TODO: Check if phone is already in the database and belong to a user if is ok the return true otherwise false
      if (!(await isRegistered(phone))) {
        return false;
      }
      return true;
    }, "This phone number is not registered in system").safeParseAsync({
      phone: formData.get("phone"),
    });
    if (!validatedFields.success) {
      return {
        formErrors: validatedFields.error.flatten().formErrors,
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    session.phone = validatedFields.data.phone;
  }

  // generate a VRF code and store it in the session
  const code = "123456"; // getVrfCode();
  // TODO: send the code to the user's mobile number
  // store in session
  session.code = code;
  session.sentAt = Date.now();
  await session.save();

  return {
    succ: true,
    data: {
      msToResend: await getMsToResend(session.sentAt),
    },
  };
};

export const logout = async () => {
  const session = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );

  session.destroy();

  return { succ: true };
};

export const verify = async (
  pervState: CodeVerifyFormSchema | undefined,
  formData: FormData
): Promise<CodeVerifyFormSchema | undefined> => {
  // TODO: in middleware check if the user is logged in
  const authSession = await getIronSession<AuthSessionData>(
    cookies(),
    authSessionOptions
  );

  if (!authSession.phone) return { formErrors: ["Phone number is not set"] };

  //  TODO: check the form fields
  let validatedFields = CodeVerifyFormSchema.safeParse({
    code: formData.get("code"),
  });
  if (!validatedFields.success) {
    return {
      formErrors: validatedFields.error.flatten().formErrors,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // verify the code
  validatedFields = CodeVerifyFormSchema.refine(({ code }) => {
    return authSession.code === code;
  }, "Code is invalid").safeParse({
    code: formData.get("code"),
  });
  if (!validatedFields.success) {
    return {
      formErrors: validatedFields.error.flatten().formErrors,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const userSession = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );

  // ____________________________________

  const getUserData = getMongoDbCrudExecutor<UserData>(
    "mah-yadak",
    async (db) =>
      await db
        .collection("accounts")
        .findOne({ phone: authSession.phone })
        .then((res) => {
          if (!res) throw new Error("User not found");
          return { name: res.name, phone: res.phone };
        })
  );

  // ____________________________________

  userSession.user = {
    name: (await getUserData()).name,
    phone: authSession.phone,
  };
  userSession.verified = true;
  await userSession.save();
  authSession.destroy();
  redirect("/");
};

export const editPhone = async () => {
  const session = await getIronSession<AuthSessionData>(
    cookies(),
    authSessionOptions
  );
  session.destroy();
};

export async function getMsToResend(sentAt?: number) {
  return (
    (!!sentAt
      ? sentAt
      : (await getIronSession<AuthSessionData>(cookies(), authSessionOptions))
          .sentAt ?? Date.now() - MS_TO_RESEND) +
    MS_TO_RESEND -
    Date.now()
  );
}

export const getPhone = async () =>
  (await getIronSession<AuthSessionData>(cookies(), authSessionOptions)).phone;
