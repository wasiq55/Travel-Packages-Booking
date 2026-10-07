import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getHomeStates } from "../api/homeApi";

const stateCoordinates = {
  "andaman-nicobar-islands": [11.7401, 92.6586],
  "andhra-pradesh": [15.9129, 79.74],
  "arunachal-pradesh": [28.218, 94.7278],
  assam: [26.2006, 92.9376],
  bihar: [25.0961, 85.3131],
  chandigarh: [30.7333, 76.7794],
  chhattisgarh: [21.2787, 81.8661],
  "dadra-nagar-haveli-daman-diu": [20.3974, 72.8328],
  delhi: [28.6139, 77.209],
  goa: [15.2993, 74.124],
  gujarat: [22.2587, 71.1924],
  haryana: [29.0588, 76.0856],
  "himachal-pradesh": [31.1048, 77.1734],
  "jammu-kashmir": [33.7782, 76.5762],
  jharkhand: [23.6102, 85.2799],
  karnataka: [15.3173, 75.7139],
  kerala: [10.8505, 76.2711],
  ladakh: [34.1526, 77.5771],
  lakshadweep: [10.5667, 72.6417],
  "madhya-pradesh": [22.9734, 78.6569],
  maharashtra: [19.7515, 75.7139],
  manipur: [24.6637, 93.9063],
  meghalaya: [25.467, 91.3662],
  mizoram: [23.1645, 92.9376],
  nagaland: [26.1584, 94.5624],
  odisha: [20.2961, 85.8245],
  puducherry: [11.9416, 79.8083],
  punjab: [31.1471, 75.3412],
  rajasthan: [27.0238, 74.2179],
  sikkim: [27.533, 88.5122],
  "tamil-nadu": [11.1271, 78.6569],
  telangana: [18.1124, 79.0193],
  tripura: [23.9408, 91.9882],
  "uttar-pradesh": [26.8467, 80.9462],
  uttarakhand: [30.0668, 79.0193],
  "west-bengal": [22.9868, 87.855],
};

const stateImages = {
  goa: "/images/goa.jpg",
  "himachal-pradesh": "/images/mountain.jpg",
  meghalaya: "/images/froest.jpg",
  rajasthan: "/images/desrt.jpg",
  "andaman-nicobar-islands": "/images/goa.jpg",
  kerala: "/images/forest.jpg",
  karnataka: "/images/city.jpg",
  maharashtra: "/images/city.jpg",
  odisha: "/images/hero.jpg",
  "west-bengal": "/images/forest.jpg",
  default: "/images/hero.jpg",
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getStateImage(state) {
  if (state?.image) {
    const image = state.image.trim();

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return `http://localhost:5000/${image.replace(/^\/+/, "")}`;
  }

  return stateImages[state?.slug] || stateImages.default;
}

function Destinations() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");

  useEffect(() => {
    let mounted = true;

    const loadStates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getHomeStates();

        if (!mounted) return;

        if (response?.success && Array.isArray(response.states)) {
          setStates(response.states);
        } else {
          setStates([]);
          setError("Unable to load destinations.");
        }
      } catch (err) {
        if (!mounted) return;

        setStates([]);
        setError(
          err?.response?.data?.message ||
            "Unable to connect to the destination service."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStates();

    return () => {
      mounted = false;
    };
  }, []);

  const zones = useMemo(() => {
    const uniqueZones = new Set();

    states.forEach((state) => {
      if (state?.zone?.name) {
        uniqueZones.add(state.zone.name);
      }
    });

    return ["All", ...Array.from(uniqueZones)];
  }, [states]);

  const filteredStates = useMemo(() => {
    if (selectedZone === "All") {
      return states;
    }

    return states.filter((state) => state?.zone?.name === selectedZone);
  }, [states, selectedZone]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <section className="relative min-h-[75vh] overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Explore India"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-7xl items-end px-6 pb-16 sm:px-10 lg:px-16">
          <div className="max-w-5xl">
            <p className="mb-5 text-sm uppercase tracking-[0.35em] text-white/60">
              Explore India
            </p>

            <h1 className="font-serif text-6xl leading-[0.88] tracking-[-0.05em] sm:text-8xl lg:text-[10rem]">
              Destinations
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Explore every corner of India. Discover states, cities, places
              and experiences for your next journey.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">
              Explore the map
            </p>

            <h2 className="font-serif text-4xl tracking-[-0.03em] sm:text-6xl">
              India, waiting for you
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
              Explore all {states.length || 36} destinations from your
              database directly on the map.
            </p>
          </div>

          <div className="text-sm text-white/50">
            {loading ? "Loading..." : `${states.length} destinations`}
          </div>
        </div>

        {error && (
          <div className="mb-8 border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-hidden border border-white/10 bg-[#111]">
          <MapContainer
            center={[22.9734, 78.6569]}
            zoom={5}
            scrollWheelZoom={true}
            className="h-[550px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredStates.map((state) => {
              const position = stateCoordinates[state.slug];

              if (!position) {
                return null;
              }

              return (
                <Marker
                  key={state._id}
                  position={position}
                  icon={markerIcon}
                >
                  <Popup>
                    <div className="min-w-[210px]">
                      <h3 className="text-lg font-semibold">
                        {state.name}
                      </h3>

                      {state.zone?.name && (
                        <p className="mt-1 text-xs text-gray-500">
                          {state.zone.name}
                        </p>
                      )}

                      {state.description && (
                        <p className="mt-2 text-sm leading-5 text-gray-600">
                          {state.description}
                        </p>
                      )}

                      <Link
                        to={`/trip-builder?state=${state.slug}`}
                        className="mt-4 inline-block text-sm font-semibold"
                      >
                        Explore {state.name} →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mb-10 flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">
              All destinations
            </p>

            <h2 className="font-serif text-4xl tracking-[-0.03em] sm:text-6xl">
              Choose your region
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {zones.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
                  selectedZone === zone
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm uppercase tracking-[0.2em] text-white/40">
            Loading destinations...
          </div>
        ) : filteredStates.length === 0 ? (
          <div className="py-20 text-center text-sm text-white/40">
            No destinations found.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStates.map((state) => (
              <Link
                key={state._id}
                to={`/trip-builder?state=${state.slug}`}
                className="group overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getStateImage(state)}
                    alt={state.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src = "/images/hero.jpg";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {state.zone?.name || "India"}
                    </p>

                    <h3 className="font-serif text-2xl leading-tight">
                      {state.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-xs uppercase tracking-[0.15em] text-white/40">
                    Explore
                  </span>

                  <span className="text-lg transition-transform group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40">
                Build your journey
              </p>

              <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
                Pick a place.
                <br />
                Start the journey.
              </h2>
            </div>

            <div className="lg:col-span-5">
              <p className="mb-7 text-sm leading-7 text-white/55">
                Choose a state and continue into the trip builder to select
                cities, places, hotels, transport and activities.
              </p>

              <Link
                to="/trip-builder"
                className="inline-flex items-center gap-4 border border-white/20 px-7 py-4 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
              >
                Start building
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Destinations;