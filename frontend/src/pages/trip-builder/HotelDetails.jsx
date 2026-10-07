import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const getId = (item) => item?._id || item?.id;

const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image === "string") {
        return image;
    }

    return (
        image.url ||
        image.secure_url ||
        image.src ||
        ""
    );
};

const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
};

const getHotelImage = (hotel) => {
    const images = [
        ...(Array.isArray(hotel?.images) ? hotel.images : []),
        hotel?.image,
        hotel?.coverImage
    ]
        .map(getImageUrl)
        .filter(Boolean);

    return images;
};

const getRoomImages = (room) => {
    return [
        ...(Array.isArray(room?.images) ? room.images : []),
        room?.image,
        room?.coverImage
    ]
        .map(getImageUrl)
        .filter(Boolean);
};

const getAmenityName = (amenity) => {
    if (typeof amenity === "string") {
        return amenity;
    }

    return (
        amenity?.name ||
        amenity?.title ||
        "Amenity"
    );
};

export default function HotelDetails() {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(true);

    const [error, setError] = useState("");
    const [roomsError, setRoomsError] = useState("");

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2");

    useEffect(() => {
        let mounted = true;

        const fetchHotel = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/hotels/${hotelId}`
                );

                if (!mounted) return;

                const hotelData =
                    response.data?.hotel ||
                    response.data?.data ||
                    response.data;

                setHotel(hotelData);
            } catch (error) {
                if (!mounted) return;

                setError(
                    error.response?.data?.message ||
                    "Unable to load hotel details."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const fetchRooms = async () => {
            try {
                setRoomsLoading(true);
                setRoomsError("");

                const response = await api.get(
                    `/rooms/hotel/${hotelId}`
                );

                if (!mounted) return;

                const roomData =
                    response.data?.rooms ||
                    response.data?.data ||
                    (Array.isArray(response.data)
                        ? response.data
                        : []);

                setRooms(roomData);
            } catch (error) {
                if (!mounted) return;

                setRoomsError(
                    error.response?.data?.message ||
                    "Unable to load available rooms."
                );
            } finally {
                if (mounted) {
                    setRoomsLoading(false);
                }
            }
        };

        if (!hotelId) {
            setError("Hotel ID is missing.");
            setLoading(false);
            setRoomsLoading(false);
            return;
        }

        fetchHotel();
        fetchRooms();

        return () => {
            mounted = false;
        };
    }, [hotelId]);

    const hotelImages = useMemo(() => {
        return getHotelImage(hotel);
    }, [hotel]);

    const hotelName =
        hotel?.name ||
        hotel?.hotelName ||
        "Hotel";

    const cityName =
        typeof hotel?.city === "object"
            ? hotel.city?.name
            : hotel?.cityName || "";

    const hotelAddress =
        hotel?.address ||
        hotel?.location?.address ||
        cityName ||
        "Address not available";

    const description =
        hotel?.description ||
        "Experience a comfortable stay with everything you need for your journey.";

    const amenities = Array.isArray(hotel?.amenities)
        ? hotel.amenities
        : typeof hotel?.amenities === "string"
            ? hotel.amenities
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [];

    const rating =
        hotel?.rating ??
        hotel?.averageRating ??
        null;

    const today = new Date()
        .toISOString()
        .split("T")[0];

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

    const availableRooms = rooms.filter(
        (room) => room.isAvailable !== false
    );

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);

        setTimeout(() => {
            const bookingSection =
                document.getElementById(
                    "booking-summary"
                );

            if (bookingSection) {
                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }, 50);
    };

    const handleBookNow = () => {
        if (!selectedRoom) {
            return;
        }

        navigate("/hotel-booking", {
            state: {
                hotel,
                room: selectedRoom,
                checkIn,
                checkOut,
                guests
            }
        });
    };

    const handleBack = () => {
        navigate("/hotels");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111311] px-5 py-10 text-[#f4f1e8]">
                <div className="mx-auto max-w-7xl">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-white/5" />

                    <div className="mt-8 grid gap-2 lg:grid-cols-2">
                        <div className="h-[420px] animate-pulse rounded-3xl bg-[#171917]" />

                        <div className="grid grid-cols-2 gap-2">
                            <div className="animate-pulse rounded-3xl bg-[#171917]" />
                            <div className="animate-pulse rounded-3xl bg-[#171917]" />
                            <div className="animate-pulse rounded-3xl bg-[#171917]" />
                            <div className="animate-pulse rounded-3xl bg-[#171917]" />
                        </div>
                    </div>

                    <div className="mt-8 h-10 w-1/3 animate-pulse rounded bg-white/5" />
                    <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#111311] px-5 text-center text-[#f4f1e8]">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                    Wander / Hotels
                </p>

                <h1 className="mt-5 font-serif text-4xl">
                    Hotel unavailable
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                    {error || "The hotel you're looking for could not be found."}
                </p>

                <button
                    type="button"
                    onClick={handleBack}
                    className="mt-7 rounded-full bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white"
                >
                    Back to Hotels
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#111311] pb-20 text-[#f4f1e8]">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
                <button
                    type="button"
                    onClick={handleBack}
                    className="mb-7 text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                >
                    ← Back to Hotels
                </button>

                <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                    <div className="grid gap-1 lg:grid-cols-2">
                        <div className="relative h-[360px] overflow-hidden lg:h-[540px]">
                            {hotelImages[0] ? (
                                <img
                                    src={hotelImages[0]}
                                    alt={hotelName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-[#111311] text-sm text-white/25">
                                    No hotel image available
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/70 via-transparent to-transparent" />

                            <div className="absolute bottom-6 left-6">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/60">
                                    {cityName || "India"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                            {[1, 2, 3, 4].map((index) => (
                                <div
                                    key={index}
                                    className="relative min-h-[180px] overflow-hidden bg-[#111311] lg:min-h-0"
                                >
                                    {hotelImages[index] ? (
                                        <img
                                            src={hotelImages[index]}
                                            alt={`${hotelName} view ${index}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.15em] text-white/15">
                                            Wander
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col justify-between gap-6 lg:flex-row">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                        Hotel
                                    </p>

                                    {rating !== null && (
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                                            ★ {rating}
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                                    {hotelName}
                                </h1>

                                <p className="mt-4 text-sm text-white/40">
                                    {hotelAddress}
                                </p>
                            </div>

                            {hotel.pricePerNight && (
                                <div className="shrink-0 lg:text-right">
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                        Starting from
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {formatPrice(
                                            hotel.pricePerNight
                                        )}
                                    </p>

                                    <p className="text-xs text-white/30">
                                        per night
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 border-t border-white/10 pt-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                About the property
                            </p>

                            <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-white/50">
                                {description}
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#111311] p-5">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                    Check-in
                                </p>

                                <p className="mt-2 text-lg">
                                    {hotel.checkInTime ||
                                        hotel.checkIn ||
                                        "12:00"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#111311] p-5">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                    Check-out
                                </p>

                                <p className="mt-2 text-lg">
                                    {hotel.checkOutTime ||
                                        hotel.checkOut ||
                                        "11:00"}
                                </p>
                            </div>
                        </div>

                        {amenities.length > 0 && (
                            <div className="mt-10 border-t border-white/10 pt-8">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                    Hotel amenities
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {amenities.map(
                                        (amenity, index) => (
                                            <span
                                                key={`${getAmenityName(
                                                    amenity
                                                )}-${index}`}
                                                className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/45"
                                            >
                                                {getAmenityName(
                                                    amenity
                                                )}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-16">
                    <div className="mb-8 border-b border-white/10 pb-7">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                            Choose your stay
                        </p>

                        <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                            Available rooms
                        </h2>

                        <p className="mt-3 text-sm text-white/40">
                            Select a room that fits your journey.
                        </p>
                    </div>

                    {roomsLoading ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]"
                                >
                                    <div className="h-56 animate-pulse bg-white/5" />

                                    <div className="space-y-4 p-6">
                                        <div className="h-6 w-1/2 animate-pulse rounded bg-white/5" />
                                        <div className="h-4 w-1/3 animate-pulse rounded bg-white/5" />
                                        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : roomsError ? (
                        <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8">
                            <p className="text-sm text-red-300">
                                {roomsError}
                            </p>
                        </div>
                    ) : availableRooms.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-[#171917] px-6 py-20 text-center">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                No rooms available
                            </p>

                            <h3 className="mt-4 font-serif text-3xl">
                                This property is currently full.
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                                There are no available rooms at this
                                property right now.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {availableRooms.map((room) => {
                                const roomId = getId(room);
                                const roomName =
                                    getRoomName(room);
                                const roomImages =
                                    getRoomImages(room);
                                const roomPrice =
                                    getRoomPrice(room);

                                const roomAmenities =
                                    Array.isArray(
                                        room.amenities
                                    )
                                        ? room.amenities
                                        : [];

                                const isSelected =
                                    getId(
                                        selectedRoom
                                    ) === roomId;

                                return (
                                    <article
                                        key={roomId}
                                        className={`overflow-hidden rounded-3xl border bg-[#171917] transition ${isSelected
                                            ? "border-white/50"
                                            : "border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="grid sm:grid-cols-[220px_1fr]">
                                            <div className="relative h-56 bg-[#111311] sm:h-full">
                                                {roomImages[0] ? (
                                                    <img
                                                        src={
                                                            roomImages[0]
                                                        }
                                                        alt={
                                                            roomName
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-56 items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/20">
                                                        Room
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col p-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                                                                Room
                                                            </p>

                                                            <h3 className="mt-2 font-serif text-2xl capitalize">
                                                                {
                                                                    roomName
                                                                }
                                                            </h3>
                                                        </div>

                                                        {room.roomNumber && (
                                                            <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-white/30">
                                                                Room{" "}
                                                                {
                                                                    room.roomNumber
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/40">
                                                        <span>
                                                            Up to{" "}
                                                            {room.maxGuests ||
                                                                2}{" "}
                                                            guests
                                                        </span>

                                                        {room.beds && (
                                                            <span>
                                                                {
                                                                    room.beds
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {roomAmenities.length >
                                                        0 && (
                                                            <div className="mt-5 flex flex-wrap gap-2">
                                                                {roomAmenities
                                                                    .slice(
                                                                        0,
                                                                        4
                                                                    )
                                                                    .map(
                                                                        (
                                                                            amenity,
                                                                            index
                                                                        ) => (
                                                                            <span
                                                                                key={`${getAmenityName(
                                                                                    amenity
                                                                                )}-${index}`}
                                                                                className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] text-white/35"
                                                                            >
                                                                                {getAmenityName(
                                                                                    amenity
                                                                                )}
                                                                            </span>
                                                                        )
                                                                    )}
                                                            </div>
                                                        )}
                                                </div>

                                                <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                                            Per night
                                                        </p>

                                                        <p className="mt-1 text-xl font-semibold">
                                                            {formatPrice(
                                                                roomPrice
                                                            )}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectRoom(
                                                                room
                                                            )
                                                        }
                                                        className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${isSelected
                                                            ? "bg-white text-[#111311]"
                                                            : "bg-[#f4f1e8] text-[#111311] hover:bg-white"
                                                            }`}
                                                    >
                                                        {isSelected
                                                            ? "Selected"
                                                            : "Select Room"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {selectedRoom && (
                    <section
                        id="booking-summary"
                        className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#f4f1e8] text-[#111311]"
                    >
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-black/35">
                                        Your selection
                                    </p>

                                    <h2 className="mt-2 font-serif text-3xl">
                                        {getRoomName(
                                            selectedRoom
                                        )}
                                    </h2>

                                    <p className="mt-2 text-sm text-black/50">
                                        {hotelName}
                                        {cityName
                                            ? ` · ${cityName}`
                                            : ""}
                                    </p>
                                </div>

                                <div className="text-left lg:text-right">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-black/35">
                                        Room price
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {formatPrice(
                                            getRoomPrice(
                                                selectedRoom
                                            )
                                        )}
                                    </p>

                                    <p className="text-xs text-black/40">
                                        per night
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl bg-black/5 p-4">
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-black/35">
                                        Check-in
                                    </label>

                                    <input
                                        type="date"
                                        value={checkIn}
                                        min={today}
                                        onChange={(event) =>
                                            setCheckIn(
                                                event.target.value
                                            )
                                        }
                                        className="w-full bg-transparent text-sm outline-none [color-scheme:light]"
                                    />
                                </div>

                                <div className="rounded-2xl bg-black/5 p-4">
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-black/35">
                                        Check-out
                                    </label>

                                    <input
                                        type="date"
                                        value={checkOut}
                                        min={
                                            checkIn ||
                                            today
                                        }
                                        onChange={(event) =>
                                            setCheckOut(
                                                event.target.value
                                            )
                                        }
                                        className="w-full bg-transparent text-sm outline-none [color-scheme:light]"
                                    />
                                </div>

                                <div className="rounded-2xl bg-black/5 p-4">
                                    <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-black/35">
                                        Guests
                                    </label>

                                    <select
                                        value={guests}
                                        onChange={(event) =>
                                            setGuests(
                                                event.target.value
                                            )
                                        }
                                        className="w-full bg-transparent text-sm outline-none"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                            (count) => (
                                                <option
                                                    key={count}
                                                    value={count}
                                                >
                                                    {count}{" "}
                                                    {count === 1
                                                        ? "Guest"
                                                        : "Guests"}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center">
                                <p className="max-w-xl text-xs leading-5 text-black/45">
                                    Select your dates and guests before
                                    continuing to the booking page.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleBookNow}
                                    className="rounded-full bg-[#111311] px-7 py-3.5 text-sm font-semibold text-[#f4f1e8] transition hover:bg-black"
                                >
                                    Continue to Booking →
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}