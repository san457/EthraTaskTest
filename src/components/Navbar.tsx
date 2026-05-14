import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="h-[14vh] lg:px-[7rem] sm:px-[3rem] p-[1rem]">
      <nav className="h-full flex items-center justify-between">
        <div>
          <div id="logo" className="sm:w-52 w-44">
            <img src="/logo.png" alt="Logo" className="w-full h-auto object-contain" />
          </div>


        </div>

        <div>
          <div className="px-2 py-1.5 flex gap-1 items-center border border-slate-200 rounded-2xl">
            <button className="py-2 sm:px-4 px-3 rounded-lg hover:bg-slate-50 cursor-pointer">
              <Link to="/auth/login">Log In</Link>
            </button>
            <button
              className="py-2 sm:px-4 px-3 rounded-lg text-white cursor-pointer
                         bg-gradient-to-r from-[#4079FA] via-[#7218FA] to-[#B212F0]
                         bg-[length:200%_100%] bg-left
                         hover:bg-right transition-all duration-500 ease-in-out"
            >
              <Link to="/auth/signup">Sign up</Link>

            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
