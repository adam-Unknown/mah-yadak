"use server";
import React from "react";
import { getMongoDbCrudExecutor, getUserSession } from "@/lib/data";
import Nav from "./nav";

// this layout going to be used for all pages which would include the navbar that appears on all pages, and this going to be client component and not server component but also it's going to have server compoentns inside of it.
const MainLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const { user } = await getUserSession();
  const storeState = await getMongoDbCrudExecutor(
    "store-status",
    async (storeState) => storeState.findOne({})
  )();

  return (
    <div className="pb-16">
      <Nav
        user={user}
        store={storeState?.store}
        servicing={storeState?.servicing}
      />
      {/* SEARCH BAR ON TOP LIKE ADAVCE ATUO PART AND ON FOCUS IT GOES FULL SCREEN MODAL */}
      {children}
    </div>
  );
};

export default MainLayout;
