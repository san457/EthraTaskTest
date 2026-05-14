import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAppContext } from "@/context/context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; 

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message || "Registered successfully");
      navigate("/auth/login");

    } catch (error: any) {
      const res = error.response;

      if (res?.data?.errors && res.data.errors.length > 0) {
        toast.error(res.data.errors[0].msg || "Invalid input"); 
      } else if (res?.data?.message) {
        toast.error(res.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };


  return (
    <section className="h-full w-full flex md:flex-row flex-col items-center justify-center gap-5">
      <div className="h-full w-1/2 md:flex hidden justify-center items-center px-[1rem]">
        <div className="w-[28rem] mt-10">
          <img src="/authImage.png" alt="Auth" className="w-full object-contain" />
        </div>
      </div>

      <div className="h-full md:w-1/2 w-full flex justify-center items-center">
        <div className="auth-form-wrapper flex relative p-[1rem]">
          <div id="auth-form" className="py-[4rem] w-full flex flex-col gap-5 sm:w-96 rounded-2xl p-6 lg:bg-slate-50 relative z-10">
            <h2 className="md:text-3xl text-[3rem] text-center font-bold mb-4">Seconds to sign up!</h2>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="px-4 py-2 w-full rounded-2xl border border-gray-300"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="px-4 py-2 rounded-2xl border border-gray-300"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-2 rounded-2xl border border-gray-300"
              />

              <button type="submit" className="mt-2 bg-[#6352FB] text-white py-2 rounded-2xl">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
