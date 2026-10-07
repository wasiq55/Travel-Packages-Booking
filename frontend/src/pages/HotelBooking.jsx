import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
};

const getRoomPrice = (room) => {
    return (
        room?.pricePerNight ??
        room?.price ??
        room?.amount ??
        0
    );
};

const getRoomName = (room) => {
    return (
        room?.roomType ||
        room?.name ||
        room?.title ||
        "Room"
    );
};

const getHotelImage = (hotel) => {
    if (hotel?.image) {
        return hotel.image;
    }

    if (Array.isArray(hotel?.images) && hotel.images.length > 0) {
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

const getCityName = (hotel) => {
    if (typeof hotel?.city === "object") {
        return hotel.city?.name || "";
    }

    return hotel?.cityName || "";
};

const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) {
        return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference <= 0) {
        return 0;
    }

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );
};

const HotelBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const bookingData = location.state;

    const hotel = bookingData?.hotel;
    const room = bookingData?.room;

    const [checkIn, setCheckIn] = useState(
        bookingData?.checkIn || ""
    );

    const [checkOut, setCheckOut] = useState(
        bookingData?.checkOut || ""
    );

    const [guests, setGuests] = useState(
        String(bookingData?.guests || "2")
    );

    const [guestData, setGuestData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const roomPrice = Number(getRoomPrice(room));

    const nights = useMemo(() => {
        return calculateNights(
            checkIn,
            checkOut
        );
    }, [checkIn, checkOut]);

    const roomTotal = roomPrice * nights;

    const serviceFee = Math.round(
        roomTotal * 0.05
    );

    const taxes = Math.round(
        roomTotal * 0.12
    );

    const total = roomTotal + serviceFee + taxes;

    const cityName = getCityName(hotel);

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setGuestData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleContinue = async (event) => {
        event.preventDefault();

        setError("");

        if (!checkIn || !checkOut) {
            setError(
                "Please select your check-in and check-out dates."
            );
            return;
        }

        if (nights <= 0) {
            setError(
                "Check-out must be after check-in."
            );
            return;
        }

        if (Number(guests) > Number(room?.maxGuests || 999)) {
            setError(
                `This room allows a maximum of ${room.maxGuests} guests.`
            );
            return;
        }

        if (
            !guestData.firstName.trim() ||
            !guestData.lastName.trim() ||
            !guestData.email.trim() ||
            !guestData.phone.trim()
        ) {
            setError(
                "Please complete all guest details."
            );
            return;
        }

        if (!room?._id || !hotel?._id) {
            setError(
                "Hotel or room information is missing."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/bookings/hotel",
                {
                    hotelId: hotel._id,
                    roomId: room._id,
                    checkIn,
                    checkOut,
                    guests: Number(guests),
                    guestDetails: {
                        firstName:
                            guestData.firstName.trim(),
                        lastName:
                            guestData.lastName.trim(),
                        email:
                            guestData.email.trim(),
                        phone:
                            guestData.phone.trim()
                    },
                    totalAmount: total
                }
            );

            const booking =
                response.data?.booking;

            if (!booking?._id) {
                throw new Error(
                    "Booking was not created"
                );
            }

            navigate("/hotel-payment", {
                state: {
                    hotel,
                    room,
                    booking,
                    checkIn,
                    checkOut,
                    guests,
                    guestData,
                    nights,
                    roomTotal,
                    serviceFee,
                    taxes,
                    total
                }
            });
        } catch (requestError) {
            const message =
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to create booking.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!hotel || !room) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#111311] px-5 text-[#f4f1e8]">
                <div className="max-w-md text-center">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                        Wander / Booking
                    </p>

                    <h1 className="mt-5 font-serif text-4xl">
                        Booking information missing
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-white/40">
                        Please select a hotel and room before
                        continuing with your booking.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/hotels")
                        }
                        className="mt-7 rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white"
                    >
                        Explore Hotels
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#111311] pb-20 text-[#f4f1e8]">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                >
                    ← Back
                </button>

                <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                        Wander / Booking
                    </p>

                    <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">
                        Complete your stay.
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
                        Review your room, choose your dates and provide
                        the details needed to complete your reservation.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleContinue}
                    className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"
                >
                    <div className="space-y-6">
                        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                            <div className="grid sm:grid-cols-[240px_1fr]">
                                <div className="h-56 sm:h-full">
                                    <img
                                        src={getHotelImage(hotel)}
                                        alt={
                                            hotel.name ||
                                            "Hotel"
                                        }
                                        className="h-full w-full object-cover"
                                        onError={(
                                            event
                                        ) => {
                                            event.currentTarget.src =
                                                "/images/goa.jpg";
                                        }}
                                    />
                                </div>

                                <div className="p-6 sm:p-7">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                                        Your stay
                                    </p>

                                    <h2 className="mt-3 font-serif text-3xl">
                                        {hotel.name ||
                                            hotel.hotelName ||
                                            "Hotel"}
                                    </h2>

                                    <p className="mt-2 text-sm text-white/40">
                                        {cityName ||
                                            hotel.address ||
                                            "India"}
                                    </p>

                                    <div className="mt-7 border-t border-white/10 pt-5">
                                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                            Selected room
                                        </p>

                                        <p className="mt-2 text-lg capitalize">
                                            {getRoomName(
                                                room
                                            )}
                                        </p>

                                        <p className="mt-1 text-sm text-white/40">
                                            Up to{" "}
                                            {room.maxGuests ||
                                                2}{" "}
                                            guests
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#171917]">
                            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                    Your dates
                                </p>

                                <h2 className="mt-2 font-serif text-2xl">
                                    When are you staying?
                                </h2>
                            </div>

                            <div className="grid gap-5 px-6 py-7 sm:grid-cols-2 sm:px-8">
                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Check-in
                                    </label>

                                    <input
                                        type="date"
                                        value={checkIn}
                                        min={today}
                                        onChange={(
                                            event
                                        ) =>
                                            setCheckIn(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none [color-scheme:dark] focus:border-white/25"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Check-out
                                    </label>

                                    <input
                                        type="date"
                                        value={checkOut}
                                        min={
                                            checkIn ||
                                            today
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCheckOut(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none [color-scheme:dark] focus:border-white/25"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Guests
                                    </label>

                                    <select
                                        value={guests}
                                        onChange={(
                                            event
                                        ) =>
                                            setGuests(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none focus:border-white/25"
                                    >
                                        {[
                                            1,
                                            2,
                                            3,
                                            4,
                                            5,
                                            6,
                                            7,
                                            8
                                        ].map(
                                            (
                                                count
                                            ) => (
                                                <option
                                                    key={
                                                        count
                                                    }
                                                    value={
                                                        count
                                                    }
                                                    className="bg-[#171917]"
                                                >
                                                    {
                                                        count
                                                    }{" "}
                                                    {count ===
                                                    1
                                                        ? "Guest"
                                                        : "Guests"}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#171917]">
                            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                    Guest details
                                </p>

                                <h2 className="mt-2 font-serif text-2xl">
                                    Who is staying?
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    Enter the details of the main guest.
                                </p>
                            </div>

                            <div className="grid gap-5 px-6 py-7 sm:grid-cols-2 sm:px-8">
                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        First name
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={
                                            guestData.firstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="First name"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Last name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={
                                            guestData.lastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Last name"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            guestData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="you@example.com"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/30">
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            guestData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Phone number"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#f4f1e8] text-[#111311]">
                            <div className="border-b border-black/10 px-6 py-6 sm:px-7">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-black/35">
                                    Price summary
                                </p>

                                <h2 className="mt-2 font-serif text-2xl">
                                    Your reservation
                                </h2>
                            </div>

                            <div className="space-y-5 px-6 py-6 sm:px-7">
                                <div className="flex justify-between gap-5">
                                    <div>
                                        <p className="text-sm">
                                            {getRoomName(
                                                room
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-black/40">
                                            {formatPrice(
                                                roomPrice
                                            )}{" "}
                                            ×{" "}
                                            {nights || 0}{" "}
                                            {nights === 1
                                                ? "night"
                                                : "nights"}
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold">
                                        {formatPrice(
                                            roomTotal
                                        )}
                                    </p>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-black/50">
                                        Service fee
                                    </span>

                                    <span>
                                        {formatPrice(
                                            serviceFee
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-black/50">
                                        Taxes
                                    </span>

                                    <span>
                                        {formatPrice(
                                            taxes
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-black/10 pt-5">
                                    <div className="flex items-end justify-between gap-5">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-[0.2em] text-black/35">
                                                Total
                                            </p>

                                            <p className="mt-1 text-2xl font-semibold">
                                                {formatPrice(
                                                    total
                                                )}
                                            </p>
                                        </div>

                                        <p className="text-xs text-black/40">
                                            {nights || 0}{" "}
                                            {nights === 1
                                                ? "night"
                                                : "nights"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        loading
                                    }
                                    className="w-full rounded-full bg-[#111311] px-6 py-4 text-sm font-semibold text-[#f4f1e8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? "Creating Booking..."
                                        : "Continue to Payment →"}
                                </button>

                                <p className="text-center text-[10px] leading-5 text-black/35">
                                    Your reservation will be created
                                    before you continue to secure payment.
                                </p>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
};

export default HotelBooking;