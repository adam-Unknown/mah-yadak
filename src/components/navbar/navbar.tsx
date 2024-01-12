"use client";
import React, { Suspense } from "react";

export const revalidate = 1;

const Navbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ul>
    </nav>
  );
};

export default Navbar;
