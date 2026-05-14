import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/context";

const Start = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth/signup");
    }
  };

  return (
    <section className="w-full h-full flex justify-center items-center px-4 sm:px-8 md:px-12">
      <div className="flex flex-col max-w-5xl text-center">
        <div id="content" className="flex flex-col items-center sm:gap-5 gap-6">
          <h1 id="content-h" className="sm:text-[3.5rem] text-[2.8rem] leading-[60px]">
            The Everything App, For Work
          </h1>
          <p className="sm:text-xl text-[18px]">
            <span className="md:font-semibold">Get everyone working in a single platform </span>designed to <br className="sm:block hidden" /> manage any type of work.
          </p>
          <button
            onClick={handleGetStarted}
            className="group flex items-center justify-center gap-2 sm:w-[20rem] w-[17rem] sm:py-[1rem] py-[.7rem] font-bold text-2xl rounded-xl text-white cursor-pointer bg-gradient-to-r from-[#4079FA] via-[#7218FA] to-[#B212F0]"
          >
            <span>Get Started</span>
            <i className="bi bi-arrow-right mt-1 group-hover:translate-x-1 transition"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Start;
