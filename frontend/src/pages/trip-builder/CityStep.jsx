import { useEffect, useState } from "react";
import { useTripBuilder } from "../../context/TripBuilderContext";

const getId = (item) => {
  if (typeof item === "string") {
    return item;
  }

  return item?._id || item?.id;
};

const getName = (item) => {
  return item?.name || item?.title || "City";
};

const getStateId = (city) => {
  if (typeof city?.state === "string") {
    return city.state;
  }

  return (
    city?.state?._id ||
    city?.state?.id ||
    city?.stateId ||
    city?.state?._id?.toString()
  );
};

const getCityImage = (city) => {
  return (
    city?.image ||
    city?.coverImage ||
    city?.photo ||
    "https://placehold.co/1200x800/e5e7eb/6b7280?text=City+Image"
  );
};

const CityStep = () => {
  const {
    selectedStates,
    cities,
    selectedCities,
    toggleCity,
    nextStep,
    previousStep,
    loading,
    error
  } = useTripBuilder();

  const [stateCities, setStateCities] = useState({});

  useEffect(() => {
    const grouped = {};

    selectedStates.forEach((state) => {
      const stateId = getId(state);

      grouped[stateId] = {
        stateName: getName(state),
        cities: cities.filter((city) => {
          return String(getStateId(city)) === String(stateId);
        })
      };
    });

    setStateCities(grouped);
  }, [selectedStates, cities]);

  const isCitySelected = (city) => {
    const cityId = getId(city);

    return selectedCities.some((item) => {
      return String(getId(item)) === String(cityId);
    });
  };

  const totalAvailableCities = Object.values(stateCities).reduce(
    (total, stateData) => {
      return total + stateData.cities.length;
    },
    0
  );

  return (
    <section className="pt-10">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
            Step 03 / Destinations
          </p>

          <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Choose your cities.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
            Select the cities you want to experience. You can build a journey
            across multiple states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-white/15" />

          <span className="font-mono text-xs text-white/40">
            {String(selectedCities.length).padStart(2, "0")}
          </span>

          <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
            {selectedCities.length === 1 ? "City" : "Cities"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-8 border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {selectedStates.length === 0 ? (
        <div className="mt-10 border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
            Destination selection
          </p>

          <h3 className="mt-4 font-serif text-3xl tracking-[-0.04em]">
            No states selected
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            Go back and select at least one state before choosing cities.
          </p>

          <button
            type="button"
            onClick={previousStep}
            className="mt-7 border border-white/15 px-6 py-3 text-[9px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
          >
            ← Choose states
          </button>
        </div>
      ) : loading && cities.length === 0 ? (
        <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse bg-white/[0.05]"
            />
          ))}
        </div>
      ) : totalAvailableCities === 0 ? (
        <div className="mt-10 border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
            No destinations
          </p>

          <h3 className="mt-4 font-serif text-3xl tracking-[-0.04em]">
            No cities available
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            No cities were found for your selected states.
          </p>

          <button
            type="button"
            onClick={previousStep}
            className="mt-7 border border-white/15 px-6 py-3 text-[9px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
          >
            ← Change states
          </button>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {Object.entries(stateCities).map(
            ([stateId, stateData]) => (
              <div key={stateId}>
                <div className="mb-5 flex items-end justify-between gap-5 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                      State
                    </p>

                    <h3 className="mt-2 font-serif text-2xl tracking-[-0.04em] text-white/85 sm:text-3xl">
                      {stateData.stateName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/30">
                      {String(stateData.cities.length).padStart(2, "0")}
                    </span>

                    <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                      {stateData.cities.length === 1
                        ? "City"
                        : "Cities"}
                    </span>
                  </div>
                </div>

                {stateData.cities.length === 0 ? (
                  <div className="border border-white/10 bg-white/[0.02] p-8 text-sm text-white/30">
                    No cities available in this state.
                  </div>
                ) : (
                  <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                    {stateData.cities.map((city, index) => {
                      const citySelected = isCitySelected(city);

                      return (
                        <button
                          key={getId(city) || index}
                          type="button"
                          onClick={() => toggleCity(city)}
                          className={`group relative h-72 overflow-hidden text-left transition-all duration-500 ${
                            citySelected
                              ? "ring-1 ring-white ring-offset-4 ring-offset-[#111311]"
                              : ""
                          }`}
                        >
                          <img
                            src={getCityImage(city)}
                            alt={getName(city)}
                            className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src =
                                "https://placehold.co/1200x800/e5e7eb/6b7280?text=City+Image";
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />

                          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                            <span className="border border-white/20 bg-black/20 px-3 py-2 text-[8px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
                              City
                            </span>

                            <span className="font-mono text-[9px] text-white/40">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-6">
                            <h4 className="font-serif text-3xl tracking-[-0.04em] text-white">
                              {getName(city)}
                            </h4>

                            <div className="mt-4 flex items-center gap-3">
                              <span
                                className={`h-px transition-all duration-500 ${
                                  citySelected
                                    ? "w-10 bg-white"
                                    : "w-5 bg-white/40 group-hover:w-10"
                                }`}
                              />

                              <span className="text-[8px] uppercase tracking-[0.3em] text-white/55">
                                {citySelected
                                  ? "Added to journey"
                                  : "Add to journey"}
                              </span>

                              <span className="text-white/50">
                                →
                              </span>
                            </div>
                          </div>

                          {citySelected && (
                            <>
                              <div className="absolute right-5 top-16 flex h-9 w-9 items-center justify-center border border-white bg-white text-xs text-black">
                                ✓
                              </div>

                              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white" />
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {!loading &&
        selectedStates.length > 0 &&
        totalAvailableCities > 0 && (
          <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={previousStep}
              className="flex items-center justify-center gap-3 border border-white/10 px-7 py-4 text-[9px] uppercase tracking-[0.3em] text-white/45 transition hover:border-white/30 hover:text-white"
            >
              <span>←</span>
              Back
            </button>

            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <div className="hidden text-right sm:block">
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                  Selected
                </p>

                <p className="mt-1 text-xs text-white/40">
                  {selectedCities.length}{" "}
                  {selectedCities.length === 1
                    ? "city"
                    : "cities"}
                </p>
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={selectedCities.length === 0}
                className={`group flex items-center gap-5 px-7 py-4 text-[9px] uppercase tracking-[0.3em] transition ${
                  selectedCities.length === 0
                    ? "cursor-not-allowed bg-white/10 text-white/20"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                Continue to dates

                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        )}
    </section>
  );
};

export default CityStep;