import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAppSelector } from "@app/hooks";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userRole={user?.role} userName={user?.userName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
export default Layout;
