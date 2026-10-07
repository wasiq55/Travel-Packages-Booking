import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminCities = () => {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const [editingCity, setEditingCity] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const loadCities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cities");

      setCities(response.data?.cities || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load cities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const states = useMemo(() => {
    const stateMap = new Map();

    cities.forEach((city) => {
      if (city.state?._id && city.state?.name) {
        stateMap.set(city.state._id, city.state.name);
      }
    });

    return Array.from(stateMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const cityName = city.name?.toLowerCase() || "";
      const stateName = city.state?.name?.toLowerCase() || "";
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        cityName.includes(searchValue) ||
        stateName.includes(searchValue);

      const matchesState =
        stateFilter === "all" ||
        city.state?._id === stateFilter;

      return matchesSearch && matchesState;
    });
  }, [cities, search, stateFilter]);

  const openEdit = (city) => {
    setEditingCity(city);
    setLatitude(
      city.location?.latitude !== undefined &&
        city.location?.latitude !== null
        ? String(city.location.latitude)
        : ""
    );
    setLongitude(
      city.location?.longitude !== undefined &&
        city.location?.longitude !== null
        ? String(city.location.longitude)
        : ""
    );
    setError("");
    setSuccess("");
  };

  const closeEdit = () => {
    if (saving) {
      return;
    }

    setEditingCity(null);
    setLatitude("");
    setLongitude("");
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();

    if (!editingCity) {
      return;
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (
      latitude.trim() === "" ||
      longitude.trim() === ""
    ) {
      setError("Latitude and longitude are required");
      return;
    }

    if (
      !Number.isFinite(latitudeNumber) ||
      !Number.isFinite(longitudeNumber)
    ) {
      setError("Latitude and longitude must be valid numbers");
      return;
    }

    if (
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/cities/${editingCity._id}/location`,
        {
          latitude: latitudeNumber,
          longitude: longitudeNumber
        }
      );

      const updatedCity = response.data?.city;

      if (updatedCity) {
        setCities((currentCities) =>
          currentCities.map((city) =>
            city._id === updatedCity._id
              ? {
                  ...city,
                  ...updatedCity
                }
              : city
          )
        );
      } else {
        setCities((currentCities) =>
          currentCities.map((city) =>
            city._id === editingCity._id
              ? {
                  ...city,
                  location: {
                    ...city.location,
                    latitude: latitudeNumber,
                    longitude: longitudeNumber
                  }
                }
              : city
          )
        );
      }

      setSuccess(
        `${editingCity.name} location updated successfully`
      );

      setEditingCity(null);
      setLatitude("");
      setLongitude("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update city location"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="mb-5 text-sm text-white/45 transition hover:text-white"
            >
              ← Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-white/40">
              Wander Admin
            </p>

            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Cities
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Manage city information and update the geographical
              coordinates used across Wander.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60">
              {cities.length} Cities
            </div>

            <button
              type="button"
              onClick={loadCities}
              disabled={loading}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {error && !editingCity && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-7 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city or state..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
              />
            </div>

            <div className="lg:w-64">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                State
              </label>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#171917] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
              >
                <option value="all">All States</option>

                {states.map(([stateId, stateName]) => (
                  <option key={stateId} value={stateId}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/45">
              Showing{" "}
              <span className="text-white/80">
                {filteredCities.length}
              </span>{" "}
              of{" "}
              <span className="text-white/80">
                {cities.length}
              </span>{" "}
              cities
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
            <p className="text-sm text-white/45">
              Loading cities...
            </p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="mb-4 text-4xl">⌖</div>

            <h2 className="font-serif text-2xl">
              No cities found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Try changing your search or state filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="hidden border-b border-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-white/30 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:gap-6">
              <div>City</div>
              <div>State</div>
              <div>Latitude</div>
              <div>Longitude</div>
              <div>Action</div>
            </div>

            <div>
              {filteredCities.map((city) => {
                const cityLatitude =
                  city.location?.latitude;

                const cityLongitude =
                  city.location?.longitude;

                return (
                  <div
                    key={city._id}
                    className="border-b border-white/10 px-5 py-5 last:border-b-0 sm:px-6 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-6"
                  >
                    <div className="mb-4 lg:mb-0">
                      <p className="font-serif text-xl text-white">
                        {city.name}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {city.slug || city._id}
                      </p>
                    </div>

                    <div className="mb-4 lg:mb-0">
                      <p className="text-sm text-white/70">
                        {city.state?.name || "Unknown State"}
                      </p>
                    </div>

                    <div className="mb-4 lg:mb-0">
                      <p className="text-sm text-white/60">
                        {cityLatitude !== undefined &&
                        cityLatitude !== null
                          ? cityLatitude
                          : "Not set"}
                      </p>
                    </div>

                    <div className="mb-5 lg:mb-0">
                      <p className="text-sm text-white/60">
                        {cityLongitude !== undefined &&
                        cityLongitude !== null
                          ? cityLongitude
                          : "Not set"}
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => openEdit(city)}
                        className="w-full rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/30 hover:bg-white hover:text-black lg:w-auto"
                      >
                        Edit Location
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {editingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#171917] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">
                  City Location
                </p>

                <h2 className="font-serif text-3xl text-white">
                  {editingCity.name}
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  {editingCity.state?.name || "Unknown State"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveLocation}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={latitude}
                    onChange={(e) =>
                      setLatitude(e.target.value)
                    }
                    placeholder="20.2961"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                  />

                  <p className="mt-2 text-xs text-white/25">
                    Range: -90 to 90
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(e) =>
                      setLongitude(e.target.value)
                    }
                    placeholder="85.8245"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                  />

                  <p className="mt-2 text-xs text-white/25">
                    Range: -180 to 180
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCities;