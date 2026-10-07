import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const getHotelImage = (hotel) => {
    if (hotel?.image) {
        return hotel.image;
    }

    if (
        Array.isArray(hotel?.images) &&
        hotel.images.length > 0
    ) {
        const image = hotel.images[0];

        if (typeof image === "string") {
            return image;
        }

        return (
            image?.url ||
            image?.secure_url ||
            image?.src ||
            "/images/goa.jpg"
        );
    }

    return "/images/goa.jpg";
};

const getHotelCity = (hotel) => {
    if (typeof hotel?.city === "object") {
        return hotel.city?.name || "";
    }

    return hotel?.cityName || hotel?.city || "";
};

const getBookingType = (booking) => {
    if (booking?.bookingType) {
        return booking.bookingType;
    }

    if (booking?.hotel) {
        return "hotel";
    }

    return "trip";
};

const getStatusText = (booking) => {
    if (
        booking?.paymentStatus === "paid" &&
        booking?.bookingStatus === "confirmed"
    ) {
        return "Confirmed";
    }

    if (
        booking?.bookingStatus === "payment_pending"
    ) {
        return "Payment Pending";
    }

    if (
        booking?.bookingStatus === "cancelled"
    ) {
        return "Cancelled";
    }

    if (
        booking?.bookingStatus === "completed"
    ) {
        return "Completed";
    }

    if (
        booking?.paymentStatus === "failed"
    ) {
        return "Payment Failed";
    }

    return booking?.bookingStatus || "Pending";
};

