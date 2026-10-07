import { useTripBuilder } from "../../context/TripBuilderContext";

const getId = (item) => {
  return item?._id || item?.id;
};

const getName = (item) => {
  return item?.name || item?.title || "State";
};

const StateStep = () => {
  const {
    states,
    selectedStates,
    toggleState,
    nextStep,
    previousStep,
    loading,
    error,
    selectedZone
  } = useTripBuilder();

  const isSelected = (state) => {
    const stateId = getId(state);

    return selectedStates.some(
      (item) => getId(item) === stateId
    );
  };

  return (
    <section className="pt-10">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
            Step 02 / Region
          </p>

          <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Choose your states.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
            Select one or more states you want to include in your journey.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-white/15" />

          <span className="font-mono text-xs text-white/40">
            {String(selectedStates.length).padStart(2, "0")}
          </span>

          <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
            Selected
          </span>
        </div>
      </div>

      {selectedZone && (
        <div className="mt-7 flex items-center gap-4 border-b border-white/10 pb-5">
          <span className="text-[8px] uppercase tracking-[0.35em] text-white/25">
            Region
          </span>

          <span className="h-px w-6 bg-white/15" />

          <span className="font-serif text-lg text-white/75">
            {selectedZone.name || selectedZone.title}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-8 border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {states.length === 0 ? (
        <div className="mt-10 border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
            No destinations
          </p>

          <h3 className="mt-4 font-serif text-3xl tracking-[-0.04em]">
            No states available
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            No states were found for this region.
          </p>

          <button
            type="button"
            onClick={previousStep}
            className="mt-7 border border-white/15 px-6 py-3 text-[9px] uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ← Choose another region
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {states.map((state, index) => {
              const stateSelected = isSelected(state);

              return (
                <button
                  key={getId(state) || index}
                  type="button"
                  onClick={() => toggleState(state)}
                  disabled={loading}
                  className={`group relative min-h-[220px] overflow-hidden p-6 text-left transition-all duration-500 ${
                    stateSelected
                      ? "bg-white text-black"
                      : "bg-[#111311] text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p
                        className={`text-[8px] uppercase tracking-[0.35em] ${
                          stateSelected
                            ? "text-black/40"
                            : "text-white/25"
                        }`}
                      >
                        State / {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3
                        className={`mt-5 font-serif text-3xl tracking-[-0.04em] sm:text-4xl ${
                          stateSelected
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        {getName(state)}
                      </h3>
                    </div>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border text-xs transition-all duration-300 ${
                        stateSelected
                          ? "border-black bg-black text-white"
                          : "border-white/20 text-transparent group-hover:border-white/50 group-hover:text-white/50"
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div
                      className={`mb-4 h-px transition-all duration-500 ${
                        stateSelected
                          ? "w-12 bg-black/30"
                          : "w-6 bg-white/15 group-hover:w-12"
                      }`}
                    />

                    <p
                      className={`text-[8px] uppercase tracking-[0.3em] ${
                        stateSelected
                          ? "text-black/45"
                          : "text-white/30"
                      }`}
                    >
                      {stateSelected
                        ? "Added to your journey"
                        : "Select state"}
                    </p>
                  </div>

                  <span
                    className={`absolute right-6 bottom-6 font-mono text-[8px] ${
                      stateSelected
                        ? "text-black/25"
                        : "text-white/15"
                    }`}
                  >
                    INDIA
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                  Next
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Choose your cities
                </p>
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={selectedStates.length === 0 || loading}
                className={`group flex items-center gap-5 px-7 py-4 text-[9px] uppercase tracking-[0.3em] transition ${
                  selectedStates.length === 0 || loading
                    ? "cursor-not-allowed bg-white/10 text-white/20"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                Continue to cities

                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default StateStep;