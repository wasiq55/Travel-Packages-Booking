import { useMemo, useState } from "react";
import { useTripBuilder } from "../../context/TripBuilderContext";
import { saveTripRideSelections } from "../../api/transportApi";

const getCityId = (tripCity) => {
    const city = tripCity?.city;

    if (typeof city === "string") return city;

    return city?._id || city?.id || tripCity?.cityId || null;
};

const getCityName = (tripCity) => {
    const city = tripCity?.city;

    if (typeof city === "object" && city) {
        return city.name || city.cityName || "City";
    }

    return tripCity?.cityName || "City";
};

const getCityLocation = (tripCity) => {
    const city = tripCity?.city;

    const location =
        (typeof city === "object" && city?.location) ||
        tripCity?.location ||
        null;

    if (!location) return null;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return { latitude, longitude };
};

const getRideType = (estimate) => {
    const type = String(estimate?.type || estimate?.name || "")
        .toLowerCase()
        .trim();

    if (type.includes("bike")) return "bike";
    if (type.includes("auto")) return "auto";
    if (type.includes("cab")) return "cab";

    return "";
};

const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "Price not available";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
};

const getRideIcon = (type) => {
    if (type === "bike") return "⌁";
    if (type === "auto") return "◇";
    if (type === "cab") return "□";

    return "•";
};