const MyTrip = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/bookings/my-bookings"
                );

                const data = response.data;

                const bookingList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.bookings)
                        ? data.bookings
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];

                setBookings(bookingList);
            } catch (requestError) {
                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load your bookings."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    const hotelBookings = bookings.filter(
        (booking) =>
            getBookingType(booking) === "hotel"
    );

    const tripBookings = bookings.filter(
        (booking) =>
            getBookingType(booking) === "trip"
    );

    return (
        <main className="min-h-screen bg-[#111311] pb-20 text-[#f4f1e8]">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
                <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                        Wander / My Trips
                    </p>

                    <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">
                        Your journeys.
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
                        View your hotel reservations and trips,
                        payment status and booking details in one place.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-72 animate-pulse rounded-3xl border border-white/10 bg-[#171917]"
                            />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <section className="rounded-3xl border border-white/10 bg-[#171917] px-6 py-16 text-center sm:px-10">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                            No bookings yet
                        </p>

                        <h2 className="mt-4 font-serif text-4xl">
                            Your next journey starts here.
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/40">
                            Explore hotels and destinations and
                            create your next memorable stay.
                        </p>

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/hotels")
                                }
                                className="rounded-full bg-[#f4f1e8] px-7 py-3.5 text-sm font-semibold text-[#111311]"
                            >
                                Explore Hotels
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/destinations")
                                }
                                className="rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white"
                            >
                                Explore Destinations
                            </button>
                        </div>
                    </section>
                ) : (
                    <div className="space-y-12">
                        {hotelBookings.length > 0 && (
                            <section>
                                <div className="mb-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                            Hotel stays
                                        </p>

                                        <h2 className="mt-2 font-serif text-3xl">
                                            Your reservations
                                        </h2>
                                    </div>

                                    <p className="text-xs text-white/30">
                                        {hotelBookings.length}{" "}
                                        {hotelBookings.length === 1
                                            ? "booking"
                                            : "bookings"}
                                    </p>
                                </div>

                                <div className="grid gap-5 lg:grid-cols-2">
                                    {hotelBookings.map(
                                        (booking) => (
                                            <HotelBookingCard
                                                key={
                                                    booking._id
                                                }
                                                booking={
                                                    booking
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {tripBookings.length > 0 && (
                            <section>
                                <div className="mb-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                            Trip Builder
                                        </p>

                                        <h2 className="mt-2 font-serif text-3xl">
                                            Your trips
                                        </h2>
                                    </div>

                                    <p className="text-xs text-white/30">
                                        {tripBookings.length}{" "}
                                        {tripBookings.length === 1
                                            ? "trip"
                                            : "trips"}
                                    </p>
                                </div>

                                <div className="grid gap-5 lg:grid-cols-2">
                                    {tripBookings.map(
                                        (booking) => (
                                            <TripBookingCard
                                                key={
                                                    booking._id
                                                }
                                                booking={
                                                    booking
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

const HotelBookingCard = ({ booking }) => {
    const hotel = booking.hotel;
    const room = booking.room;

    const status = getStatusText(booking);

    const statusClass =
        status === "Confirmed"
            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            : status === "Cancelled"
                ? "border-red-400/20 bg-red-400/10 text-red-300"
                : "border-amber-400/20 bg-amber-400/10 text-amber-300";

    return (
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
            <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="h-56 sm:h-full">
                    <img
                        src={getHotelImage(hotel)}
                        alt={
                            hotel?.name ||
                            "Hotel"
                        }
                        className="h-full w-full object-cover"
                        onError={(event) => {
                            event.currentTarget.src =
                                "/images/goa.jpg";
                        }}
                    />
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                                Hotel stay
                            </p>

                            <h3 className="mt-2 font-serif text-2xl">
                                {hotel?.name ||
                                    "Hotel Reservation"}
                            </h3>

                            <p className="mt-1 text-xs text-white/35">
                                {getHotelCity(hotel) ||
                                    hotel?.address ||
                                    "India"}
                            </p>
                        </div>

                        <span
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] ${statusClass}`}
                        >
                            {status}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-5">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Room
                            </p>

                            <p className="mt-1 text-sm capitalize">
                                {room?.roomType ||
                                    "Room"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Guests
                            </p>

                            <p className="mt-1 text-sm">
                                {booking.travelers
                                    ?.adults ||
                                    1}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Check-in
                            </p>

                            <p className="mt-1 text-sm">
                                {formatDate(
                                    booking.startDate
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Check-out
                            </p>

                            <p className="mt-1 text-sm">
                                {formatDate(
                                    booking.endDate
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-5">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Booking
                            </p>

                            <p className="mt-1 text-xs text-white/45">
                                {booking.bookingNumber}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Total
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {formatPrice(
                                    booking.totalAmount
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                        <p className="text-xs text-white/30">
                            Payment:{" "}
                            <span className="capitalize text-white/55">
                                {booking.paymentStatus ||
                                    "unpaid"}
                            </span>
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                            Hotel Booking
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
};

const TripBookingCard = ({ booking }) => {
    const trip = booking.trip;

    const status = getStatusText(booking);

    const statusClass =
        status === "Confirmed"
            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            : status === "Cancelled"
                ? "border-red-400/20 bg-red-400/10 text-red-300"
                : "border-amber-400/20 bg-amber-400/10 text-amber-300";

    return (
        <article className="rounded-3xl border border-white/10 bg-[#171917] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-5">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                        Trip booking
                    </p>

                    <h3 className="mt-2 font-serif text-3xl">
                        {trip?.title ||
                            "Your Trip"}
                    </h3>
                </div>

                <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] ${statusClass}`}
                >
                    {status}
                </span>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-5 border-y border-white/10 py-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Start
                    </p>

                    <p className="mt-2 text-sm">
                        {formatDate(
                            booking.startDate ||
                            trip?.startDate
                        )}
                    </p>
                </div>

                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        End
                    </p>

                    <p className="mt-2 text-sm">
                        {formatDate(
                            booking.endDate ||
                            trip?.endDate
                        )}
                    </p>
                </div>

                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Adults
                    </p>

                    <p className="mt-2 text-sm">
                        {booking.travelers
                            ?.adults || 1}
                    </p>
                </div>

                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Rooms
                    </p>

                    <p className="mt-2 text-sm">
                        {booking.travelers
                            ?.rooms || 1}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-5">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Booking
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                        {booking.bookingNumber}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Total
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                        {formatPrice(
                            booking.totalAmount
                        )}
                    </p>
                </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs text-white/30">
                    Payment:{" "}
                    <span className="capitalize text-white/55">
                        {booking.paymentStatus ||
                            "unpaid"}
                    </span>
                </p>
            </div>
        </article>
    );
};

export default MyTrip;