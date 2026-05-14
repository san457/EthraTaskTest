import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAppContext } from "@/context/context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAppContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem('accessToken', res.data.accessToken);
      toast.success(res.data.message || "Login successful!");
      setIsAuthenticated(true);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      const res = err.response;

      if (res?.data?.errors && res.data.errors.length > 0) {
        toast.error(res.data.errors[0].msg || "Invalid input"); 
      } else if (res?.data?.message) {
        toast.error(res.data.message);
      } else {
        toast.error("Login failed. Something went wrong.");
      }
    }
  };


  return (
    <section className="h-full w-full flex md:flex-row flex-col items-center justify-center gap-5">
      {/* Left */}
      <div className="h-full w-1/2 md:flex hidden justify-center items-center px-[1rem]">
        <div className="w-[28rem] mt-10">
          <img src="/authImage.png" alt="Auth" className="w-full object-contain" />
        </div>
      </div>

      {/* Right */}
      <div className="h-full md:w-1/2 w-full flex justify-center items-center">
        <div className="auth-form-wrapper flex relative p-[1rem]">
          <div
            id="auth-form"
            className="sm:py-[6rem] py-[4rem] w-full flex flex-col gap-5 sm:w-96 rounded-2xl p-6 lg:bg-slate-50 relative z-10"
          >
            <h2 className="md:text-3xl text-[3.5rem] text-center font-bold mb-4">Welcome Back!</h2>

            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-2 rounded-2xl border border-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-2 rounded-2xl border border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="mt-2 bg-[#6352FB] text-white py-2 rounded-2xl cursor-pointer"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
