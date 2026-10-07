import { useEffect, useState } from "react";
import { useTripBuilder } from "../../context/TripBuilderContext";
import { createTripBooking } from "../../api/bookingApi";
import {
    createPaymentOrder,
    verifyPayment
} from "../../api/paymentApi";
import { getTripSummary } from "../../api/tripApi";

const getId = (item) => {
    if (typeof item === "string") return item;
    return item?._id || item?.id || item?.placeId || null;
};

const getName = (item) => {
    if (typeof item === "string") return item;

    return (
        item?.name ||
        item?.title ||
        item?.hotelName ||
        item?.roomName ||
        item?.roomType ||
        item?.packageName ||
        "Selected item"
    );
};

const getCityName = (item) => {
    if (typeof item?.city === "object" && item.city) {
        return item.city.name || item.city.cityName || "City";
    }

    return item?.cityName || item?.name || "City";
};

const getPrice = (item) => {
    if (!item || typeof item !== "object") return 0;

    const price = Number(
        item.price ??
        item.pricePerNight ??
        item.pricePerPerson ??
        item.amount ??
        item.totalPrice ??
        0
    );

    return Number.isFinite(price) ? price : 0;
};

const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
};

const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);

    if (value && typeof value === "object") {
        return Object.values(value).flat().filter(Boolean);
    }

    return [];
};

