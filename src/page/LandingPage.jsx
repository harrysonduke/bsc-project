import { Link } from "react-router-dom";
import logo from "../../public/trackAS.png";

const LandingPage = () => {
  return (
    <>
      <section
        className="h-[100vh] w-full grid place-items-center px-6 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/BackgroundLanding.jpg')" }}
      >
        {/* Background overlay (does not block clicks) */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

        {/* Glass Card */}
        <div className="relative z-10 w-[90%] max-w-md mx-auto p-8 rounded-2xl 
                        backdrop-blur-lg bg-white/20 border border-white/30
                        shadow-xl text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="logo"
              className="w-24 md:w-32 lg:w-40 object-contain"
            />
          </div>

          {/* Headings */}
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome to NACOS AMS
          </h1>

          <h2 className="text-lg text-white/90 mb-6">
            Register or Login
          </h2>

          {/* Buttons */}
          <div className="flex gap-x-4 justify-center">
            <Link to="/registerLecturer">
              <button className="btn btn-primary">Register</button>
            </Link>

            <Link to="/loginLecturer">
              <button className="btn btn-secondary">Login</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
