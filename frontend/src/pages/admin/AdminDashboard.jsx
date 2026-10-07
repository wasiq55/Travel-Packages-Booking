import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  approveHotel,
  rejectHotel,
} from "../../api/adminHotelApi";

const AdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const navigate = useNavigate();

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/hotels/admin/all");
      setHotels(response.data.hotels || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load hotels"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleApprove = async (hotelId) => {
    try {
      setActionLoading(hotelId);
      setError("");

      await approveHotel(hotelId);
      await fetchHotels();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to approve hotel"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (hotelId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this hotel?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(hotelId);
      setError("");

      await rejectHotel(hotelId);
      await fetchHotels();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reject hotel"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleManageRooms = (hotel) => {
    navigate(`/admin-rooms/${hotel._id}`, {
      state: { hotel },
    });
  };

  const handleManageFood = (hotel) => {
    navigate("/admin-food", {
      state: { hotel },
    });
  };

  return (
    <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-[#151715] lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-left"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                Wander
              </p>

              <h1 className="mt-2 font-serif text-3xl tracking-tight text-[#f4f1e8]">
                Admin Panel
              </h1>
            </button>

            <div className="mt-10 space-y-7">
              <div>
                <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Overview
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/admin-dashboard")}
                  className="flex w-full items-center rounded-xl bg-white/8 px-3 py-3 text-left text-sm font-medium text-white"
                >
                  Dashboard
                </button>
              </div>

              <div>
                <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Hotels
                </p>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate("/admin-hotels")}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Manage Hotels
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin-hotels/add")}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Add Hotel
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Destinations
                </p>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate("/admin-states")}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    States
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin-cities")}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Cities
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin-places")}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Places
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Hotel Operations
                </p>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (hotels.length > 0) {
                        handleManageRooms(hotels[0]);
                      }
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Rooms
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (hotels.length > 0) {
                        handleManageFood(hotels[0]);
                      }
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    Food
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto hidden border-t border-white/10 pt-6 lg:block">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Back to Website
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
                  Wander / Administration
                </p>

                <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                  Dashboard
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                  Manage hotels, destinations, rooms and food operations
                  from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin-hotels/add")}
                className="rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white"
              >
                Add New Hotel
              </button>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => navigate("/admin-hotels")}
                className="rounded-2xl border border-white/10 bg-[#171917] p-5 text-left transition hover:border-white/20 hover:bg-[#1b1d1b]"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Hotels
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {hotels.length}
                </p>

                <p className="mt-2 text-xs text-white/35">
                  Total registered hotels
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin-states")}
                className="rounded-2xl border border-white/10 bg-[#171917] p-5 text-left transition hover:border-white/20 hover:bg-[#1b1d1b]"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Destinations
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  States
                </p>

                <p className="mt-2 text-xs text-white/35">
                  Manage Indian states
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin-cities")}
                className="rounded-2xl border border-white/10 bg-[#171917] p-5 text-left transition hover:border-white/20 hover:bg-[#1b1d1b]"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Destinations
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  Cities
                </p>

                <p className="mt-2 text-xs text-white/35">
                  Manage city locations
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin-places")}
                className="rounded-2xl border border-white/10 bg-[#171917] p-5 text-left transition hover:border-white/20 hover:bg-[#1b1d1b]"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Destinations
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  Places
                </p>

                <p className="mt-2 text-xs text-white/35">
                  Manage tourist places
                </p>
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <p className="text-sm text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchHotels}
                  className="mt-4 rounded-full border border-red-300/20 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-300/10"
                >
                  Try Again
                </button>
              </div>
            )}

            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Hotel Management
                  </p>

                  <h3 className="mt-2 font-serif text-3xl">
                    All Hotels
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin-hotels")}
                  className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
                >
                  View All
                </button>
              </div>

              {loading && (
                <div className="rounded-2xl border border-white/10 bg-[#171917] p-10 text-center">
                  <p className="text-sm text-white/45">
                    Loading hotels...
                  </p>
                </div>
              )}

              {!loading && !error && hotels.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#171917] p-10 text-center">
                  <p className="font-serif text-2xl">
                    No hotels found
                  </p>

                  <p className="mt-2 text-sm text-white/40">
                    Add your first hotel to begin managing properties.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/admin-hotels/add")}
                    className="mt-6 rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311]"
                  >
                    Add Hotel
                  </button>
                </div>
              )}

              {!loading && hotels.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {hotels.map((hotel) => (
                    <article
                      key={hotel._id}
                      className="rounded-2xl border border-white/10 bg-[#171917] p-5 transition hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-serif text-2xl leading-tight">
                            {hotel.name}
                          </h4>

                          <p className="mt-2 text-sm text-white/40">
                            {hotel.city?.name || "City not available"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                            hotel.isApproved
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {hotel.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>

                      <div className="mt-6 space-y-3 border-t border-white/8 pt-5">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                            Owner
                          </p>

                          <p className="mt-1 text-sm text-white/65">
                            {hotel.owner?.name || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm text-white/65">
                            {hotel.owner?.email || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                            Phone
                          </p>

                          <p className="mt-1 text-sm text-white/65">
                            {hotel.phone || "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                            hotel.isActive
                              ? "bg-white/8 text-white/60"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {hotel.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {!hotel.isApproved && (
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleApprove(hotel._id)}
                            disabled={actionLoading === hotel._id}
                            className="rounded-xl bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading === hotel._id
                              ? "Please wait..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(hotel._id)}
                            disabled={actionLoading === hotel._id}
                            className="rounded-xl bg-red-400/10 px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleManageRooms(hotel)}
                          className="rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-white/65 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                        >
                          Manage Rooms
                        </button>

                        <button
                          type="button"
                          onClick={() => handleManageFood(hotel)}
                          className="rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-white/65 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                        >
                          Manage Food
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;