const ReviewSection = ({ number, title, children }) => (
    <div className="border-b border-white/10 py-8 last:border-b-0">
        <div className="flex items-start gap-5">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/25">
                {String(number).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
                <h4 className="text-[10px] uppercase tracking-[0.35em] text-white/40">
                    {title}
                </h4>

                <div className="mt-5">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

const getSummaryData = (response) => {
    let data = response?.data ?? response;

    if (data?.data && !data?.cities && !data?.summary) {
        data = data.data;
    }

    return {
        summary: data?.summary || data,
        cities: Array.isArray(data?.cities)
            ? data.cities.filter(Boolean)
            : []
    };
};

const ReviewStep = () => {
    const {
        tripId,
        tripTitle,
        selectedZone,
        selectedStates,
        selectedCities,
        selectedPlaces,
        startDate,
        endDate,
        travelers,
        selectedHotels,
        selectedRooms,
        selectedTransport,
        selectedFoodPackages,
        foodPreferences,
        previousStep
    } = useTripBuilder();

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [tripSummary, setTripSummary] = useState(null);
    const [tripCities, setTripCities] = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState("");

    const places = toArray(selectedPlaces);
    const transportSelections = toArray(selectedTransport);

    const backendHotels = tripCities
        .filter((city) => city?.hotel)
        .map((city) => ({
            ...city.hotel,
            cityName: city.city?.name || "City"
        }));

    const backendRooms = tripCities
        .filter((city) => city?.room)
        .map((city) => ({
            ...city.room,
            cityName: city.city?.name || "City",
            nights: Number(city.nights) || 0,
            totalPrice: Number(city.hotelAmount) || 0
        }));

    const backendFoodPackages = tripCities
        .filter((city) => city?.foodPackage)
        .map((city) => ({
            ...city.foodPackage,
            cityName: city.city?.name || "City",
            nights: Number(city.nights) || 0,
            totalPrice: Number(city.foodAmount) || 0
        }));

    const hotels = backendHotels.length
        ? backendHotels
        : toArray(selectedHotels);

    const rooms = backendRooms.length
        ? backendRooms
        : toArray(selectedRooms);

    const foodPackages = backendFoodPackages.length
        ? backendFoodPackages
        : toArray(selectedFoodPackages);

    const backendTotal = Number(
        tripSummary?.totalAmount ??
        tripSummary?.total ??
        tripSummary?.grandTotal
    );

    const hasBackendTotal =
        tripSummary != null && Number.isFinite(backendTotal);

    const backendRideAmount = Number(
        tripSummary?.rideAmount ?? 0
    );

    const localTransportTotal = transportSelections.reduce(
        (total, transport) => {
            if (!transport || typeof transport !== "object") return total;

            const amount = Number(
                transport.amount ??
                transport.estimatedFare ??
                transport.price ??
                0
            );

            if (!Number.isFinite(amount)) return total;

            if (transport.amount != null) {
                return total + amount;
            }

            const travelerCount = Number(
                transport.travelers ?? travelers ?? 1
            );

            return total + amount * Math.max(1, travelerCount);
        },
        0
    );

    const localRoomTotal = rooms.reduce((total, room) => {
        if (!room || typeof room !== "object") return total;

        const savedTotal = Number(room.totalPrice);

        if (Number.isFinite(savedTotal) && savedTotal > 0) {
            return total + savedTotal;
        }

        return total + getPrice(room);
    }, 0);

    const localFoodTotal = foodPackages.reduce((total, food) => {
        if (!food || typeof food !== "object") return total;

        const savedTotal = Number(food.totalPrice);

        if (Number.isFinite(savedTotal) && savedTotal > 0) {
            return total + savedTotal;
        }

        const price = getPrice(food);
        const nights = Number(food.nights) || 1;
        const travelerCount = Number(travelers) || 1;

        if (food.pricePerPerson != null) {
            return total + price * nights * travelerCount;
        }

        return total + price;
    }, 0);

    const estimatedTotal =
        localRoomTotal + localFoodTotal + localTransportTotal;

    const displayedTotal = hasBackendTotal
        ? backendTotal
        : estimatedTotal;

    const formatDate = (date) => {
        if (!date) return "Not selected";

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            if (!tripId) {
                setTripSummary(null);
                setTripCities([]);
                setSummaryError("Trip information is missing.");
                return;
            }

            setSummaryLoading(true);
            setSummaryError("");

            try {
                const response = await getTripSummary(tripId);
                const result = getSummaryData(response);

                if (isMounted) {
                    setTripSummary(result.summary);
                    setTripCities(result.cities);
                }
            } catch (error) {
                if (isMounted) {
                    setSummaryError(
                        error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        error?.message ||
                        "Unable to load the trip summary."
                    );
                }
            } finally {
                if (isMounted) {
                    setSummaryLoading(false);
                }
            }
        };

        fetchSummary();

        return () => {
            isMounted = false;
        };
    }, [tripId]);

    const handlePayment = async () => {
        if (!tripId) {
            setPaymentError(
                "Trip information is missing. Please go back and try again."
            );
            return;
        }

        setPaymentLoading(true);
        setPaymentError("");

        try {
            const summaryResponse = await getTripSummary(tripId);
            const result = getSummaryData(summaryResponse);
            const summary = result.summary;

            setTripSummary(summary);
            setTripCities(result.cities);

            const calculatedTotal = Number(
                summary?.totalAmount ??
                summary?.total ??
                summary?.grandTotal
            );

            if (
                !Number.isFinite(calculatedTotal) ||
                calculatedTotal <= 0
            ) {
                throw new Error(
                    "Trip price could not be calculated. Please review your selections and try again."
                );
            }

            const bookingResponse = await createTripBooking(tripId);

            const booking =
                bookingResponse?.booking ||
                bookingResponse?.data?.booking ||
                bookingResponse?.data ||
                null;

            const bookingId = booking?._id || booking?.id;

            if (!bookingId) {
                throw new Error(
                    bookingResponse?.message ||
                    bookingResponse?.data?.message ||
                    "Booking could not be created."
                );
            }

            const orderResponse = await createPaymentOrder(bookingId);

            const order =
                orderResponse?.order ||
                orderResponse?.data?.order ||
                null;

            const paymentKey =
                orderResponse?.key ||
                orderResponse?.data?.key;

            if (!order?.id || !paymentKey) {
                throw new Error(
                    orderResponse?.message ||
                    orderResponse?.data?.message ||
                    "Payment order could not be created. Check your payment configuration."
                );
            }

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error(
                    "Razorpay checkout could not be loaded. Please check your internet connection and try again."
                );
            }

            const options = {
                key: paymentKey,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "Travel Booking",
                description: tripTitle || "Trip booking",
                order_id: order.id,
                handler: async (paymentResponse) => {
                    try {
                        const verificationResponse = await verifyPayment({
                            razorpay_order_id:
                                paymentResponse.razorpay_order_id,
                            razorpay_payment_id:
                                paymentResponse.razorpay_payment_id,
                            razorpay_signature:
                                paymentResponse.razorpay_signature
                        });

                        if (
                            verificationResponse?.success ||
                            verificationResponse?.data?.success
                        ) {
                            window.location.assign("/my-trips");
                            return;
                        }

                        setPaymentError(
                            verificationResponse?.message ||
                            verificationResponse?.data?.message ||
                            "Payment verification was not successful. Please contact support before trying again."
                        );
                    } catch (error) {
                        setPaymentError(
                            error?.response?.data?.message ||
                            error?.message ||
                            "Payment verification failed. Please contact support."
                        );
                    } finally {
                        setPaymentLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPaymentLoading(false);
                        setPaymentError(
                            "Payment window was closed. Your booking may still be pending."
                        );
                    }
                },
                theme: {
                    color: "#111827"
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                setPaymentLoading(false);
                setPaymentError(
                    response?.error?.description ||
                    "Payment failed. Please try again."
                );
            });

            razorpay.open();
        } catch (error) {
            setPaymentError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unable to start payment. Please try again."
            );

            setPaymentLoading(false);
        }
    };

    return (
        <section className="pt-6">
            <button
                type="button"
                onClick={previousStep}
                disabled={paymentLoading}
                className="mb-8 inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
                <span className="text-base">←</span>
                Back to transport
            </button>

            <div className="border-b border-white/10 pb-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
                            Step 08 / Final review
                        </p>

                        <h2 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-[92px]">
                            Review your
                            <br />
                            <span className="text-white/35">journey.</span>
                        </h2>

                        <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
                            Everything you've selected, gathered into one complete journey.
                            Review the details before confirming your booking.
                        </p>
                    </div>

                    <div className="shrink-0 lg:w-[260px]">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                            Booking status
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-white" />
                            <span className="text-xs text-white/60">
                                Ready for confirmation
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                    <div className="border border-white/10 bg-white/[0.015] px-5 sm:px-8">
                        <div className="border-b border-white/10 py-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                                        Your journey
                                    </p>

                                    <h3 className="mt-3 font-serif text-4xl tracking-[-0.05em] sm:text-5xl">
                                        {tripTitle || "Your Trip"}
                                    </h3>
                                </div>

                                <div className="border border-white/10 px-4 py-3">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                                        Travelers
                                    </p>

                                    <p className="mt-1 text-sm text-white/80">
                                        {travelers}{" "}
                                        {Number(travelers) === 1
                                            ? "Traveler"
                                            : "Travelers"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-6 border-t border-white/10 pt-7 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                        Start
                                    </p>
                                    <p className="mt-2 text-sm text-white/75">
                                        {formatDate(startDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                        End
                                    </p>
                                    <p className="mt-2 text-sm text-white/75">
                                        {formatDate(endDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                        Region
                                    </p>
                                    <p className="mt-2 text-sm text-white/75">
                                        {selectedZone?.name || "Not selected"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                        States
                                    </p>
                                    <p className="mt-2 text-sm text-white/75">
                                        {toArray(selectedStates).length} selected
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ReviewSection number={1} title="Selected cities">
                            {toArray(selectedCities).length ? (
                                <div className="flex flex-wrap gap-2">
                                    {toArray(selectedCities).map((city, index) => (
                                        <span
                                            key={getId(city) || index}
                                            className="border border-white/10 px-4 py-2 text-xs text-white/70"
                                        >
                                            {getName(city)}
                                        </span>
                                    ))}
                                </div>
                            ) : tripCities.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {tripCities.map((city, index) => (
                                        <span
                                            key={getId(city) || index}
                                            className="border border-white/10 px-4 py-2 text-xs text-white/70"
                                        >
                                            {getName(city.city)}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No cities selected.
                                </p>
                            )}
                        </ReviewSection>

                        <ReviewSection number={2} title="Selected places">
                            {places.length ? (
                                <ul className="divide-y divide-white/10">
                                    {places.map((place, index) => (
                                        <li
                                            key={getId(place) || index}
                                            className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="text-sm text-white/80">
                                                    {getName(place)}
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-white/30">
                                                {getCityName(place)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No places selected.
                                </p>
                            )}
                        </ReviewSection>

                        <ReviewSection number={3} title="Hotels">
                            {hotels.length ? (
                                <ul className="divide-y divide-white/10">
                                    {hotels.map((hotel, index) => (
                                        <li
                                            key={getId(hotel) || index}
                                            className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="text-sm text-white/80">
                                                    {getName(hotel)}
                                                </p>

                                                {hotel.cityName && (
                                                    <p className="mt-1 text-xs text-white/35">
                                                        {hotel.cityName}
                                                    </p>
                                                )}

                                                {hotel.address && (
                                                    <p className="mt-1 text-xs text-white/25">
                                                        {hotel.address}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-white/25">
                                                Selected
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No hotels selected.
                                </p>
                            )}
                        </ReviewSection>

                        <ReviewSection number={4} title="Rooms">
                            {rooms.length ? (
                                <ul className="divide-y divide-white/10">
                                    {rooms.map((room, index) => (
                                        <li
                                            key={getId(room) || index}
                                            className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="text-sm text-white/80">
                                                    {getName(room)}
                                                </p>

                                                {room.cityName && (
                                                    <p className="mt-1 text-xs text-white/35">
                                                        {room.cityName}
                                                    </p>
                                                )}

                                                {room.nights > 0 && (
                                                    <p className="mt-1 text-xs text-white/30">
                                                        {room.nights}{" "}
                                                        {room.nights === 1
                                                            ? "night"
                                                            : "nights"}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="shrink-0 text-sm text-white/55">
                                                {room.totalPrice > 0
                                                    ? formatPrice(room.totalPrice)
                                                    : getPrice(room) > 0
                                                        ? formatPrice(getPrice(room))
                                                        : "Price not available"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No rooms selected.
                                </p>
                            )}
                        </ReviewSection>

                        <ReviewSection number={5} title="Food packages">
                            {foodPackages.length ? (
                                <ul className="divide-y divide-white/10">
                                    {foodPackages.map((food, index) => (
                                        <li
                                            key={getId(food) || index}
                                            className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="text-sm text-white/80">
                                                    {getName(food)}
                                                </p>

                                                {food.cityName && (
                                                    <p className="mt-1 text-xs text-white/35">
                                                        {food.cityName}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="shrink-0 text-sm text-white/55">
                                                {food.totalPrice > 0
                                                    ? formatPrice(food.totalPrice)
                                                    : getPrice(food) > 0
                                                        ? formatPrice(getPrice(food))
                                                        : "Price not available"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No food packages selected.
                                </p>
                            )}

                            {Object.keys(foodPreferences || {}).length > 0 && (
                                <p className="mt-5 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.2em] text-white/30">
                                    Food preferences saved
                                </p>
                            )}
                        </ReviewSection>

                        <ReviewSection number={6} title="Transport">
                            {transportSelections.length ? (
                                <ul className="divide-y divide-white/10">
                                    {transportSelections.map((transport, index) => {
                                        const amount = Number(
                                            transport.amount ??
                                            transport.estimatedFare ??
                                            transport.price ??
                                            0
                                        );

                                        const count = Number(
                                            transport.travelers ?? travelers ?? 1
                                        );

                                        const totalAmount =
                                            transport.amount != null
                                                ? amount
                                                : amount * Math.max(1, count);

                                        return (
                                            <li
                                                key={getId(transport) || index}
                                                className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                                            >
                                                <div>
                                                    <p className="text-sm text-white/80">
                                                        {transport.rideName ||
                                                            transport.name ||
                                                            transport.provider ||
                                                            transport.type ||
                                                            transport.rideType ||
                                                            "Transport"}
                                                    </p>

                                                    <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
                                                        {transport.rideType ||
                                                            transport.type ||
                                                            "Transport"}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-sm text-white/55">
                                                    {Number.isFinite(totalAmount)
                                                        ? formatPrice(totalAmount)
                                                        : "Price not available"}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : backendRideAmount > 0 ? (
                                <div className="flex items-center justify-between gap-5">
                                    <p className="text-sm text-white/70">
                                        Saved transport selections
                                    </p>

                                    <p className="text-sm text-white/55">
                                        {formatPrice(backendRideAmount)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-white/30">
                                    No transport selected.
                                </p>
                            )}
                        </ReviewSection>
                    </div>
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="border border-white/10 bg-white/[0.02]">
                        <div className="border-b border-white/10 p-6">
                            <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                                Booking summary
                            </p>

                            <div className="mt-6">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                    Total
                                </p>

                                <p className="mt-2 font-serif text-5xl tracking-[-0.06em] text-white sm:text-6xl">
                                    {summaryLoading
                                        ? "..."
                                        : formatPrice(displayedTotal)}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Travelers
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {travelers || 1}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Cities
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {toArray(selectedCities).length ||
                                            tripCities.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Places
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {places.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Hotels
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {hotels.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Rooms
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {rooms.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Food
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {foodPackages.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-white/40">
                                        Transport
                                    </span>
                                    <span className="text-sm text-white/75">
                                        {transportSelections.length ||
                                            (backendRideAmount > 0 ? "Saved" : "—")}
                                    </span>
                                </div>
                            </div>

                            <div className="my-7 h-px bg-white/10" />

                            <div>
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                    Dates
                                </p>

                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-white/35">
                                            From
                                        </span>
                                        <span className="text-right text-white/65">
                                            {formatDate(startDate)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-white/35">
                                            To
                                        </span>
                                        <span className="text-right text-white/65">
                                            {formatDate(endDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 border border-white/10 p-4">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                    Payment
                                </p>

                                <p className="mt-2 text-xs leading-5 text-white/40">
                                    Secure payment powered by Razorpay.
                                </p>
                            </div>

                            {summaryError && (
                                <p className="mt-5 border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs leading-5 text-amber-200/70">
                                    {summaryError}
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {paymentError && (
                <div
                    role="alert"
                    className="mt-8 border border-red-400/20 bg-red-400/[0.04] px-5 py-4 text-sm text-red-200/80"
                >
                    {paymentError}
                </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={paymentLoading}
                    className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span className="text-base">←</span>
                    Back to transport
                </button>

                <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentLoading || !tripId || summaryLoading}
                    className="group inline-flex items-center justify-center gap-5 bg-white px-8 py-4 text-[10px] uppercase tracking-[0.25em] text-[#111311] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {paymentLoading ? "Processing..." : "Confirm and pay"}

                    <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                        →
                    </span>
                </button>
            </div>
        </section>
    );
};

export default ReviewStep;