import { useTripBuilder } from "../../context/TripBuilderContext";

const getId = (item) => {
  return item?._id || item?.id;
};

const getName = (item) => {
  return item?.name || item?.title || "Travel Zone";
};

const zoneImages = [
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1400&q=85"
];

const ZoneStep = () => {
  const {
    zones,
    selectedZone,
    selectZone,
    loading,
    error
  } = useTripBuilder();

  return (
    <section className="pt-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">
            Step 01 / Destination
          </p>

          <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Where will you go?
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
            Begin your journey by choosing a region of India to explore.
          </p>
        </div>

        <p className="hidden text-[9px] uppercase tracking-[0.3em] text-white/25 sm:block">
          Choose a region
        </p>
      </div>

      {error && (
        <div className="mt-8 border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && zones.length === 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse bg-white/[0.06]"
            />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="mt-8 border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
            No destinations
          </p>

          <h3 className="mt-4 font-serif text-3xl tracking-[-0.04em]">
            No travel zones available
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            Add travel zones from your admin panel before creating a journey.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone, index) => {
            const zoneId = getId(zone);

            const isSelected =
              getId(selectedZone) === zoneId;

            return (
              <button
                key={zoneId || index}
                type="button"
                onClick={() => selectZone(zone)}
                disabled={loading}
                className={`group relative h-[360px] overflow-hidden text-left transition-all duration-500 ${
                  isSelected
                    ? "ring-1 ring-white ring-offset-4 ring-offset-[#111311]"
                    : "hover:-translate-y-1"
                }`}
              >
                <img
                  src={
                    zone.image ||
                    zone.coverImage ||
                    zoneImages[index % zoneImages.length]
                  }
                  alt={getName(zone)}
                  className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  <span className="border border-white/20 bg-black/20 px-3 py-2 text-[8px] uppercase tracking-[0.3em] text-white/75 backdrop-blur-md">
                    Region
                  </span>

                  <span className="font-mono text-[9px] text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <h3 className="font-serif text-3xl tracking-[-0.04em] text-white sm:text-4xl">
                        {getName(zone)}
                      </h3>

                      <div className="mt-4 flex items-center gap-3">
                        <span
                          className={`h-px transition-all duration-500 ${
                            isSelected
                              ? "w-10 bg-white"
                              : "w-5 bg-white/40 group-hover:w-10"
                          }`}
                        />

                        <span className="text-[8px] uppercase tracking-[0.3em] text-white/55">
                          {isSelected
                            ? "Selected"
                            : "Explore region"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-500 ${
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-white/30 bg-black/20 text-white group-hover:border-white"
                      }`}
                    >
                      {isSelected ? "✓" : "↗"}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedZone && (
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
              Selected region
            </p>

            <p className="mt-2 font-serif text-xl text-white/80">
              {getName(selectedZone)}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[8px] uppercase tracking-[0.3em] text-white/35">
            <span className="h-px w-8 bg-white/20" />
            Loading states
            <span className="text-white/70">→</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ZoneStep;