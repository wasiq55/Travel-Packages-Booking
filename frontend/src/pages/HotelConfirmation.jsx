import { useLocation, useNavigate } from "react-router-dom";

const HotelConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        hotel,
        room,
        booking,
        checkIn,
        checkOut,
        guests,
        total
    } = location.state || {};

    if (!booking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#111311] px-5 text-[#f4f1e8]">
                <div className="text-center">
                    <h1 className="font-serif text-4xl">
                        Booking not found
                    </h1>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/hotels")
                        }
                        className="mt-6 rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311]"
                    >
                        Explore Hotels
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#111311] px-5 py-20 text-[#f4f1e8]">
            <div className="w-full max-w-2xl">
                <div className="rounded-3xl border border-white/10 bg-[#171917] p-7 text-center sm:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl">
                        ✓
                    </div>

                    <p className="mt-7 text-[10px] uppercase tracking-[0.35em] text-white/30">
                        Wander / Confirmation
                    </p>

                    <h1 className="mt-4 font-serif text-5xl">
                        Stay confirmed.
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/40">
                        Your hotel reservation has been successfully
                        confirmed. Keep your booking number for your
                        records.
                    </p>

                    <div className="mt-10 border-y border-white/10 py-7">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                            Booking number
                        </p>

                        <p className="mt-3 text-xl font-semibold tracking-wide">
                            {booking.bookingNumber}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 text-left sm:grid-cols-2">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Hotel
                            </p>

                            <p className="mt-2 text-sm">
                                {hotel?.name ||
                                    booking.hotel?.name ||
                                    "Hotel"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Room
                            </p>

                            <p className="mt-2 text-sm capitalize">
                                {room?.roomType ||
                                    booking.room?.roomType ||
                                    "Room"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Check-in
                            </p>

                            <p className="mt-2 text-sm">
                                {checkIn ||
                                    new Date(
                                        booking.startDate
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Check-out
                            </p>

                            <p className="mt-2 text-sm">
                                {checkOut ||
                                    new Date(
                                        booking.endDate
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Guests
                            </p>

                            <p className="mt-2 text-sm">
                                {guests ||
                                    booking.travelers
                                        ?.adults ||
                                    1}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                Amount paid
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                                ₹
                                {Number(
                                    total ||
                                    booking.totalAmount ||
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/my-trips")
                            }
                            className="rounded-full bg-[#f4f1e8] px-7 py-3.5 text-sm font-semibold text-[#111311] transition hover:bg-white"
                        >
                            View My Bookings
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/hotels")
                            }
                            className="rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/25"
                        >
                            Book Another Stay
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default HotelConfirmation;