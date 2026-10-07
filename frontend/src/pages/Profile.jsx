import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-[#111311] px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
            <p className="mb-4 text-[9px] uppercase tracking-[0.35em] text-white/40">
              Wander · Explore India
            </p>

            <h1 className="font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
              Login Required
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/45">
              Sign in to access your profile, manage your trips, and continue
              planning your journey across India.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-8 rounded-full bg-white px-7 py-3 text-[9px] uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white/80"
            >
              Go to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayName = user.name || user.fullName || "Traveler";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role = user.role || "Traveler";
  const phone = user.phone || user.phoneNumber || "Not provided";
  const email = user.email || "Not provided";

  return (
    <main className="min-h-screen bg-[#111311] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/40 transition-colors duration-300 hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Home
          </button>

          <p className="hidden text-[8px] uppercase tracking-[0.35em] text-white/25 sm:block">
            Wander / Profile
          </p>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025]">
          <div className="relative h-52 overflow-hidden border-b border-white/10 sm:h-64">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_35%)]" />

            <div className="absolute bottom-8 left-6 sm:left-10">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
                Your journey
              </p>

              <h1 className="mt-3 font-serif text-4xl tracking-[-0.05em] sm:text-6xl">
                Profile
              </h1>
            </div>
          </div>

          <div className="px-6 pb-10 sm:px-10 lg:px-14">
            <div className="-mt-12 flex flex-col gap-6 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white text-2xl font-medium tracking-wide text-black shadow-2xl sm:h-28 sm:w-28">
                  {initials}
                </div>

                <div className="pb-1">
                  <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">
                    {displayName}
                  </h2>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/35">
                    {role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-fit rounded-full border border-white/15 px-6 py-3 text-[9px] uppercase tracking-[0.25em] text-white/60 transition-all duration-300 hover:border-white/50 hover:bg-white hover:text-black"
              >
                Logout
              </button>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-2">
              <div className="bg-[#111311] p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                      01
                    </p>

                    <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em]">
                      Personal Information
                    </h3>
                  </div>

                  <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                    Account
                  </span>
                </div>

                <div className="mt-10 space-y-7">
                  <div className="border-b border-white/10 pb-5">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Full Name
                    </p>

                    <p className="mt-2 text-sm text-white/80">
                      {displayName}
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-5">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Email Address
                    </p>

                    <p className="mt-2 break-words text-sm text-white/80">
                      {email}
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-5">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Phone Number
                    </p>

                    <p className="mt-2 text-sm text-white/80">
                      {phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Account Role
                    </p>

                    <p className="mt-2 text-sm capitalize text-white/80">
                      {role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#151715] p-7 sm:p-9">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                    02
                  </p>

                  <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em]">
                    Your TravelX Account
                  </h3>

                  <p className="mt-5 max-w-md text-sm leading-7 text-white/40">
                    Everything you need to plan, organize, and manage your
                    journeys across India is right here.
                  </p>
                </div>

                <div className="mt-10 space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate("/trip-builder")}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 text-left text-black transition-all duration-300 hover:bg-white/85"
                  >
                    <span>
                      <span className="block text-[8px] uppercase tracking-[0.25em] text-black/40">
                        Start planning
                      </span>

                      <span className="mt-1 block text-sm font-medium">
                        Plan a New Trip
                      </span>
                    </span>

                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                      ↗
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/my-trips")}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 px-5 py-4 text-left transition-all duration-300 hover:border-white/30 hover:bg-white/[0.04]"
                  >
                    <span>
                      <span className="block text-[8px] uppercase tracking-[0.25em] text-white/30">
                        Your journeys
                      </span>

                      <span className="mt-1 block text-sm font-medium text-white/80">
                        View My Trips
                      </span>
                    </span>

                    <span className="text-lg text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>
                  </button>
                </div>

                <div className="mt-10 border-t border-white/10 pt-6">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                    Explore India
                  </p>

                  <p className="mt-3 text-xs leading-6 text-white/35">
                    Discover destinations, find hotels, and build your perfect
                    itinerary with Wander.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
              <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                Wander · Explore India
              </p>

              <button
                type="button"
                onClick={() => navigate("/destinations")}
                className="text-left text-[9px] uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white sm:text-right"
              >
                Explore Destinations ↗
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;