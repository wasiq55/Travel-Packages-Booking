import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTripBuilder } from "../../context/TripBuilderContext";
import {
    getHotelsByCity,
    getHotelRooms,
    selectTripHotel
} from "../../api/hotelApi";
import { getHotelFoodPackages } from "../../api/foodApi";

const getId = (item) => {
    if (typeof item === "string") return item;
    return item?._id || item?.id || null;
};

const getHotelImage = (hotel) => {
    const image = hotel?.images?.[0] || hotel?.image;

    if (typeof image === "string") return image;

    if (image?.url) return image.url;

    return "https://placehold.co/1200x800/e5e7eb/6b7280?text=Hotel";
};

const getRoomImage = (room) => {
    const image = room?.images?.[0];

    if (typeof image === "string") return image;

    if (image?.url) return image.url;

    return "https://placehold.co/800x500/e5e7eb/6b7280?text=Room";
};

const getFoodImage = (food) => {
    const image = food?.image;

    if (typeof image === "string") return image;

    if (image?.url) return image.url;

    return "https://placehold.co/800x500/e5e7eb/6b7280?text=Food";
};

const readSession = (key, fallback) => {
    try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const useSessionValue = (key, fallback) => {
    const [value, setValue] = useState(() => readSession(key, fallback));

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Unable to save ${key}:`, error);
        }
    }, [key, value]);

    return [value, setValue];
};

const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = end - start;

    return Math.max(
        1,
        Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
};

const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const HotelStep = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        tripId,
        tripCities,
        startDate,
        endDate,
        travelers,
        nextStep,
        previousStep,
        selectedFoodPackages,
        foodPreferences,
        setSelectedFoodPackages,
        setFoodPreferences
    } = useTripBuilder();

    const [hotelData, setHotelData] = useState({});
    const [foodData, setFoodData] = useState({});

    const [selectedHotels, setSelectedHotels] = useSessionValue(
        "hotelStep_selectedHotels",
        {}
    );

    const [selectedRooms, setSelectedRooms] = useSessionValue(
        "hotelStep_selectedRooms",
        {}
    );

    const [loading, setLoading] = useState(true);
    const [foodLoading, setFoodLoading] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const nights = calculateNights(startDate, endDate);
    const totalTravelers = Number(travelers) || 1;

    const getCityId = useCallback((tripCity) => {
        if (typeof tripCity?.city === "string") {
            return tripCity.city;
        }

        return (
            getId(tripCity?.city) ||
            getId(tripCity?.selectedCity) ||
            tripCity?.cityId ||
            null
        );
    }, []);

    const getTripCityId = (tripCity) => {
        return getId(tripCity) || tripCity?.tripCityId || null;
    };

    const getCityName = (tripCity) => {
        return (
            tripCity?.city?.name ||
            tripCity?.selectedCity?.name ||
            tripCity?.cityName ||
            "Selected City"
        );
    };

    const getHotelName = (hotel) => {
        return (
            hotel?.name ||
            hotel?.hotelName ||
            hotel?.title ||
            "Selected Hotel"
        );
    };

    const getRoomName = (room) => {
        return (
            room?.name ||
            room?.roomName ||
            room?.type ||
            room?.roomType ||
            "Selected Room"
        );
    };

    const getFoodName = (food) => {
        return (
            food?.name ||
            food?.title ||
            food?.packageName ||
            "Food Package"
        );
    };

    useEffect(() => {
        let cancelled = false;

        const loadHotels = async () => {
            if (!tripCities?.length) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const results = {};

                await Promise.all(
                    tripCities.map(async (tripCity) => {
                        const cityId = getCityId(tripCity);

                        if (!cityId) return;

                        try {
                            const response = await getHotelsByCity(cityId);

                            results[cityId] =
                                response?.hotels ||
                                response?.data ||
                                response ||
                                [];
                        } catch (cityError) {
                            console.error(
                                `Unable to load hotels for ${cityId}:`,
                                cityError
                            );

                            results[cityId] = [];
                        }
                    })
                );

                if (!cancelled) {
                    setHotelData((previous) => ({
                        ...previous,
                        ...results
                    }));
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(
                        loadError?.response?.data?.message ||
                            loadError?.message ||
                            "Unable to load hotels."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadHotels();

        return () => {
            cancelled = true;
        };
    }, [tripCities, getCityId]);

    const handleHotelSelect = useCallback(
        async (tripCity, hotel) => {
            const cityId = getCityId(tripCity);
            const hotelId = getId(hotel);

            if (!cityId || !hotelId) {
                setError("Unable to select this hotel.");
                return;
            }

            setError("");

            setSelectedHotels((previous) => ({
                ...previous,
                [cityId]: hotel
            }));

            setSelectedRooms((previous) => {
                const updated = { ...previous };
                delete updated[cityId];
                return updated;
            });

            setSelectedFoodPackages((previous) => {
                const updated = { ...previous };
                delete updated[cityId];
                return updated;
            });

            setFoodPreferences((previous) => ({
                ...previous,
                [cityId]: "no-food"
            }));

            try {
                const roomsResponse = await getHotelRooms(hotelId);

                const rooms =
                    roomsResponse?.rooms ||
                    roomsResponse?.data ||
                    roomsResponse ||
                    [];

                setHotelData((previous) => ({
                    ...previous,
                    [`rooms-${hotelId}`]: rooms
                }));
            } catch (roomError) {
                console.error("Unable to load hotel rooms:", roomError);

                setHotelData((previous) => ({
                    ...previous,
                    [`rooms-${hotelId}`]: []
                }));
            }

            setFoodLoading((previous) => ({
                ...previous,
                [hotelId]: true
            }));

            try {
                const foodResponse = await getHotelFoodPackages(hotelId);

                const foodPackages =
                    foodResponse?.foodPackages ||
                    foodResponse?.packages ||
                    foodResponse?.data ||
                    foodResponse ||
                    [];

                setFoodData((previous) => ({
                    ...previous,
                    [hotelId]: foodPackages
                }));
            } catch (foodError) {
                console.error(
                    "Unable to load hotel food packages:",
                    foodError
                );

                setFoodData((previous) => ({
                    ...previous,
                    [hotelId]: []
                }));
            } finally {
                setFoodLoading((previous) => ({
                    ...previous,
                    [hotelId]: false
                }));
            }
        },
        [
            getCityId,
            setSelectedHotels,
            setSelectedRooms,
            setSelectedFoodPackages,
            setFoodPreferences
        ]
    );

    const handleViewHotelDetails = (tripCity, hotel) => {
        const hotelId = getId(hotel);

        if (!hotelId) {
            setError("Unable to open hotel details.");
            return;
        }

        navigate(`/hotel/${hotelId}`, {
            state: {
                tripCity,
                hotel,
                selectionSnapshot: {
                    selectedHotels,
                    selectedRooms,
                    selectedFoodPackages,
                    foodPreferences
                }
            }
        });
    };

    useEffect(() => {
        const hotelSelection = location.state?.hotelSelection;

        if (!hotelSelection) return;

        const tripCity = hotelSelection.tripCity;
        const hotel = hotelSelection.hotel;

        if (!tripCity || !hotel) return;

        const restoreSelection = async () => {
            try {
                await handleHotelSelect(tripCity, hotel);

                const cityId = getCityId(tripCity);
                const room = hotelSelection.room;

                if (cityId && room) {
                    setSelectedRooms((previous) => ({
                        ...previous,
                        [cityId]: room
                    }));
                }

                if (hotelSelection.foodPreference) {
                    setFoodPreferences((previous) => ({
                        ...previous,
                        [cityId]: hotelSelection.foodPreference
                    }));
                }

                if (hotelSelection.foodPackage) {
                    setSelectedFoodPackages((previous) => ({
                        ...previous,
                        [cityId]: hotelSelection.foodPackage
                    }));
                }

                navigate(location.pathname, {
                    replace: true,
                    state: {}
                });
            } catch (restoreError) {
                console.error(
                    "Unable to restore hotel selection:",
                    restoreError
                );
            }
        };

        restoreSelection();
    }, [
        location.state,
        location.pathname,
        navigate,
        handleHotelSelect,
        getCityId,
        setSelectedRooms,
        setFoodPreferences,
        setSelectedFoodPackages
    ]);

    const handleRoomSelect = (tripCity, room) => {
        const cityId = getCityId(tripCity);

        if (!cityId) {
            setError("Unable to select this room.");
            return;
        }

        setSelectedRooms((previous) => ({
            ...previous,
            [cityId]: room
        }));

        setError("");
    };

    const handleFoodPreference = (tripCity, preference) => {
        const cityId = getCityId(tripCity);

        if (!cityId) return;

        setFoodPreferences((previous) => ({
            ...previous,
            [cityId]: preference
        }));

        if (preference === "no-food") {
            setSelectedFoodPackages((previous) => {
                const updated = { ...previous };
                delete updated[cityId];
                return updated;
            });
        }

        setError("");
    };

    const handleFoodSelect = (tripCity, foodPackage) => {
        const cityId = getCityId(tripCity);

        if (!cityId) return;

        setSelectedFoodPackages((previous) => ({
            ...previous,
            [cityId]: foodPackage
        }));

        setFoodPreferences((previous) => ({
            ...previous,
            [cityId]: "add-food"
        }));

        setError("");
    };

    const getRoomTotal = (tripCity) => {
        const cityId = getCityId(tripCity);
        const room = selectedRooms?.[cityId];

        if (!room) return 0;

        const price =
            Number(
                room?.pricePerNight ??
                    room?.price ??
                    room?.amount ??
                    room?.rate ??
                    0
            ) || 0;

        return price * nights;
    };

    const getFoodTotal = (tripCity) => {
        const cityId = getCityId(tripCity);

        if (foodPreferences?.[cityId] !== "add-food") {
            return 0;
        }

        const foodPackage = selectedFoodPackages?.[cityId];

        if (!foodPackage) return 0;

        const price =
            Number(
                foodPackage?.pricePerPerson ??
                    foodPackage?.price ??
                    foodPackage?.amount ??
                    0
            ) || 0;

        return price * totalTravelers * nights;
    };

    const getCityTotal = (tripCity) => {
        return getRoomTotal(tripCity) + getFoodTotal(tripCity);
    };

    const grandTotal = useMemo(() => {
        return (tripCities || []).reduce((total, tripCity) => {
            return total + getCityTotal(tripCity);
        }, 0);
    }, [
        tripCities,
        selectedRooms,
        selectedFoodPackages,
        foodPreferences,
        nights,
        totalTravelers
    ]);

    const selectedHotelCount = (tripCities || []).filter((tripCity) => {
        const cityId = getCityId(tripCity);
        return Boolean(selectedHotels?.[cityId]);
    }).length;

    const selectedRoomCount = (tripCities || []).filter((tripCity) => {
        const cityId = getCityId(tripCity);
        return Boolean(selectedRooms?.[cityId]);
    }).length;

    const selectedFoodCount = (tripCities || []).filter((tripCity) => {
        const cityId = getCityId(tripCity);

        return (
            foodPreferences?.[cityId] === "add-food" &&
            Boolean(selectedFoodPackages?.[cityId])
        );
    }).length;

    const isComplete = (tripCity) => {
        const cityId = getCityId(tripCity);

        const hotelSelected = Boolean(selectedHotels?.[cityId]);
        const roomSelected = Boolean(selectedRooms?.[cityId]);

        if (!hotelSelected || !roomSelected) {
            return false;
        }

        if (foodPreferences?.[cityId] === "add-food") {
            return Boolean(selectedFoodPackages?.[cityId]);
        }

        return true;
    };

    const handleContinue = async () => {
        setError("");

        if (!tripId) {
            setError(
                "Your trip has not been created yet. Please go back and create the trip first."
            );
            return;
        }

        if (!tripCities?.length) {
            setError("Please select at least one city.");
            return;
        }

        const incompleteCity = tripCities.find((tripCity) => {
            const cityId = getCityId(tripCity);

            const hotelSelected = Boolean(selectedHotels?.[cityId]);
            const roomSelected = Boolean(selectedRooms?.[cityId]);

            if (!hotelSelected || !roomSelected) {
                return true;
            }

            if (foodPreferences?.[cityId] === "add-food") {
                return !selectedFoodPackages?.[cityId];
            }

            return false;
        });

        if (incompleteCity) {
            setError(
                `Please complete the hotel, room and food selection for ${getCityName(
                    incompleteCity
                )}.`
            );
            return;
        }

        setSaving(true);

        try {
            for (const tripCity of tripCities) {
                const tripCityId = getTripCityId(tripCity);
                const cityId = getCityId(tripCity);

                const hotel = selectedHotels?.[cityId];
                const room = selectedRooms?.[cityId];

                const hotelId = getId(hotel);
                const roomId = getId(room);

                const foodPackage =
                    foodPreferences?.[cityId] === "add-food"
                        ? selectedFoodPackages?.[cityId]
                        : null;

                const foodPackageId = getId(foodPackage);

                if (
                    !tripCityId ||
                    !hotelId ||
                    !roomId
                ) {
                    throw new Error(
                        `Missing hotel information for ${getCityName(
                            tripCity
                        )}.`
                    );
                }

                await selectTripHotel(
                    tripId,
                    tripCityId,
                    hotelId,
                    roomId,
                    foodPackageId
                );
            }

            nextStep();
        } catch (saveError) {
            console.error("Unable to save hotel selections:", saveError);

            setError(
                saveError?.response?.data?.message ||
                    saveError?.message ||
                    "Unable to save your hotel selections. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="min-h-[500px]">
                <div className="flex min-h-[500px] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-white/20 border-t-white" />
                        <p className="mt-5 text-[9px] uppercase tracking-[0.35em] text-white/35">
                            Finding stays
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative">
            <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
                        Step 06 / Stay
                    </p>

                    <h2 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                        Choose where
                        <br />
                        <span className="text-white/35">you'll stay.</span>
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
                        Select a hotel for every city, choose your room, and
                        add a food package if you want one.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
                    <div className="bg-[#111311] px-5 py-4">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                            Hotels
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                            {selectedHotelCount}
                            <span className="text-white/20">
                                /{tripCities?.length || 0}
                            </span>
                        </p>
                    </div>

                    <div className="bg-[#111311] px-5 py-4">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                            Rooms
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                            {selectedRoomCount}
                            <span className="text-white/20">
                                /{tripCities?.length || 0}
                            </span>
                        </p>
                    </div>

                    <div className="bg-[#111311] px-5 py-4">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                            Food
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                            {selectedFoodCount}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 border border-red-400/20 bg-red-400/[0.04] px-5 py-4 text-sm text-red-200/80">
                    {error}
                </div>
            )}

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-12">
                    {tripCities?.map((tripCity, cityIndex) => {
                        const cityId = getCityId(tripCity);
                        const cityName = getCityName(tripCity);

                        const hotels = hotelData?.[cityId] || [];
                        const selectedHotel = selectedHotels?.[cityId];
                        const selectedHotelId = getId(selectedHotel);

                        const rooms =
                            selectedHotelId
                                ? hotelData?.[`rooms-${selectedHotelId}`] || []
                                : [];

                        const selectedRoom = selectedRooms?.[cityId];

                        const foodPackages =
                            selectedHotelId
                                ? foodData?.[selectedHotelId] || []
                                : [];

                        const foodPreference =
                            foodPreferences?.[cityId] || "no-food";

                        return (
                            <div
                                key={cityId || cityIndex}
                                className="border-t border-white/10 pt-8"
                            >
                                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                                            Destination {String(cityIndex + 1).padStart(2, "0")}
                                        </p>

                                        <h3 className="mt-2 font-serif text-4xl tracking-[-0.05em]">
                                            {cityName}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isComplete(tripCity)
                                                    ? "bg-white"
                                                    : "bg-white/20"
                                            }`}
                                        />

                                        <span className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                                            {isComplete(tripCity)
                                                ? "Selection complete"
                                                : "Selection required"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                                01 / Hotel
                                            </p>

                                            <h4 className="mt-2 font-serif text-2xl tracking-[-0.04em]">
                                                Select your stay
                                            </h4>
                                        </div>
                                    </div>

                                    {hotels.length === 0 ? (
                                        <div className="border border-white/10 px-6 py-8 text-center">
                                            <p className="text-sm text-white/40">
                                                No approved hotels are available
                                                in this city yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                            {hotels.map((hotel) => {
                                                const hotelId = getId(hotel);
                                                const isSelected =
                                                    selectedHotelId === hotelId;

                                                return (
                                                    <article
                                                        key={hotelId}
                                                        className={`group overflow-hidden border transition-all duration-300 ${
                                                            isSelected
                                                                ? "border-white"
                                                                : "border-white/10 hover:border-white/30"
                                                        }`}
                                                    >
                                                        <div className="relative aspect-[4/3] overflow-hidden">
                                                            <img
                                                                src={getHotelImage(
                                                                    hotel
                                                                )}
                                                                alt={getHotelName(
                                                                    hotel
                                                                )}
                                                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                                onError={(event) => {
                                                                    event.currentTarget.src =
                                                                        "https://placehold.co/1200x800/e5e7eb/6b7280?text=Hotel";
                                                                }}
                                                            />

                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                                            {isSelected && (
                                                                <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                                                                    ✓
                                                                </div>
                                                            )}

                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <p className="text-[8px] uppercase tracking-[0.25em] text-white/60">
                                                                    {hotel?.starRating
                                                                        ? `${hotel.starRating} star`
                                                                        : "Hotel"}
                                                                </p>

                                                                <h5 className="mt-1 font-serif text-2xl leading-none">
                                                                    {getHotelName(
                                                                        hotel
                                                                    )}
                                                                </h5>
                                                            </div>
                                                        </div>

                                                        <div className="p-4">
                                                            {hotel?.address && (
                                                                <p className="mb-4 line-clamp-2 text-xs leading-5 text-white/35">
                                                                    {hotel.address}
                                                                </p>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleHotelSelect(
                                                                            tripCity,
                                                                            hotel
                                                                        )
                                                                    }
                                                                    className={`flex-1 border px-4 py-3 text-[9px] uppercase tracking-[0.22em] transition ${
                                                                        isSelected
                                                                            ? "border-white bg-white text-black"
                                                                            : "border-white/15 bg-white/[0.03] text-white hover:border-white/40"
                                                                    }`}
                                                                >
                                                                    {isSelected
                                                                        ? "Selected"
                                                                        : "Select"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewHotelDetails(
                                                                            tripCity,
                                                                            hotel
                                                                        )
                                                                    }
                                                                    className="border border-white/10 px-4 py-3 text-[9px] uppercase tracking-[0.22em] text-white/60 transition hover:border-white/30 hover:text-white"
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {selectedHotel && (
                                    <div className="mt-12 border-t border-white/10 pt-8">
                                        <div className="mb-5">
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                                02 / Room
                                            </p>

                                            <h4 className="mt-2 font-serif text-2xl tracking-[-0.04em]">
                                                Choose your room
                                            </h4>
                                        </div>

                                        {rooms.length === 0 ? (
                                            <div className="border border-white/10 px-6 py-8 text-center">
                                                <p className="text-sm text-white/40">
                                                    No rooms are available for
                                                    this hotel.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {rooms.map((room, roomIndex) => {
                                                    const roomId =
                                                        getId(room) ||
                                                        `room-${roomIndex}`;

                                                    const isSelected =
                                                        getId(selectedRoom) ===
                                                        roomId;

                                                    const roomPrice =
                                                        Number(
                                                            room?.pricePerNight ??
                                                                room?.price ??
                                                                room?.amount ??
                                                                room?.rate ??
                                                                0
                                                        ) || 0;

                                                    return (
                                                        <article
                                                            key={roomId}
                                                            className={`overflow-hidden border transition ${
                                                                isSelected
                                                                    ? "border-white"
                                                                    : "border-white/10 hover:border-white/25"
                                                            }`}
                                                        >
                                                            <div className="grid sm:grid-cols-[160px_1fr]">
                                                                <div className="aspect-[4/3] overflow-hidden sm:aspect-auto">
                                                                    <img
                                                                        src={getRoomImage(
                                                                            room
                                                                        )}
                                                                        alt={getRoomName(
                                                                            room
                                                                        )}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(event) => {
                                                                            event.currentTarget.src =
                                                                                "https://placehold.co/800x500/e5e7eb/6b7280?text=Room";
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="flex flex-col justify-between p-5">
                                                                    <div>
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div>
                                                                                <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                                                                    Room
                                                                                </p>

                                                                                <h5 className="mt-2 font-serif text-2xl leading-none">
                                                                                    {getRoomName(
                                                                                        room
                                                                                    )}
                                                                                </h5>
                                                                            </div>

                                                                            {isSelected && (
                                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs text-black">
                                                                                    ✓
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {room?.description && (
                                                                            <p className="mt-4 line-clamp-2 text-xs leading-5 text-white/35">
                                                                                {
                                                                                    room.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-6 flex items-end justify-between gap-4">
                                                                        <div>
                                                                            <p className="font-serif text-xl">
                                                                                {formatPrice(
                                                                                    roomPrice
                                                                                )}
                                                                            </p>

                                                                            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-white/25">
                                                                                per night
                                                                            </p>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleRoomSelect(
                                                                                    tripCity,
                                                                                    room
                                                                                )
                                                                            }
                                                                            className={`border px-4 py-3 text-[9px] uppercase tracking-[0.2em] transition ${
                                                                                isSelected
                                                                                    ? "border-white bg-white text-black"
                                                                                    : "border-white/15 text-white hover:border-white/40"
                                                                            }`}
                                                                        >
                                                                            {isSelected
                                                                                ? "Selected"
                                                                                : "Choose room"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedHotel && selectedRoom && (
                                    <div className="mt-12 border-t border-white/10 pt-8">
                                        <div className="mb-5">
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                                03 / Food
                                            </p>

                                            <h4 className="mt-2 font-serif text-2xl tracking-[-0.04em]">
                                                Food preference
                                            </h4>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFoodPreference(
                                                        tripCity,
                                                        "no-food"
                                                    )
                                                }
                                                className={`border p-5 text-left transition ${
                                                    foodPreference ===
                                                    "no-food"
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/10 bg-white/[0.02] text-white hover:border-white/30"
                                                }`}
                                            >
                                                <p className="text-[8px] uppercase tracking-[0.25em] opacity-50">
                                                    Room only
                                                </p>

                                                <p className="mt-2 font-serif text-xl">
                                                    No food package
                                                </p>

                                                <p className="mt-2 text-xs leading-5 opacity-50">
                                                    Continue with accommodation
                                                    only.
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFoodPreference(
                                                        tripCity,
                                                        "add-food"
                                                    )
                                                }
                                                className={`border p-5 text-left transition ${
                                                    foodPreference ===
                                                    "add-food"
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/10 bg-white/[0.02] text-white hover:border-white/30"
                                                }`}
                                            >
                                                <p className="text-[8px] uppercase tracking-[0.25em] opacity-50">
                                                    Add to stay
                                                </p>

                                                <p className="mt-2 font-serif text-xl">
                                                    Food package
                                                </p>

                                                <p className="mt-2 text-xs leading-5 opacity-50">
                                                    Add meals for your journey.
                                                </p>
                                            </button>
                                        </div>

                                        {foodPreference === "add-food" && (
                                            <div className="mt-5">
                                                {foodLoading[selectedHotelId] ? (
                                                    <div className="border border-white/10 px-6 py-8 text-center">
                                                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border border-white/20 border-t-white" />

                                                        <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-white/30">
                                                            Loading food packages
                                                        </p>
                                                    </div>
                                                ) : foodPackages.length === 0 ? (
                                                    <div className="border border-white/10 px-6 py-8 text-center">
                                                        <p className="text-sm text-white/40">
                                                            No food packages are
                                                            available for this
                                                            hotel.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {foodPackages.map(
                                                            (
                                                                foodPackage,
                                                                foodIndex
                                                            ) => {
                                                                const foodId =
                                                                    getId(
                                                                        foodPackage
                                                                    ) ||
                                                                    `food-${foodIndex}`;

                                                                const selectedFood =
                                                                    selectedFoodPackages?.[
                                                                        cityId
                                                                    ];

                                                                const isSelected =
                                                                    getId(
                                                                        selectedFood
                                                                    ) ===
                                                                    foodId;

                                                                const foodPrice =
                                                                    Number(
                                                                        foodPackage?.pricePerPerson ??
                                                                            foodPackage?.price ??
                                                                            foodPackage?.amount ??
                                                                            0
                                                                    ) || 0;

                                                                return (
                                                                    <article
                                                                        key={
                                                                            foodId
                                                                        }
                                                                        className={`overflow-hidden border transition ${
                                                                            isSelected
                                                                                ? "border-white"
                                                                                : "border-white/10 hover:border-white/25"
                                                                        }`}
                                                                    >
                                                                        <div className="grid sm:grid-cols-[130px_1fr]">
                                                                            <div className="aspect-[4/3] overflow-hidden sm:aspect-auto">
                                                                                <img
                                                                                    src={getFoodImage(
                                                                                        foodPackage
                                                                                    )}
                                                                                    alt={getFoodName(
                                                                                        foodPackage
                                                                                    )}
                                                                                    className="h-full w-full object-cover"
                                                                                    onError={(
                                                                                        event
                                                                                    ) => {
                                                                                        event.currentTarget.src =
                                                                                            "https://placehold.co/800x500/e5e7eb/6b7280?text=Food";
                                                                                    }}
                                                                                />
                                                                            </div>

                                                                            <div className="p-4">
                                                                                <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                                                                            Food
                                                                                        </p>

                                                                                        <h5 className="mt-2 font-serif text-xl">
                                                                                            {getFoodName(
                                                                                                foodPackage
                                                                                            )}
                                                                                        </h5>
                                                                                    </div>

                                                                                    {isSelected && (
                                                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs text-black">
                                                                                            ✓
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="mt-5 flex items-end justify-between gap-3">
                                                                                    <div>
                                                                                        <p className="font-serif text-lg">
                                                                                            {formatPrice(
                                                                                                foodPrice
                                                                                            )}
                                                                                        </p>

                                                                                        <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                                                                                            per person
                                                                                        </p>
                                                                                    </div>

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleFoodSelect(
                                                                                                tripCity,
                                                                                                foodPackage
                                                                                            )
                                                                                        }
                                                                                        className={`border px-3 py-2 text-[8px] uppercase tracking-[0.18em] transition ${
                                                                                            isSelected
                                                                                                ? "border-white bg-white text-black"
                                                                                                : "border-white/15 text-white hover:border-white/40"
                                                                                        }`}
                                                                                    >
                                                                                        {isSelected
                                                                                            ? "Selected"
                                                                                            : "Choose"}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </article>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="border border-white/10 bg-[#111311]">
                        <div className="border-b border-white/10 p-6">
                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                                        Your journey
                                    </p>

                                    <h3 className="mt-3 font-serif text-3xl leading-none tracking-[-0.05em]">
                                        Selected stays
                                    </h3>
                                </div>

                                <span className="font-mono text-xs text-white/30">
                                    {selectedHotelCount}/{tripCities?.length || 0}
                                </span>
                            </div>
                        </div>

                        <div className="border-b border-white/10 p-6">
                            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.22em] text-white/25">
                                        Dates
                                    </p>

                                    <p className="mt-2 text-xs text-white/65">
                                        {startDate || "—"}
                                    </p>

                                    <p className="mt-1 text-xs text-white/30">
                                        to {endDate || "—"}
                                    </p>
                                </div>

                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.22em] text-white/25">
                                        Duration
                                    </p>

                                    <p className="mt-2 font-serif text-xl">
                                        {nights}
                                    </p>

                                    <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                                        {nights === 1 ? "night" : "nights"}
                                    </p>
                                </div>

                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.22em] text-white/25">
                                        Travelers
                                    </p>

                                    <p className="mt-2 font-serif text-xl">
                                        {totalTravelers}
                                    </p>

                                    <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                                        {totalTravelers === 1
                                            ? "traveler"
                                            : "travelers"}
                                    </p>
                                </div>

                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.22em] text-white/25">
                                        Rooms
                                    </p>

                                    <p className="mt-2 font-serif text-xl">
                                        {selectedRoomCount}
                                    </p>

                                    <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                                        selected
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[55vh] overflow-y-auto">
                            <div className="divide-y divide-white/10">
                                {tripCities?.map((tripCity, cityIndex) => {
                                    const cityId = getCityId(tripCity);

                                    const hotel =
                                        selectedHotels?.[cityId];

                                    const room =
                                        selectedRooms?.[cityId];

                                    const foodPreference =
                                        foodPreferences?.[cityId] ||
                                        "no-food";

                                    const foodPackage =
                                        selectedFoodPackages?.[cityId];

                                    const complete =
                                        isComplete(tripCity);

                                    return (
                                        <div
                                            key={
                                                cityId || `summary-${cityIndex}`
                                            }
                                            className="p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                                        {String(
                                                            cityIndex + 1
                                                        ).padStart(2, "0")}
                                                    </p>

                                                    <h4 className="mt-1 font-serif text-xl tracking-[-0.03em]">
                                                        {getCityName(
                                                            tripCity
                                                        )}
                                                    </h4>
                                                </div>

                                                <span
                                                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
                                                        complete
                                                            ? "bg-white text-black"
                                                            : "border border-white/15 text-white/30"
                                                    }`}
                                                >
                                                    {complete ? "✓" : "—"}
                                                </span>
                                            </div>

                                            <div className="mt-5 space-y-4">
                                                <div>
                                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                                        Hotel
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-sm ${
                                                            hotel
                                                                ? "text-white/75"
                                                                : "text-white/25"
                                                        }`}
                                                    >
                                                        {hotel
                                                            ? getHotelName(
                                                                  hotel
                                                              )
                                                            : "Choose hotel"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                                        Room
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-sm ${
                                                            room
                                                                ? "text-white/75"
                                                                : "text-white/25"
                                                        }`}
                                                    >
                                                        {room
                                                            ? getRoomName(
                                                                  room
                                                              )
                                                            : "Choose room"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                                        Food
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-sm ${
                                                            foodPackage &&
                                                            foodPreference ===
                                                                "add-food"
                                                                ? "text-white/75"
                                                                : "text-white/40"
                                                        }`}
                                                    >
                                                        {foodPreference ===
                                                            "add-food" &&
                                                        foodPackage
                                                            ? getFoodName(
                                                                  foodPackage
                                                              )
                                                            : "Room only"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                                                <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                                    City total
                                                </p>

                                                <p className="font-serif text-xl">
                                                    {formatPrice(
                                                        getCityTotal(tripCity)
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-white/10 p-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                                        Estimated total
                                    </p>

                                    <p className="mt-2 font-serif text-4xl tracking-[-0.05em]">
                                        {formatPrice(grandTotal)}
                                    </p>
                                </div>

                                <p className="pb-1 text-[8px] uppercase tracking-[0.2em] text-white/25">
                                    INR
                                </p>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-white/30">
                                Accommodation and selected food packages for
                                the current journey.
                            </p>

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={saving}
                                className="mt-6 flex w-full items-center justify-center gap-3 bg-white px-5 py-4 text-[9px] uppercase tracking-[0.28em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-3 w-3 animate-spin rounded-full border border-black/20 border-t-black" />
                                        Saving
                                    </>
                                ) : (
                                    <>
                                        Continue to transport
                                        <span>↗</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={previousStep}
                                disabled={saving}
                                className="mt-3 w-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white disabled:opacity-30"
                            >
                                ← Back to places
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default HotelStep;