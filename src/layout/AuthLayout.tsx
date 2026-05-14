import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const AuthLayout = () => {
  return (
    <>
      <Navbar />
      <main className="h-[calc(100vh-14vh)] w-full">
        <Outlet />
      </main>
    </>
  );
};
export default AuthLayout