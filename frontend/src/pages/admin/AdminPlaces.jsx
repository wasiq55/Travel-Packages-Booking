import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminPlaces = () => {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const loadPlaces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/places");

      setPlaces(response.data?.places || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load places"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const cities = useMemo(() => {
    const cityMap = new Map();

    places.forEach((place) => {
      if (
        place.city &&
        typeof place.city === "object" &&
        place.city._id
      ) {
        cityMap.set(
          place.city._id,
          place.city.name || "Unknown City"
        );
      }
    });

    return Array.from(cityMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return places.filter((place) => {
      const placeName =
        place.name?.toLowerCase() || "";

      const cityName =
        typeof place.city === "object"
          ? place.city?.name?.toLowerCase() || ""
          : "";

      const matchesSearch =
        !searchValue ||
        placeName.includes(searchValue) ||
        cityName.includes(searchValue);

      const placeCityId =
        typeof place.city === "object"
          ? place.city?._id
          : place.city;

      const matchesCity =
        cityFilter === "all" ||
        placeCityId === cityFilter;

      return matchesSearch && matchesCity;
    });
  }, [places, search, cityFilter]);

  const activePlaces = places.filter(
    (place) => place.isActive
  ).length;

  const inactivePlaces = places.length - activePlaces;

  return (
    <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="mb-6 text-sm text-white/40 transition hover:text-white"
            >
              ← Back to Dashboard
            </button>

            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/35">
              Wander Admin
            </p>

            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Places
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Manage destinations and attractions available
              across Wander cities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/55">
              {places.length} Places
            </div>

            <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-2.5 text-sm text-emerald-300/65">
              {activePlaces} Active
            </div>

            <button
              type="button"
              onClick={loadPlaces}
              disabled={loading}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300/60 transition hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#171917] p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/30">
              Destination Directory
            </p>

            <p className="mt-2 text-sm text-white/45">
              Search attractions or filter destinations by city.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                Search Places
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search places or cities..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/35 transition hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="lg:w-72">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                City
              </label>

              <select
                value={cityFilter}
                onChange={(e) =>
                  setCityFilter(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-white/25"
              >
                <option value="all">All Cities</option>

                {cities.map(([cityId, cityName]) => (
                  <option
                    key={cityId}
                    value={cityId}
                  >
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">
              Places Directory
            </p>

            <p className="mt-2 text-sm text-white/45">
              Showing{" "}
              <span className="text-white/80">
                {filteredPlaces.length}
              </span>{" "}
              of{" "}
              <span className="text-white/80">
                {places.length}
              </span>{" "}
              places
            </p>
          </div>

          {(search || cityFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCityFilter("all");
              }}
              className="text-xs text-white/40 transition hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-24 text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />

            <p className="text-sm text-white/45">
              Loading places...
            </p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-24 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-xl text-white/40">
              ⌖
            </div>

            <h2 className="font-serif text-2xl">
              No places found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Try changing your search or city filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPlaces.map((place) => {
              const cityName =
                typeof place.city === "object"
                  ? place.city?.name
                  : "Unknown City";

              const image =
                place.image ||
                place.images?.[0] ||
                "/images/goa.jpg";

              return (
                <div
                  key={place._id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171917] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="relative h-56 overflow-hidden bg-white/[0.03]">
                    <img
                      src={image}
                      alt={place.name || "Place"}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/goa.jpg";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-[11px] backdrop-blur-sm ${
                          place.isActive
                            ? "border-emerald-300/20 bg-black/30 text-emerald-200/80"
                            : "border-white/15 bg-black/30 text-white/55"
                        }`}
                      >
                        {place.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                        Destination
                      </p>

                      <span className="text-sm text-white/85">
                        {cityName}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-serif text-2xl text-white">
                      {place.name}
                    </h2>

                    {place.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/45">
                        {place.description}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                          City
                        </p>

                        <p className="mt-1 truncate text-xs text-white/60">
                          {cityName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Status
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            place.isActive
                              ? "text-emerald-300/70"
                              : "text-white/35"
                          }`}
                        >
                          {place.isActive
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlaces;