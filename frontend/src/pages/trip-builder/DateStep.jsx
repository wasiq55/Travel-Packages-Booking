import { useEffect, useState } from "react";
import { useTripBuilder } from "../../context/TripBuilderContext";

const DateStep = () => {
    const {
        selectedZone,
        selectedStates,
        selectedCities,
        tripTitle,
        startDate,
        endDate,
        travelers,
        setTripTitle,
        setStartDate,
        setEndDate,
        setTravelers,
        nextStep,
        previousStep,
        tripLoading,
        error: backendError
    } = useTripBuilder();

    const [error, setError] = useState("");

    const [adults, setAdults] = useState(
        Math.max(1, travelers || 1)
    );

    const [children, setChildren] = useState(0);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate("");
        }
    }, [startDate, endDate, setEndDate]);

    useEffect(() => {
        const totalTravelers = adults + children;

        if (totalTravelers !== travelers) {
            setTravelers(totalTravelers);
        }
    }, [adults, children, travelers, setTravelers]);

    const updateAdults = (value) => {
        const nextValue = Math.min(20, Math.max(1, value));

        setAdults(nextValue);
        setTravelers(nextValue + children);
    };

    const updateChildren = (value) => {
        const nextValue = Math.min(10, Math.max(0, value));

        setChildren(nextValue);
        setTravelers(adults + nextValue);
    };

    const handleContinue = () => {
        setError("");

        if (!selectedZone) {
            setError("Please select a travel zone.");
            return;
        }

        if (!selectedCities || selectedCities.length === 0) {
            setError("Please select at least one city.");
            return;
        }

        if (!startDate) {
            setError("Please select your start date.");
            return;
        }

        if (!endDate) {
            setError("Please select your end date.");
            return;
        }

        if (endDate < startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        if (adults < 1) {
            setError("At least one adult is required.");
            return;
        }

        if (travelers < 1) {
            setError("At least one traveler is required.");
            return;
        }

        nextStep();
    };

    return (
        <section className="pt-10">
            <div className="border-b border-white/10 pb-7">
                <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
                    Step 04 / Journey
                </p>

                <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                    Set your trip details.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
                    Choose your travel dates and tell us who is joining the
                    journey.
                </p>
            </div>

            <div className="mt-10 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="bg-[#111311] p-6 sm:p-8 lg:p-10">
                    <div>
                        <label className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                            Trip name
                        </label>

                        <input
                            type="text"
                            value={tripTitle}
                            onChange={(event) =>
                                setTripTitle(event.target.value)
                            }
                            placeholder="Example: Himachal Adventure"
                            className="mt-3 w-full border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-white/35 focus:bg-white/[0.05]"
                        />
                    </div>

                    <div className="mt-8">
                        <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                            Travel dates
                        </p>

                        <div className="mt-3 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                            <div className="bg-[#111311] p-5">
                                <label className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                    Start date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    min={today}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                    className="mt-3 w-full border-b border-white/15 bg-transparent pb-3 text-sm text-white outline-none transition focus:border-white"
                                />
                            </div>

                            <div className="bg-[#111311] p-5">
                                <label className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                                    End date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || today}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                    className="mt-3 w-full border-b border-white/15 bg-transparent pb-3 text-sm text-white outline-none transition focus:border-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-end justify-between gap-5">
                            <div>
                                <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                                    Travelers
                                </p>

                                <p className="mt-2 text-sm text-white/35">
                                    Who is joining this journey?
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="font-mono text-lg text-white/70">
                                    {String(travelers).padStart(2, "0")}
                                </p>

                                <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                                    Total
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                            <div className="bg-[#111311] p-5">
                                <div className="flex items-center justify-between gap-5">
                                    <div>
                                        <p className="font-serif text-xl text-white">
                                            Adults
                                        </p>

                                        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Age 13+
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateAdults(adults - 1)
                                            }
                                            disabled={adults <= 1}
                                            className="flex h-10 w-10 items-center justify-center border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:text-white/15"
                                        >
                                            −
                                        </button>

                                        <span className="flex h-10 w-10 items-center justify-center font-mono text-sm text-white">
                                            {adults}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateAdults(adults + 1)
                                            }
                                            disabled={adults >= 20}
                                            className="flex h-10 w-10 items-center justify-center bg-white text-lg text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/20"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111311] p-5">
                                <div className="flex items-center justify-between gap-5">
                                    <div>
                                        <p className="font-serif text-xl text-white">
                                            Children
                                        </p>

                                        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/25">
                                            Age 0–12
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateChildren(children - 1)
                                            }
                                            disabled={children <= 0}
                                            className="flex h-10 w-10 items-center justify-center border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:text-white/15"
                                        >
                                            −
                                        </button>

                                        <span className="flex h-10 w-10 items-center justify-center font-mono text-sm text-white">
                                            {children}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateChildren(children + 1)
                                            }
                                            disabled={children >= 10}
                                            className="flex h-10 w-10 items-center justify-center bg-white text-lg text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/20"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                                Group size
                            </span>

                            <span className="text-xs text-white/50">
                                {adults}{" "}
                                {adults === 1 ? "adult" : "adults"}
                                {" · "}
                                {children}{" "}
                                {children === 1
                                    ? "child"
                                    : "children"}
                            </span>
                        </div>
                    </div>

                    {(error || backendError) && (
                        <div className="mt-6 border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
                            {error || backendError}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 text-black sm:p-8 lg:p-10">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-black/35">
                        Your journey
                    </p>

                    <h3 className="mt-5 font-serif text-3xl tracking-[-0.04em]">
                        {tripTitle || "Your new adventure"}
                    </h3>

                    <div className="mt-10 space-y-0">
                        <div className="border-b border-black/10 py-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-black/35">
                                Region
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {selectedZone?.name ||
                                    selectedZone?.title ||
                                    "Not selected"}
                            </p>
                        </div>

                        <div className="border-b border-black/10 py-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-black/35">
                                States
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {selectedStates.length} selected
                            </p>
                        </div>

                        <div className="border-b border-black/10 py-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-black/35">
                                Cities
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {selectedCities.length} selected
                            </p>
                        </div>

                        <div className="border-b border-black/10 py-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-black/35">
                                Dates
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {startDate || "Not selected"}
                            </p>

                            <p className="mt-1 text-xs text-black/40">
                                {endDate
                                    ? `to ${endDate}`
                                    : "End date not selected"}
                            </p>
                        </div>

                        <div className="py-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-black/35">
                                Travelers
                            </p>

                            <p className="mt-2 font-serif text-2xl">
                                {travelers}
                            </p>

                            <p className="mt-1 text-xs text-black/45">
                                {adults}{" "}
                                {adults === 1 ? "adult" : "adults"}
                                {" · "}
                                {children}{" "}
                                {children === 1
                                    ? "child"
                                    : "children"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={tripLoading}
                    className="flex items-center justify-center gap-3 border border-white/10 px-7 py-4 text-[9px] uppercase tracking-[0.3em] text-white/45 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span>←</span>
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={tripLoading}
                    className="group flex items-center justify-center gap-5 bg-white px-8 py-4 text-[9px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Continue to places

                    <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                        →
                    </span>
                </button>
            </div>
        </section>
    );
};

export default DateStep;