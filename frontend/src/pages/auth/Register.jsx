import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user"
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setFormError("");
    setSuccessMessage("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (formData.password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must contain at least 6 characters");
      return;
    }

    try {
      const data = await register(formData);

      if (data.success) {
        setSuccessMessage("Registration successful!");

        setTimeout(() => {
          navigate("/");
        }, 700);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111311] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-15%] top-[5%] h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1500px] items-center px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="hidden lg:block">
            <p className="text-[9px] uppercase tracking-[0.45em] text-white/35">
              WANDER INDIA / JOIN US
            </p>

            <h1 className="mt-8 max-w-3xl font-serif text-[85px] leading-[0.82] tracking-[-0.07em] xl:text-[115px]">
              Begin
              <br />
              <span className="text-white/35">somewhere.</span>
            </h1>

            <p className="mt-10 max-w-md text-sm leading-7 text-white/45">
              Create your Wander account and start discovering destinations,
              stays and experiences made for your next journey.
            </p>

            <div className="mt-12 flex items-center gap-5">
              <div className="h-px w-20 bg-white/20" />

              <span className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                Your journey starts here
              </span>
            </div>

            <div className="mt-16 grid max-w-md grid-cols-3 border-y border-white/10 py-6">
              <div>
                <p className="font-serif text-2xl">01</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-white/30">
                  Discover
                </p>
              </div>

              <div>
                <p className="font-serif text-2xl">02</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-white/30">
                  Plan
                </p>
              </div>

              <div>
                <p className="font-serif text-2xl">03</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-white/30">
                  Travel
                </p>
              </div>
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
                  Begin somewhere.
                </h1>
              </div>

              <div className="mb-7">
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                  CREATE ACCOUNT
                </p>

                <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em]">
                  Start your journey
                </h2>

                <p className="mt-2 text-xs leading-6 text-white/40">
                  Create an account to save trips and plan your next escape.
                </p>
              </div>

              {(error || formError) && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs leading-5 text-red-300">
                  {formError || error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-xs leading-5 text-green-300">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                  />
                </div>

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
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40"
                    >
                      Confirm Password
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFormError("");
                      }}
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/40 focus:bg-white/[0.05]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-white px-5 py-4 text-[9px] font-medium uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account ↗"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  Already a member?
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-4 text-[9px] uppercase tracking-[0.25em] text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.04] hover:text-white"
              >
                Sign In
              </Link>

              <div className="mt-6 text-center">
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
        Discover / Plan / Travel
      </div>
    </main>
  );
};

export default Register;