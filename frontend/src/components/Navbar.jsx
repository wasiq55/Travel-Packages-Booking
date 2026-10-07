import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Destinations", path: "/destinations" },
  { name: "Hotels", path: "/hotels" },
  { name: "Trip Builder", path: "/trip-builder" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const profileActive = location.pathname === "/profile";

  return (
    <header
      className={`sticky top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-[#111311]/95 py-3 backdrop-blur-xl"
          : "bg-[#111311] py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="group flex items-center gap-3 text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-xs transition-all duration-300 group-hover:bg-white group-hover:text-black">
            W
          </span>

          <div>
            <p className="font-serif text-xl leading-none tracking-[-0.05em]">
              Wander
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-[0.35em] text-white/45">
              Explore India
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 text-[9px] uppercase tracking-[0.25em] transition-colors duration-300 ${
                  active
                    ? "text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {link.name}

                <span
                  className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/profile"
            className={`rounded-full border px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${
              profileActive
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/70 hover:border-white hover:bg-white hover:text-black"
            }`}
          >
            Profile
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-white/20 px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
          >
            Login
          </Link>

          <Link
            to="/trip-builder"
            className="rounded-full bg-white px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-white/80"
          >
            Plan a Trip ↗
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/20 lg:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-px w-4 bg-white transition-transform duration-300 ${
              menuOpen ? "translate-y-[4px] rotate-45" : ""
            }`}
          />

          <span
            className={`h-px w-4 bg-white transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 lg:hidden ${
          menuOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-[#111311]/95 p-5 backdrop-blur-xl">
          <nav className="flex flex-col">
            {navLinks.map((link, index) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`border-b border-white/10 py-4 text-xs uppercase tracking-[0.25em] transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  } ${
                    index === navLinks.length - 1
                      ? "border-b-0"
                      : ""
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/profile"
              className={`rounded-full border px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] ${
                profileActive
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/70"
              }`}
            >
              Profile
            </Link>

            <Link
              to="/login"
              className="rounded-full border border-white/20 px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] text-white/70"
            >
              Login
            </Link>
          </div>

          <Link
            to="/trip-builder"
            className="mt-2 block rounded-full bg-white px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] text-black"
          >
            Plan a Trip
          </Link>
        </div>
      </div>
    </header>
  );
}