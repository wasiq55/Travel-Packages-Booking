import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAllHotelsForAdmin,
    approveHotel,
    rejectHotel
} from "../../api/adminHotelApi";

const AdminHotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const navigate = useNavigate();

    const loadHotels = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllHotelsForAdmin();

            if (response.success) {
                setHotels(response.hotels || []);
            } else {
                setHotels([]);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load hotels"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const handleApprove = async (hotelId) => {
        try {
            setActionLoading(hotelId);
            setError("");

            await approveHotel(hotelId);
            await loadHotels();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to approve hotel"
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
            await loadHotels();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to reject hotel"
            );
        } finally {
            setActionLoading("");
        }
    };

    const filteredHotels = hotels.filter((hotel) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            hotel.name?.toLowerCase().includes(searchText) ||
            hotel.city?.name?.toLowerCase().includes(searchText) ||
            hotel.owner?.name?.toLowerCase().includes(searchText) ||
            hotel.owner?.email?.toLowerCase().includes(searchText);

        const matchesFilter =
            filter === "all" ||
            (filter === "approved" && hotel.isApproved) ||
            (filter === "pending" && !hotel.isApproved) ||
            (filter === "active" && hotel.isActive) ||
            (filter === "inactive" && !hotel.isActive);

        return matchesSearch && matchesFilter;
    });

    const approvedCount = hotels.filter(
        (hotel) => hotel.isApproved
    ).length;

    const pendingCount = hotels.filter(
        (hotel) => !hotel.isApproved
    ).length;

    const activeCount = hotels.filter(
        (hotel) => hotel.isActive
    ).length;

    return (
        <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
            <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin-dashboard")
                                }
                                className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                            >
                                ← Admin Dashboard
                            </button>

                            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
                                Wander / Hotels
                            </p>

                            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                                Hotel Management
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                                Review, approve and manage properties
                                registered on Wander.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin-hotels/add")
                            }
                            className="rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white"
                        >
                            Add New Hotel
                        </button>
                    </div>

                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                                Total
                            </p>

                            <p className="mt-3 text-3xl font-semibold">
                                {hotels.length}
                            </p>

                            <p className="mt-2 text-xs text-white/35">
                                Registered hotels
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                                Approved
                            </p>

                            <p className="mt-3 text-3xl font-semibold text-emerald-300">
                                {approvedCount}
                            </p>

                            <p className="mt-2 text-xs text-white/35">
                                Approved properties
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                                Pending
                            </p>

                            <p className="mt-3 text-3xl font-semibold text-amber-300">
                                {pendingCount}
                            </p>

                            <p className="mt-2 text-xs text-white/35">
                                Waiting for review
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                                Active
                            </p>

                            <p className="mt-3 text-3xl font-semibold">
                                {activeCount}
                            </p>

                            <p className="mt-2 text-xs text-white/35">
                                Currently active
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <p className="text-sm text-red-300">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={loadHotels}
                                    className="rounded-full border border-red-300/20 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-300/10"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 rounded-2xl border border-white/10 bg-[#171917] p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search hotel, city, owner or email..."
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["all", "All"],
                                    ["pending", "Pending"],
                                    ["approved", "Approved"],
                                    ["active", "Active"],
                                    ["inactive", "Inactive"]
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setFilter(value)
                                        }
                                        className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                                            filter === value
                                                ? "bg-[#f4f1e8] text-[#111311]"
                                                : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-12 text-center">
                            <p className="text-sm text-white/45">
                                Loading hotels...
                            </p>
                        </div>
                    ) : hotels.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-12 text-center">
                            <p className="font-serif text-3xl">
                                No hotels found
                            </p>

                            <p className="mt-3 text-sm text-white/40">
                                There are no registered hotels yet.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin-hotels/add")
                                }
                                className="mt-6 rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311]"
                            >
                                Add Hotel
                            </button>
                        </div>
                    ) : filteredHotels.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-[#171917] p-12 text-center">
                            <p className="font-serif text-3xl">
                                No matching hotels
                            </p>

                            <p className="mt-3 text-sm text-white/40">
                                Try changing your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredHotels.map((hotel) => (
                                <article
                                    key={hotel._id}
                                    className="rounded-2xl border border-white/10 bg-[#171917] p-5 transition hover:border-white/20"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="font-serif text-2xl leading-tight">
                                                {hotel.name}
                                            </h2>

                                            <p className="mt-2 text-sm text-white/40">
                                                {hotel.city?.name ||
                                                    "City not available"}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                                                hotel.isApproved
                                                    ? "bg-emerald-400/10 text-emerald-300"
                                                    : "bg-amber-400/10 text-amber-300"
                                            }`}
                                        >
                                            {hotel.isApproved
                                                ? "Approved"
                                                : "Pending"}
                                        </span>
                                    </div>

                                    <div className="mt-6 space-y-4 border-t border-white/8 pt-5">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                                Owner
                                            </p>

                                            <p className="mt-1 text-sm text-white/65">
                                                {hotel.owner?.name ||
                                                    "Unknown"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                                Email
                                            </p>

                                            <p className="mt-1 break-all text-sm text-white/65">
                                                {hotel.owner?.email ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                                Phone
                                            </p>

                                            <p className="mt-1 text-sm text-white/65">
                                                {hotel.phone ||
                                                    "Not available"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-5">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                            Property Status
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                                                hotel.isActive
                                                    ? "bg-white/8 text-white/60"
                                                    : "bg-red-400/10 text-red-300"
                                            }`}
                                        >
                                            {hotel.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    {!hotel.isApproved && (
                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleApprove(
                                                        hotel._id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    hotel._id
                                                }
                                                className="rounded-xl bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {actionLoading ===
                                                hotel._id
                                                    ? "Please wait..."
                                                    : "Approve"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleReject(
                                                        hotel._id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    hotel._id
                                                }
                                                className="rounded-xl bg-red-400/10 px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/admin-rooms/${hotel._id}`,
                                                    {
                                                        state: {
                                                            hotel
                                                        }
                                                    }
                                                )
                                            }
                                            className="rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                                        >
                                            Manage Rooms
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/admin-food",
                                                    {
                                                        state: {
                                                            hotel
                                                        }
                                                    }
                                                )
                                            }
                                            className="rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                                        >
                                            Manage Food
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin-states")
                            }
                            className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                        >
                            States
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin-cities")
                            }
                            className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                        >
                            Cities
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin-places")
                            }
                            className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                        >
                            Places
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHotelManagement;