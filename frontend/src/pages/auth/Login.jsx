import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    clearError();
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const data = await login(formData);

      if (data.success) {
        setSuccessMessage("Login successful!");

        const redirectPath = location.state?.from || "/";

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111311] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-15%] top-[10%] h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1500px] items-center px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_480px] lg:items-center">
          <div className="hidden lg:block">
            <p className="text-[9px] uppercase tracking-[0.45em] text-white/35">
              WANDER INDIA / ACCOUNT
            </p>

            <h1 className="mt-8 max-w-3xl font-serif text-[90px] leading-[0.82] tracking-[-0.07em] xl:text-[120px]">
              Welcome
              <br />
              <span className="text-white/35">back.</span>
            </h1>

            <p className="mt-10 max-w-md text-sm leading-7 text-white/45">
              Your next journey is waiting. Sign in to continue exploring
              destinations, stays and experiences across India.
            </p>

            <div className="mt-12 flex items-center gap-5">
              <div className="h-px w-20 bg-white/20" />

              <span className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                Continue your journey
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] border border-white/[0.03]" />

            <div className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8 lg:p-10">
              <div className="mb-8 lg:hidden">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40">
                  WANDER INDIA
                </p>

                <h1 className="mt-4 font-serif text-5xl tracking-[-0.06em]">
                  Welcome back.
                </h1>
              </div>

              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                  MEMBER LOGIN
                </p>

                <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em]">
                  Sign in to continue
                </h2>

                <p className="mt-2 text-xs leading-6 text-white/40">
                  Access your trips and continue planning your next escape.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs leading-5 text-red-300">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-xs leading-5 text-green-300">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-full bg-white px-5 py-4 text-[9px] font-medium uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loading ? "Signing in..." : "Sign in ↗"}
                  </span>
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  New here?
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-4 text-[9px] uppercase tracking-[0.25em] text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.04] hover:text-white"
              >
                Create Account
              </Link>

              <div className="mt-7 text-center">
                <Link
                  to="/"
                  className="text-[9px] uppercase tracking-[0.25em] text-white/30 transition-colors hover:text-white"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-3 -top-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#111311]">
              <span className="font-serif text-xl text-white/50">
                W
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 text-[8px] uppercase tracking-[0.35em] text-white/20 sm:left-8 lg:left-10">
        Wander India / 2026
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 text-[8px] uppercase tracking-[0.35em] text-white/20 sm:right-8 lg:right-10">
        Explore / Discover / Remember
      </div>
    </main>
  );
};

export default Login;