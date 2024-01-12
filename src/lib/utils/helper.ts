export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const fetchJSON = async <T = unknown>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json());
