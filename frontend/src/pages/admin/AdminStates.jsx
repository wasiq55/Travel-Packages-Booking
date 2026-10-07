import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminStates = () => {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cityCounts, setCityCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [expandedState, setExpandedState] = useState(null);
  const [stateCities, setStateCities] = useState({});

  const loadStates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/states");
      const stateList = response.data?.states || [];

      setStates(stateList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load states"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  const zones = useMemo(() => {
    const zoneMap = new Map();

    states.forEach((state) => {
      if (!state.zone) {
        return;
      }

      if (typeof state.zone === "object") {
        const zoneId = state.zone._id;
        const zoneName = state.zone.name || "Unknown Zone";

        if (zoneId) {
          zoneMap.set(zoneId, zoneName);
        }
      }
    });

    return Array.from(zoneMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [states]);

  const filteredStates = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return states.filter((state) => {
      const stateName = state.name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        stateName.includes(searchValue);

      const stateZoneId =
        typeof state.zone === "object"
          ? state.zone?._id
          : state.zone;

      const matchesZone =
        zoneFilter === "all" ||
        stateZoneId === zoneFilter;

      return matchesSearch && matchesZone;
    });
  }, [states, search, zoneFilter]);

  const loadStateCities = async (stateId) => {
    try {
      setLoadingCities(true);
      setError("");

      const response = await api.get(
        `/states/${stateId}/cities`
      );

      const cities = response.data?.cities || [];

      setStateCities((current) => ({
        ...current,
        [stateId]: cities
      }));

      setCityCounts((current) => ({
        ...current,
        [stateId]: cities.length
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load cities"
      );
    } finally {
      setLoadingCities(false);
    }
  };

  const toggleState = async (stateId) => {
    if (expandedState === stateId) {
      setExpandedState(null);
      return;
    }

    setExpandedState(stateId);

    if (!stateCities[stateId]) {
      await loadStateCities(stateId);
    }
  };

  const totalCities = Object.values(cityCounts).reduce(
    (total, count) => total + count,
    0
  );

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
              States
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Manage the states and union territories available
              throughout the Wander travel platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/55">
              {states.length} States
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/55">
              {totalCities} Cities Loaded
            </div>

            <button
              type="button"
              onClick={loadStates}
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
              Search states or narrow the list by travel zone.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                Search States
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by state name..."
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
                Travel Zone
              </label>

              <select
                value={zoneFilter}
                onChange={(e) =>
                  setZoneFilter(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-white/25"
              >
                <option value="all">All Zones</option>

                {zones.map(([zoneId, zoneName]) => (
                  <option
                    key={zoneId}
                    value={zoneId}
                  >
                    {zoneName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">
              States Directory
            </p>

            <p className="mt-2 text-sm text-white/45">
              Showing{" "}
              <span className="text-white/80">
                {filteredStates.length}
              </span>{" "}
              of{" "}
              <span className="text-white/80">
                {states.length}
              </span>{" "}
              states
            </p>
          </div>

          {(search || zoneFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setZoneFilter("all");
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
              Loading states...
            </p>
          </div>
        ) : filteredStates.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-24 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-xl text-white/40">
              ⌖
            </div>

            <h2 className="font-serif text-2xl">
              No states found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Try changing your search or zone filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStates.map((state) => {
              const stateId = state._id;

              const zoneName =
                typeof state.zone === "object"
                  ? state.zone?.name
                  : "Unknown Zone";

              const cities =
                stateCities[stateId] || [];

              const isExpanded =
                expandedState === stateId;

              return (
                <div
                  key={stateId}
                  className={`overflow-hidden rounded-3xl border transition ${
                    isExpanded
                      ? "border-white/20 bg-[#171917]"
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleState(stateId)
                    }
                    className="w-full px-5 py-5 text-left transition hover:bg-white/[0.025] sm:px-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-serif text-lg text-white/65">
                          {state.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <h2 className="font-serif text-2xl text-white">
                            {state.name}
                          </h2>

                          <p className="mt-1 text-xs tracking-wide text-white/30">
                            {state.slug}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50">
                          {zoneName || "Unknown Zone"}
                        </div>

                        <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50">
                          {cityCounts[stateId] !==
                          undefined
                            ? `${cityCounts[stateId]} Cities`
                            : "View Cities"}
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/10 px-5 py-6 sm:px-6">
                      {loadingCities &&
                      !stateCities[stateId] ? (
                        <div className="py-10 text-center">
                          <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />

                          <p className="text-sm text-white/40">
                            Loading cities...
                          </p>
                        </div>
                      ) : cities.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-5 py-10 text-center">
                          <p className="text-sm text-white/40">
                            No active cities found for{" "}
                            {state.name}.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin-cities?state=${stateId}`
                              )
                            }
                            className="mt-4 text-xs text-white/50 transition hover:text-white"
                          >
                            Manage Cities →
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                                Cities
                              </p>

                              <p className="mt-2 text-sm text-white/50">
                                {cities.length} active{" "}
                                {cities.length === 1
                                  ? "city"
                                  : "cities"}{" "}
                                in {state.name}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin-cities?state=${stateId}`
                                )
                              }
                              className="self-start text-xs text-white/40 transition hover:text-white sm:self-auto"
                            >
                              Manage Locations →
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {cities.map((city) => {
                              const hasLocation =
                                city.location
                                  ?.latitude !==
                                  undefined &&
                                city.location
                                  ?.longitude !==
                                  undefined;

                              return (
                                <div
                                  key={city._id}
                                  className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 transition hover:border-white/15 hover:bg-black/20"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="font-serif text-lg text-white">
                                      {city.name}
                                    </p>

                                    <span
                                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                        hasLocation
                                          ? "bg-emerald-300/70"
                                          : "bg-white/20"
                                      }`}
                                    />
                                  </div>

                                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3 text-xs">
                                    <span className="text-white/30">
                                      Location
                                    </span>

                                    <span
                                      className={
                                        hasLocation
                                          ? "text-emerald-300/70"
                                          : "text-white/30"
                                      }
                                    >
                                      {hasLocation
                                        ? "Available"
                                        : "Not set"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStates;