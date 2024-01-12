export const authSessionOptions = {
  cookieName: "auth",
  password: process.env.SESSION_SECRET || "",
  ttl: 60 * 15, // 15 minutes
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15 - 60, // Expire cookie before the session expires.
  },
};

export const userSessionOptions = {
  cookieName: "user",
  password: process.env.SESSION_SECRET || "",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