const TransportStep = () => {
    const {
        nextStep,
        previousStep,
        tripId,
        tripCities,
        travelers
    } = useTripBuilder();

    const [rideEstimates, setRideEstimates] = useState({});
    const [selectedRideByRoute, setSelectedRideByRoute] = useState({});
    const [rideEstimateLoading, setRideEstimateLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [rideEstimateError, setRideEstimateError] = useState("");

    const routes = useMemo(() => {
        if (!Array.isArray(tripCities)) return [];

        return tripCities
            .slice(0, -1)
            .map((fromTripCity, index) => {
                const toTripCity = tripCities[index + 1];

                const fromCityId = getCityId(fromTripCity);
                const toCityId = getCityId(toTripCity);

                return {
                    key: `${fromCityId}_${toCityId}`,
                    fromCityId,
                    toCityId,
                    fromName: getCityName(fromTripCity),
                    toName: getCityName(toTripCity),
                    fromLocation: getCityLocation(fromTripCity),
                    toLocation: getCityLocation(toTripCity)
                };
            })
            .filter((route) => route.fromCityId && route.toCityId);
    }, [tripCities]);

    const handleSelectRide = (routeKey, estimate) => {
        setSelectedRideByRoute((previous) => ({
            ...previous,
            [routeKey]: estimate
        }));

        setError("");
    };

    const handleGetRideEstimate = async () => {
        if (routes.length === 0) {
            setRideEstimateError("Select at least two cities first.");
            return;
        }

        const routesWithMissingCoordinates = routes.filter(
            (route) => !route.fromLocation || !route.toLocation
        );

        if (routesWithMissingCoordinates.length > 0) {
            const missingRouteNames = routesWithMissingCoordinates
                .map((route) => `${route.fromName} → ${route.toName}`)
                .join(", ");

            setRideEstimateError(
                `Coordinates are missing for: ${missingRouteNames}. Check that each selected city has location.latitude and location.longitude.`
            );
            return;
        }

        try {
            setRideEstimateLoading(true);
            setRideEstimateError("");
            setError("");
            setRideEstimates({});
            setSelectedRideByRoute({});

            const results = await Promise.all(
                routes.map(async (route) => {
                    const response = await fetch(
                        "http://localhost:5000/api/transport/ola/estimate",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                pickup: route.fromLocation,
                                drop: route.toLocation
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            `Unable to estimate ${route.fromName} to ${route.toName}.`
                        );
                    }

                    return {
                        routeKey: route.key,
                        estimates: data.estimates || [],
                        source: data.source || "mock",
                        isLive: data.isLive === true
                    };
                })
            );

            const estimatesByRoute = {};

            results.forEach((result) => {
                estimatesByRoute[result.routeKey] = result;
            });

            setRideEstimates(estimatesByRoute);
        } catch (err) {
            console.error("Ride estimate error:", err);

            setRideEstimateError(
                err.message || "Unable to get ride estimates."
            );
        } finally {
            setRideEstimateLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!tripId) {
            setError("Your trip ID is missing. Please create your trip again.");
            return;
        }

        if (routes.length === 0) {
            setError("Select at least two cities before choosing a ride.");
            return;
        }

        const missingRideRoute = routes.find(
            (route) => !selectedRideByRoute[route.key]
        );

        if (missingRideRoute) {
            setError(
                `Please select a Bike, Auto, or Cab for ${missingRideRoute.fromName} to ${missingRideRoute.toName}.`
            );
            return;
        }

        const rides = routes.map((route) => {
            const ride = selectedRideByRoute[route.key];

            return {
                fromCity: route.fromCityId,
                toCity: route.toCityId,
                rideType: getRideType(ride),
                rideName: ride.name || getRideType(ride),
                estimatedFare: Number(ride.estimatedFare),
                estimatedDurationMinutes: Number(
                    ride.estimatedDurationMinutes
                ),
                travelers: Number(travelers) || 1
            };
        });

        if (rides.some((ride) => !ride.rideType)) {
            setError(
                "One of the selected ride types is invalid. Please select your rides again."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            await saveTripRideSelections(tripId, rides);

            nextStep();
        } catch (err) {
            console.error("Saving ride selections error:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to save your ride selections."
            );
        } finally {
            setSaving(false);
        }
    };

    const allRoutesHaveRides =
        routes.length > 0 &&
        routes.every((route) => Boolean(selectedRideByRoute[route.key]));

    const selectedRideCount = Object.keys(selectedRideByRoute).length;

    const totalTransportCost = Object.values(selectedRideByRoute).reduce(
        (total, ride) => total + (Number(ride?.estimatedFare) || 0),
        0
    );

    const totalTransportDuration = Object.values(
        selectedRideByRoute
    ).reduce(
        (total, ride) =>
            total + (Number(ride?.estimatedDurationMinutes) || 0),
        0
    );

    return (
        <section className="pt-6">
            <button
                type="button"
                onClick={previousStep}
                className="mb-8 inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/40 transition hover:text-white"
            >
                <span className="text-base">←</span>
                Back to stay
            </button>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div>
                    <div className="border-b border-white/10 pb-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
                                    STEP 07 / TRANSPORT
                                </p>

                                <h2 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                                    Move through
                                    <br />
                                    <span className="text-white/30">
                                        every destination.
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
                                    Choose your preferred ride for every route
                                    between the cities in your journey.
                                </p>
                            </div>

                            <div className="shrink-0 border border-white/10 px-5 py-4">
                                <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                                    Routes
                                </p>

                                <p className="mt-2 font-mono text-2xl text-white">
                                    {String(routes.length).padStart(2, "0")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        {routes.length === 0 ? (
                            <div className="border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                                <p className="font-serif text-3xl text-white/70">
                                    No routes available
                                </p>

                                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/35">
                                    Select at least two cities to choose
                                    transportation between them.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {routes.map((route, routeIndex) => {
                                    const routeData =
                                        rideEstimates[route.key];

                                    const estimates =
                                        routeData?.estimates || [];

                                    const selectedRide =
                                        selectedRideByRoute[route.key];

                                    return (
                                        <div
                                            key={route.key}
                                            className="border border-white/10 bg-white/[0.015]"
                                        >
                                            <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                                                <div className="flex items-start justify-between gap-5">
                                                    <div className="flex min-w-0 items-start gap-4">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 font-mono text-[10px] text-white/50">
                                                            {String(
                                                                routeIndex + 1
                                                            ).padStart(2, "0")}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                                                Route
                                                            </p>

                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className="font-serif text-2xl tracking-[-0.04em]">
                                                                    {
                                                                        route.fromName
                                                                    }
                                                                </span>

                                                                <span className="text-white/20">
                                                                    →
                                                                </span>

                                                                <span className="font-serif text-2xl tracking-[-0.04em]">
                                                                    {
                                                                        route.toName
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {selectedRide && (
                                                        <div className="hidden shrink-0 text-right sm:block">
                                                            <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                                                Selected
                                                            </p>

                                                            <p className="mt-2 text-xs text-white">
                                                                {
                                                                    selectedRide.name
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 sm:p-7">
                                                {!routeData ? (
                                                    <div className="border border-dashed border-white/10 px-5 py-10 text-center">
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-white/10 text-xl text-white/30">
                                                            →
                                                        </div>

                                                        <p className="mt-5 font-serif text-2xl text-white/70">
                                                            Get ride options
                                                        </p>

                                                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
                                                            Fetch available Bike,
                                                            Auto and Cab
                                                            options for this
                                                            route.
                                                        </p>
                                                    </div>
                                                ) : estimates.length === 0 ? (
                                                    <div className="border border-white/10 px-5 py-10 text-center">
                                                        <p className="font-serif text-2xl text-white/70">
                                                            No rides available
                                                        </p>

                                                        <p className="mt-3 text-sm text-white/30">
                                                            Try getting the
                                                            estimate again.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        {estimates.map(
                                                            (
                                                                estimate,
                                                                estimateIndex
                                                            ) => {
                                                                const rideType =
                                                                    getRideType(
                                                                        estimate
                                                                    );

                                                                const isSelected =
                                                                    selectedRide?.name ===
                                                                        estimate.name &&
                                                                    selectedRide?.estimatedFare ===
                                                                        estimate.estimatedFare;

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={`${route.key}-${estimate.name}-${estimateIndex}`}
                                                                        onClick={() =>
                                                                            handleSelectRide(
                                                                                route.key,
                                                                                estimate
                                                                            )
                                                                        }
                                                                        className={`group relative overflow-hidden border p-5 text-left transition-all duration-300 ${
                                                                            isSelected
                                                                                ? "border-white bg-white text-[#111311]"
                                                                                : "border-white/10 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.05]"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div
                                                                                className={`flex h-10 w-10 items-center justify-center border text-lg ${
                                                                                    isSelected
                                                                                        ? "border-[#111311]/20"
                                                                                        : "border-white/10"
                                                                                }`}
                                                                            >
                                                                                {getRideIcon(
                                                                                    rideType
                                                                                )}
                                                                            </div>

                                                                            <span
                                                                                className={`text-[8px] uppercase tracking-[0.25em] ${
                                                                                    isSelected
                                                                                        ? "text-[#111311]/40"
                                                                                        : "text-white/25"
                                                                                }`}
                                                                            >
                                                                                {isSelected
                                                                                    ? "Selected"
                                                                                    : "Choose"}
                                                                            </span>
                                                                        </div>

                                                                        <p className="mt-7 font-serif text-2xl tracking-[-0.04em]">
                                                                            {
                                                                                estimate.name
                                                                            }
                                                                        </p>

                                                                        <div className="mt-5 flex items-end justify-between gap-4">
                                                                            <div>
                                                                                <p
                                                                                    className={`text-[8px] uppercase tracking-[0.2em] ${
                                                                                        isSelected
                                                                                            ? "text-[#111311]/40"
                                                                                            : "text-white/25"
                                                                                    }`}
                                                                                >
                                                                                    Fare
                                                                                </p>

                                                                                <p className="mt-1 text-sm font-medium">
                                                                                    {formatPrice(
                                                                                        estimate.estimatedFare
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            <div className="text-right">
                                                                                <p
                                                                                    className={`text-[8px] uppercase tracking-[0.2em] ${
                                                                                        isSelected
                                                                                            ? "text-[#111311]/40"
                                                                                            : "text-white/25"
                                                                                    }`}
                                                                                >
                                                                                    Time
                                                                                </p>

                                                                                <p className="mt-1 text-sm">
                                                                                    {
                                                                                        estimate.estimatedDurationMinutes
                                                                                    }{" "}
                                                                                    min
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className={`absolute bottom-0 left-0 h-px transition-all duration-500 ${
                                                                                isSelected
                                                                                    ? "w-full bg-[#111311]"
                                                                                    : "w-0 bg-white group-hover:w-full"
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {rideEstimateError && (
                            <div className="mt-5 border border-red-400/20 bg-red-400/[0.04] px-5 py-4">
                                <p className="text-xs leading-6 text-red-300/80">
                                    {rideEstimateError}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-5 border border-red-400/20 bg-red-400/[0.04] px-5 py-4">
                                <p className="text-xs leading-6 text-red-300/80">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                onClick={previousStep}
                                className="border border-white/10 px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-white/50 transition hover:border-white/30 hover:text-white"
                            >
                                ← Back to stay
                            </button>

                            <button
                                type="button"
                                onClick={handleGetRideEstimate}
                                disabled={
                                    rideEstimateLoading ||
                                    routes.length === 0
                                }
                                className="bg-white px-7 py-4 text-[9px] uppercase tracking-[0.3em] text-[#111311] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {rideEstimateLoading
                                    ? "Finding rides..."
                                    : "Get ride options ↗"}
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="border border-white/10 bg-white/[0.02]">
                        <div className="border-b border-white/10 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                                        Journey transport
                                    </p>

                                    <h3 className="mt-2 font-serif text-2xl tracking-[-0.04em]">
                                        Your rides
                                    </h3>
                                </div>

                                <span className="font-mono text-xs text-white/40">
                                    {selectedRideCount}/{routes.length}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                        Routes
                                    </p>

                                    <p className="mt-2 font-serif text-2xl">
                                        {routes.length}
                                    </p>
                                </div>

                                <div className="bg-[#111311] p-4">
                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                        Selected
                                    </p>

                                    <p className="mt-2 font-serif text-2xl">
                                        {selectedRideCount}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {routes.map((route, index) => {
                                    const ride =
                                        selectedRideByRoute[route.key];

                                    return (
                                        <div
                                            key={route.key}
                                            className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="flex gap-3">
                                                <span className="font-mono text-[9px] text-white/25">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="truncate text-xs text-white/60">
                                                            {route.fromName} →{" "}
                                                            {route.toName}
                                                        </p>

                                                        {ride && (
                                                            <span className="shrink-0 text-[9px] text-white/30">
                                                                {formatPrice(
                                                                    ride.estimatedFare
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/25">
                                                        {ride
                                                            ? ride.name
                                                            : "Not selected"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 border-t border-white/10 pt-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                            Transport total
                                        </p>

                                        <p className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                                            {formatPrice(totalTransportCost)}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                            Duration
                                        </p>

                                        <p className="mt-2 text-xs text-white/50">
                                            {totalTransportDuration > 0
                                                ? `${totalTransportDuration} min`
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={
                                    saving ||
                                    !allRoutesHaveRides
                                }
                                className="mt-6 w-full bg-white px-5 py-4 text-[9px] uppercase tracking-[0.3em] text-[#111311] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {saving
                                    ? "Saving journey..."
                                    : "Continue to review ↗"}
                            </button>

                            <p className="mt-4 text-center text-[8px] uppercase tracking-[0.18em] leading-5 text-white/20">
                                Select one ride for every route
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default TransportStep;