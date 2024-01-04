import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export const revalidate = 3;

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <header>
        {/* There would be componets like modal, sidebar, other stuff */}
      </header>
      <main>{children}</main>
      {/* No footer for (About us/ Content us) section is going to be spreate page as sesgment and going to be navigated by navbar */}
    </>
  );
};

export default Layout;
