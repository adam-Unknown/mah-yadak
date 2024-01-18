import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function genVrfCode(): string {
  const lenght = 6;
  let randomNumber = "";
  for (let i = 0; i < lenght; i++) {
    randomNumber += Math.floor(Math.random() * 10).toString();
  }
  return randomNumber;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const fetchJSON = async <T = unknown>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json());
