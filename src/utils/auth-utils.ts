import { ActionError } from "@/lib/definition";
import { ZodError } from "zod";

export function genVrfCode(): string {
  const lenght = 6;
  let randomNumber = "";
  for (let i = 0; i < lenght; i++) {
    randomNumber += Math.floor(Math.random() * 10).toString();
  }
  return randomNumber;
}

export const getErrMsgFromZod = (zErr: ZodError): ActionError =>
  zErr.issues.reduce((errors: ActionError, issue) => {
    errors.push({ msg: issue.message, path: issue.path[0] as string });
    return errors;
  }, []);
