import { useTripBuilder } from "../../context/TripBuilderContext";

import ZoneStep from "./ZoneStep";
import StateStep from "./StateStep";
import CityStep from "./CityStep";
import DateStep from "./DateStep";
import PlaceStep from "./PlaceStep";
import HotelStep from "./HotelStep";
import TransportStep from "./TransportStep";
import ReviewStep from "./ReviewStep";

const TripBuilderContent = () => {
    const { step } = useTripBuilder();

    const steps = [
        <ZoneStep key="zone" />,
        <StateStep key="state" />,
        <CityStep key="city" />,
        <DateStep key="date" />,
        <PlaceStep key="place" />,
        <HotelStep key="hotel" />,
        <TransportStep key="transport" />,
        <ReviewStep key="review" />
    ];

    const stepNames = [
        "Region",
        "State",
        "Cities",
        "Dates",
        "Places",
        "Stay",
        "Transport",
        "Review"
    ];

    const currentStep = Math.min(Math.max(Number(step) || 0, 0), 7);
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#111311] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-15%] top-[10%] h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[120px]" />

                <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[140px]" />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-[1500px] px-5 pb-24 pt-12 sm:px-8 lg:px-10">
                <div className="border-b border-white/10 pb-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.45em] text-white/35">
                                WANDER INDIA / TRIP BUILDER
                            </p>

                            <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.88] tracking-[-0.07em] sm:text-7xl lg:text-[100px]">
                                Plan your
                                <br />
                                <span className="text-white/35">
                                    journey.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
                                Choose your destinations, stays, activities
                                and transport. We'll bring everything together
                                into one complete journey.
                            </p>
                        </div>

                        <div className="w-full lg:max-w-sm">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
                                        Current step
                                    </p>

                                    <p className="mt-2 font-serif text-2xl tracking-[-0.04em]">
                                        {stepNames[currentStep]}
                                    </p>
                                </div>

                                <p className="font-mono text-xs text-white/50">
                                    {String(currentStep + 1).padStart(2, "0")}
                                    <span className="mx-2 text-white/20">
                                        /
                                    </span>
                                    {String(steps.length).padStart(2, "0")}
                                </p>
                            </div>

                            <div className="mt-5 h-px w-full bg-white/10">
                                <div
                                    className="h-full bg-white transition-all duration-700"
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />
                            </div>

                            <div className="mt-4 flex justify-between">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                    Start
                                </span>

                                <span className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                    Complete
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {steps[currentStep]}
                </div>
            </main>

            <div className="pointer-events-none fixed bottom-5 left-5 z-20 text-[8px] uppercase tracking-[0.35em] text-white/20 sm:left-8 lg:left-10">
                Wander India / 2026
            </div>

            <div className="pointer-events-none fixed bottom-5 right-5 z-20 text-[8px] uppercase tracking-[0.35em] text-white/20 sm:right-8 lg:right-10">
                Discover / Plan / Travel
            </div>
        </div>
    );
};

const TripBuilder = () => {
    return <TripBuilderContent />;
};

export default TripBuilder;