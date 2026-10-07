import { useEffect, useState } from "react";
import { useTripBuilder } from "../../context/TripBuilderContext";
import { getPlacesByCity } from "../../api/placeApi";

const PLACEHOLDER_IMAGE =
    "https://placehold.co/1200x800/e5e7eb/6b7280?text=Place+Image";

const getId = (item) => {
    if (typeof item === "string") return item;

    return item?._id || item?.id || item?.placeId || null;
};

const getName = (item) => {
    return item?.name || "Unknown";
};

const getPlaceImage = (place) => {
    return (
        place?.image ||
        place?.coverImage ||
        place?.photo ||
        PLACEHOLDER_IMAGE
    );
};

const getCityId = (place) => {
    if (!place) return null;

    if (typeof place.city === "string") {
        return place.city;
    }

    return (
        place.cityId ||
        place.city?._id ||
        place.city?.id ||
        null
    );
};

const PlaceStep = () => {
    const {
        selectedCities,
        selectedPlaces,
        togglePlace,
        nextStep,
        previousStep,
        tripLoading,
        createTripAndItinerary,
        error: contextError
    } = useTripBuilder();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchPlaces = async () => {
            if (!selectedCities || selectedCities.length === 0) {
                setPlaces([]);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const responses = await Promise.all(
                    selectedCities.map(async (city) => {
                        const cityId = getId(city);

                        console.log("Fetching places for city:", cityId);

                        if (!cityId) {
                            console.error("City ID is missing:", city);

                            return {
                                city,
                                places: []
                            };
                        }

                        const response = await getPlacesByCity(cityId);

                        const cityPlaces = Array.isArray(response)
                            ? response
                            : response?.places ||
                              response?.data?.places ||
                              response?.data ||
                              [];

                        console.log("City ID:", cityId);
                        console.log("Places Response:", response);
                        console.log("Places Received:", cityPlaces);

                        return {
                            city,
                            places: Array.isArray(cityPlaces)
                                ? cityPlaces
                                : []
                        };
                    })
                );

                const formattedPlaces = responses.flatMap((item) => {
                    return item.places.map((place) => {
                        const placeCityId =
                            getCityId(place) || getId(item.city);

                        return {
                            ...place,
                            city: place.city || item.city,
                            cityId: String(placeCityId)
                        };
                    });
                });

                console.log("All Formatted Places:", formattedPlaces);

                if (isMounted) {
                    setPlaces(formattedPlaces);
                }
            } catch (error) {
                console.error("Places API error:", error);

                if (isMounted) {
                    setError(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Failed to load places."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPlaces();

        return () => {
            isMounted = false;
        };
    }, [selectedCities]);

    useEffect(() => {
        console.log("Selected Places Updated:", selectedPlaces);
        console.log(
            "Selected Places Count:",
            selectedPlaces?.length || 0
        );
    }, [selectedPlaces]);

    const isPlaceSelected = (place) => {
        const placeId = getId(place);

        if (!placeId) return false;

        return selectedPlaces?.some((selectedPlace) => {
            return String(getId(selectedPlace)) === String(placeId);
        });
    };

    const groupedPlaces = selectedCities.map((city) => {
        const cityId = String(getId(city));

        const cityPlaces = places.filter((place) => {
            return String(getCityId(place)) === cityId;
        });

        return {
            city,
            places: cityPlaces
        };
    });

    const handlePlaceToggle = (place, cityId) => {
        const placeId = getId(place);

        console.log("Clicked Place:", place);
        console.log("Place ID:", placeId);
        console.log("City ID:", cityId);

        if (!placeId) {
            console.error("Cannot select place. Place ID is missing.");
            setError("Cannot select this place because its ID is missing.");
            return;
        }

        if (!cityId) {
            console.error("Cannot select place. City ID is missing.");
            setError(
                "Cannot select this place because its city ID is missing."
            );
            return;
        }

        togglePlace(place, String(cityId));
        setError("");
    };

    const handleContinue = async () => {
        console.log("Selected Places:", selectedPlaces);
        console.log(
            "Selected Places Length:",
            selectedPlaces?.length || 0
        );

        if (!selectedPlaces || selectedPlaces.length === 0) {
            setError("Please select at least one place.");
            return;
        }

        setError("");

        try {
            const created = await createTripAndItinerary();

            console.log("Trip Creation Result:", created);

            if (!created) {
                console.error("Trip creation returned false.");
                return;
            }

            console.log(
                "Trip created successfully. Moving to HotelStep."
            );

            nextStep();
        } catch (error) {
            console.error("Trip creation error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to create trip."
            );
        }
    };

    const visibleError = error || contextError;

    return (
        <section className="pt-10">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
                        Step 05 / Experiences
                    </p>

                    <h1 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                        Places worth seeing.
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
                        Choose the places you want to experience during your
                        journey.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-white/15" />

                    <span className="font-mono text-xs text-white/50">
                        {String(selectedPlaces?.length || 0).padStart(2, "0")}
                    </span>

                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                        Selected
                    </span>
                </div>
            </div>

            {visibleError && (
                <div className="mt-8 border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
                    {visibleError}
                </div>
            )}

            {loading && (
                <div className="mt-10 flex min-h-52 items-center justify-center border border-white/10 bg-white/[0.02]">
                    <div className="text-center">
                        <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border border-white/10 border-t-white" />

                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                            Loading places
                        </p>
                    </div>
                </div>
            )}

            {!loading && selectedCities.length === 0 && (
                <div className="mt-10 border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                        Destination required
                    </p>

                    <h3 className="mt-4 font-serif text-3xl tracking-[-0.04em]">
                        Please select cities first.
                    </h3>

                    <button
                        type="button"
                        onClick={previousStep}
                        className="mt-7 border border-white/15 px-6 py-3 text-[9px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
                    >
                        ← Choose cities
                    </button>
                </div>
            )}

            {!loading && selectedCities.length > 0 && (
                <div className="mt-10 space-y-14">
                    {groupedPlaces.map((group) => (
                        <div key={getId(group.city)}>
                            <div className="mb-5 flex items-end justify-between gap-5 border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                                        City
                                    </p>

                                    <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-white/90 sm:text-4xl">
                                        {getName(group.city)}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-white/30">
                                        {String(group.places.length).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                                        Places
                                    </span>
                                </div>
                            </div>

                            {group.places.length === 0 ? (
                                <div className="border border-white/10 bg-white/[0.02] p-8 text-center">
                                    <p className="text-sm text-white/30">
                                        No places available for this city.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                                    {group.places.map((place, index) => {
                                        const selected =
                                            isPlaceSelected(place);

                                        return (
                                            <button
                                                key={getId(place)}
                                                type="button"
                                                onClick={() =>
                                                    handlePlaceToggle(
                                                        place,
                                                        getId(group.city)
                                                    )
                                                }
                                                className={`group relative overflow-hidden text-left transition-all duration-500 ${
                                                    selected
                                                        ? "ring-1 ring-white ring-offset-4 ring-offset-[#111311]"
                                                        : ""
                                                }`}
                                            >
                                                <div className="relative h-64 overflow-hidden">
                                                    <img
                                                        src={getPlaceImage(place)}
                                                        alt={getName(place)}
                                                        className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                                                        onError={(event) => {
                                                            event.currentTarget.src =
                                                                PLACEHOLDER_IMAGE;
                                                        }}
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/5" />

                                                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                                                        <span className="border border-white/20 bg-black/20 px-3 py-2 text-[8px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
                                                            Place
                                                        </span>

                                                        <span className="font-mono text-[9px] text-white/40">
                                                            {String(
                                                                index + 1
                                                            ).padStart(2, "0")}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={`absolute right-5 top-16 flex h-9 w-9 items-center justify-center border transition-all duration-300 ${
                                                            selected
                                                                ? "border-white bg-white text-black"
                                                                : "border-white/30 bg-black/20 text-white/70"
                                                        }`}
                                                    >
                                                        {selected ? "✓" : "+"}
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                                        <h3 className="font-serif text-2xl tracking-[-0.03em] text-white">
                                                            {getName(place)}
                                                        </h3>

                                                        <div className="mt-3 flex items-center gap-3">
                                                            <span
                                                                className={`h-px transition-all duration-500 ${
                                                                    selected
                                                                        ? "w-10 bg-white"
                                                                        : "w-5 bg-white/40 group-hover:w-10"
                                                                }`}
                                                            />

                                                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/55">
                                                                {selected
                                                                    ? "Selected"
                                                                    : "Select place"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {selected && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                                    )}
                                                </div>

                                                <div className="bg-[#111311] p-5">
                                                    <p className="line-clamp-3 text-sm leading-6 text-white/35">
                                                        {place?.description ||
                                                            "Explore this beautiful destination and enjoy your trip."}
                                                    </p>

                                                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                                                        <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                                                            {getName(
                                                                group.city
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`text-[8px] uppercase tracking-[0.25em] ${
                                                                selected
                                                                    ? "text-white/70"
                                                                    : "text-white/30"
                                                            }`}
                                                        >
                                                            {selected
                                                                ? "Added"
                                                                : "Add"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={tripLoading}
                    className="flex items-center justify-center gap-3 border border-white/10 px-7 py-4 text-[9px] uppercase tracking-[0.3em] text-white/45 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span>←</span>
                    Back
                </button>

                <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                        {selectedPlaces?.length || 0}{" "}
                        {selectedPlaces?.length === 1
                            ? "place"
                            : "places"}{" "}
                        selected
                    </p>

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={tripLoading || loading}
                        className="group flex items-center gap-5 bg-white px-7 py-4 text-[9px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {tripLoading
                            ? "Creating trip..."
                            : "Continue to hotels"}

                        {!tripLoading && (
                            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PlaceStep;