import { Link } from "react-router-dom";

const exploreLinks = [
  { name: "Destinations", path: "/destinations" },
  { name: "Hotels", path: "/hotels" },
  { name: "Trip Builder", path: "/trip-builder" },
  { name: "My Trips", path: "/my-trips" },
];

const companyLinks = [
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Login", path: "/login" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#111311] text-white">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 py-20 sm:py-24 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                WANDER INDIA
              </p>

              <h2 className="mt-6 max-w-xl font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                Go somewhere
                <br />
                worth remembering.
              </h2>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/45">
                Discover beautiful destinations, handpicked stays and
                unforgettable experiences across India.
              </p>

              <Link
                to="/trip-builder"
                className="mt-8 inline-flex rounded-full border border-white/20 px-6 py-3 text-[9px] uppercase tracking-[0.25em] transition-all duration-300 hover:bg-white hover:text-black"
              >
                Start your journey ↗
              </Link>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                Explore
              </p>

              <div className="mt-6 flex flex-col gap-4">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group flex items-center justify-between border-b border-white/10 pb-3 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <span>{link.name}</span>

                    <span className="translate-x-[-5px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                Company
              </p>

              <div className="mt-6 flex flex-col gap-4">
                {companyLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group flex items-center justify-between border-b border-white/10 pb-3 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <span>{link.name}</span>

                    <span className="translate-x-[-5px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                Stay connected
              </p>

              <p className="mt-6 max-w-sm text-sm leading-7 text-white/45">
                Get travel inspiration, new destinations and special stays
                delivered occasionally.
              </p>

              <form className="mt-6 flex border-b border-white/20 pb-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />

                <button
                  type="submit"
                  className="text-[9px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
                >
                  Subscribe ↗
                </button>
              </form>

              <div className="mt-8 flex gap-3">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/50 transition-all hover:border-white hover:text-white"
                >
                  IG
                </a>

                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/50 transition-all hover:border-white hover:text-white"
                >
                  X
                </a>

                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/50 transition-all hover:border-white hover:text-white"
                >
                  IN
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[10px]">
              W
            </span>

            <p className="font-serif text-lg tracking-[-0.04em]">
              Wander
            </p>
          </div>

          <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
            © 2026 Wander India. All rights reserved.
          </p>

          <div className="flex gap-5 text-[9px] uppercase tracking-[0.2em] text-white/30">
            <Link
              to="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[-70px] left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[18vw] leading-none tracking-[-0.08em] text-white/[0.025]">
        WANDER
      </div>
    </footer>
  );
}