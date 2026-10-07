import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
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

const getCityName = (hotel) => {
    if (typeof hotel?.city === "object") {
        return hotel.city?.name || "";
    }

    return hotel?.cityName || "";
};

const HotelPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        hotel,
        room,
        booking,
        checkIn,
        checkOut,
        guests,
        guestData,
        nights,
        total
    } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!booking?._id || !hotel || !room) {
            navigate("/hotels", {
                replace: true
            });
        }
    }, [
        booking,
        hotel,
        room,
        navigate
    ]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (
                window.Razorpay
            ) {
                resolve(true);
                return;
            }

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => {
                resolve(true);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(
                script
            );
        });
    };

    const handlePayment = async () => {
        if (!booking?._id) {
            setError(
                "Booking information is missing."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const razorpayLoaded =
                await loadRazorpay();

            if (!razorpayLoaded) {
                setError(
                    "Razorpay could not be loaded. Please check your internet connection."
                );
                setLoading(false);
                return;
            }

            const orderResponse =
                await api.post(
                    `/payments/create-order/${booking._id}`
                );

            const order =
                orderResponse.data?.order;

            const key =
                orderResponse.data?.key;

            if (
                !order?.id ||
                !key
            ) {
                throw new Error(
                    "Unable to create Razorpay order."
                );
            }

            const options = {
                key,
                amount: order.amount,
                currency:
                    order.currency || "INR",
                name: "Wander",
                description:
                    `${hotel.name || "Hotel"} - ${getRoomName(room)}`,
                order_id: order.id,
                prefill: {
                    name: `${guestData?.firstName || ""} ${guestData?.lastName || ""}`.trim(),
                    email:
                        guestData?.email || "",
                    contact:
                        guestData?.phone || ""
                },
                theme: {
                    color: "#111311"
                },
                handler: async (
                    response
                ) => {
                    try {
                        const verifyResponse =
                            await api.post(
                                "/payments/verify",
                                {
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature
                                }
                            );

                        const confirmedBooking =
                            verifyResponse
                                .data
                                ?.booking;

                        navigate(
                            "/hotel-confirmation",
                            {
                                replace: true,
                                state: {
                                    hotel,
                                    room,
                                    booking:
                                        confirmedBooking ||
                                        booking,
                                    checkIn,
                                    checkOut,
                                    guests,
                                    guestData,
                                    nights,
                                    total,
                                    payment:
                                        response
                                }
                            }
                        );
                    } catch (verifyError) {
                        setError(
                            verifyError
                                ?.response
                                ?.data
                                ?.message ||
                            "Payment verification failed."
                        );
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.on(
                "payment.failed",
                (response) => {
                    setError(
                        response?.error
                            ?.description ||
                        "Payment failed. Please try again."
                    );

                    setLoading(false);
                }
            );

            razorpay.open();
        } catch (paymentError) {
            setError(
                paymentError
                    ?.response
                    ?.data
                    ?.message ||
                paymentError?.message ||
                "Unable to start payment."
            );

            setLoading(false);
        }
    };

    if (!booking || !hotel || !room) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#111311] pb-20 text-[#f4f1e8]">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mb-10 text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                >
                    ← Back to booking
                </button>

                <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                        Wander / Secure Payment
                    </p>

                    <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
                        Secure your stay.
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
                        Your room is ready. Complete the payment
                        securely through Razorpay.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                        <div className="grid md:grid-cols-[280px_1fr]">
                            <div className="h-64 md:h-full">
                                <img
                                    src={getHotelImage(
                                        hotel
                                    )}
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

                            <div className="p-7 sm:p-9">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                                    Hotel reservation
                                </p>

                                <h2 className="mt-3 font-serif text-3xl">
                                    {hotel.name ||
                                        "Hotel"}
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    {getCityName(
                                        hotel
                                    ) ||
                                        hotel.address ||
                                        "India"}
                                </p>

                                <div className="mt-8 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Room
                                        </p>

                                        <p className="mt-2 text-sm capitalize">
                                            {getRoomName(
                                                room
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Guests
                                        </p>

                                        <p className="mt-2 text-sm">
                                            {guests}{" "}
                                            {Number(
                                                guests
                                            ) === 1
                                                ? "Guest"
                                                : "Guests"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Check-in
                                        </p>

                                        <p className="mt-2 text-sm">
                                            {checkIn}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Check-out
                                        </p>

                                        <p className="mt-2 text-sm">
                                            {checkOut}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-white/10 pt-6">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                        Main guest
                                    </p>

                                    <p className="mt-2 text-sm">
                                        {guestData?.firstName}{" "}
                                        {guestData?.lastName}
                                    </p>

                                    <p className="mt-1 text-xs text-white/35">
                                        {guestData?.email}
                                    </p>

                                    <p className="mt-1 text-xs text-white/35">
                                        {guestData?.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl bg-[#f4f1e8] p-7 text-[#111311] sm:p-8">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-black/35">
                                Payment
                            </p>

                            <h2 className="mt-3 font-serif text-3xl">
                                {formatPrice(
                                    total
                                )}
                            </h2>

                            <p className="mt-2 text-xs text-black/40">
                                {nights}{" "}
                                {nights === 1
                                    ? "night"
                                    : "nights"}{" "}
                                · Secure Razorpay checkout
                            </p>

                            <div className="my-7 border-t border-black/10 pt-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-black/50">
                                        Booking
                                    </span>

                                    <span className="font-medium">
                                        {booking.bookingNumber}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handlePayment
                                }
                                disabled={
                                    loading
                                }
                                className="w-full rounded-full bg-[#111311] px-6 py-4 text-sm font-semibold text-[#f4f1e8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Opening Payment..."
                                    : `Pay ${formatPrice(total)} →`}
                            </button>

                            <p className="mt-5 text-center text-[10px] leading-5 text-black/35">
                                Payments are processed securely
                                by Razorpay. Your booking is
                                confirmed only after successful
                                payment verification.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default HotelPayment;