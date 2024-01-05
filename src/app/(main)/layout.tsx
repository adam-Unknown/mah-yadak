import Navbar from "@/components/navbar";
import React from "react";

// this layout going to be used for all pages which would include the navbar that appears on all pages, and this going to be client component and not server component but also it's going to have server compoentns inside of it.
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {/* Add your layout components here */}
      {/* Don't use header like yadakjo app */}
      {children}
      <Navbar />
    </div>
  );
};

export default Layout;
