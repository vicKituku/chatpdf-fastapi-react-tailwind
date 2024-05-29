import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { Analytics } from "@vercel/analytics/react";

const MainLayout = () => {
  return (
    <>
      <Analytics />
      {/* <NavBar /> */}
      <Outlet />
    </>
  );
};

export default MainLayout;
