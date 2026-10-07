import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const initialFormData = {
  roomNumber: "",
  roomType: "standard",
  price: "",
  maxGuests: "2",
  amenities: "",
  images: "",
  isAvailable: true,
};

const roomTypes = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "family", label: "Family" },
];

const AdminRooms = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId } = useParams();

  const [hotel, setHotel] = useState(location.state?.hotel || null);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  const [loadingHotel, setLoadingHotel] = useState(
    !location.state?.hotel
  );
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const currentHotelId = hotel?._id || hotelId;

  const fetchHotel = useCallback(async () => {
    if (location.state?.hotel) {
      setHotel(location.state.hotel);
      setLoadingHotel(false);
      return;
    }

    if (!hotelId) {
      setError(
        "Hotel ID is missing. Please open room management from the Admin Dashboard."
      );
      setLoadingHotel(false);
      return;
    }

    try {
      setLoadingHotel(true);
      setError("");

      const response = await api.get("/hotels/admin/all");

      const hotelList =
        response.data?.hotels ||
        response.data?.data ||
        [];

      const selectedHotel = hotelList.find(
        (item) =>
          String(item._id) === String(hotelId)
      );

      if (!selectedHotel) {
        setError(
          "Hotel not found. Please check the hotel ID or return to the Admin Dashboard."
        );
        setHotel(null);
        return;
      }

      setHotel(selectedHotel);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load hotel details. Please check your admin login."
      );
      setHotel(null);
    } finally {
      setLoadingHotel(false);
    }
  }, [hotelId, location.state]);

  const fetchRooms = useCallback(async () => {
    if (!currentHotelId) {
      return;
    }

    try {
      setLoadingRooms(true);
      setError("");

      const response = await api.get(
        `/rooms/hotel/${currentHotelId}`
      );

      const roomList =
        response.data?.rooms ||
        response.data?.data ||
        [];

      setRooms(
        Array.isArray(roomList)
          ? roomList
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load rooms for this hotel."
      );
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [currentHotelId]);

  useEffect(() => {
    fetchHotel();
  }, [fetchHotel]);

  useEffect(() => {
    if (currentHotelId) {
      fetchRooms();
    }
  }, [currentHotelId, fetchRooms]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentHotelId) {
      setError("Hotel information is missing.");
      return;
    }

    if (
      !formData.roomNumber.trim() ||
      !formData.roomType
    ) {
      setError(
        "Please enter the room number and select a room type."
      );
      return;
    }

    if (
      !Number.isFinite(
        Number(formData.price)
      ) ||
      Number(formData.price) <= 0 ||
      !Number.isFinite(
        Number(formData.maxGuests)
      ) ||
      Number(formData.maxGuests) < 1
    ) {
      setError(
        "Enter a valid price and maximum guest count."
      );
      return;
    }

    const amenities = formData.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const images = formData.images
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      hotelId: currentHotelId,
      roomNumber:
        formData.roomNumber.trim(),
      roomType: formData.roomType,
      pricePerNight:
        Number(formData.price),
      maxGuests:
        Number(formData.maxGuests),
      amenities,
      images,
      isAvailable:
        formData.isAvailable,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post(
        "/rooms/admin",
        payload
      );

      setSuccess(
        "Room added successfully."
      );

      setFormData(initialFormData);
      setShowForm(false);

      await fetchRooms();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add room. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomId = (room) =>
    room._id || room.id;

  if (loadingHotel) {
    return (
      <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />

            <p className="mt-5 text-sm text-white/45">
              Loading hotel details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#111311] px-5 py-12 text-[#f4f1e8] sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.05] p-7 sm:p-9">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300/60">
              Wander Admin
            </p>

            <h1 className="mt-3 font-serif text-3xl">
              Hotel unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-200/60">
              {error ||
                "The selected hotel could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin-dashboard")
              }
              className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111311] text-[#f4f1e8]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin-hotels")
              }
              className="mb-6 text-sm text-white/40 transition hover:text-white"
            >
              ← Back to Hotels
            </button>

            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/35">
              Hotel Operations
            </p>

            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Rooms
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Manage room types, pricing, capacity and
              availability for this property.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(
                (previous) => !previous
              );
              setError("");
              setSuccess("");
            }}
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            {showForm
              ? "Close Form"
              : "+ Add New Room"}
          </button>
        </div>

        <div className="mb-7 rounded-3xl border border-white/10 bg-[#171917] p-6 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Selected Property
              </p>

              <h2 className="mt-2 font-serif text-3xl text-white">
                {hotel.name || "Hotel"}
              </h2>

              <p className="mt-2 text-sm text-white/45">
                {hotel.city?.name ||
                  hotel.cityName ||
                  "City unavailable"}
              </p>

              <p className="mt-1 text-sm text-white/30">
                {hotel.address ||
                  "Address not available"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/55">
                {rooms.length}{" "}
                {rooms.length === 1
                  ? "Room"
                  : "Rooms"}
              </div>

              <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-2.5 text-sm text-emerald-300/65">
                {
                  rooms.filter(
                    (room) =>
                      room.isAvailable
                  ).length
                }{" "}
                Available
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-300">
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

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {showForm && (
          <section className="mb-9 rounded-3xl border border-white/10 bg-[#171917] p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                New Room
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Add Room
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Add a room that guests can book at{" "}
                {hotel.name}.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="roomNumber"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Room Number
                  </label>

                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="101"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="roomType"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Room Type
                  </label>

                  <select
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-white/30"
                  >
                    {roomTypes.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Price Per Night
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35">
                      ₹
                    </span>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="2500"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="maxGuests"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Maximum Guests
                  </label>

                  <input
                    id="maxGuests"
                    name="maxGuests"
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="amenities"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Amenities
                </label>

                <input
                  id="amenities"
                  name="amenities"
                  type="text"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="WiFi, AC, TV, Breakfast"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/25">
                  Separate amenities with commas.
                </p>
              </div>

              <div>
                <label
                  htmlFor="images"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Room Image URLs
                </label>

                <textarea
                  id="images"
                  name="images"
                  rows="3"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="https://example.com/room1.jpg, https://example.com/room2.jpg"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/25">
                  Optional. Separate multiple URLs with
                  commas.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-black text-black accent-white"
                />

                <span>
                  <span className="block text-sm text-white/80">
                    Room is available
                  </span>

                  <span className="mt-1 block text-xs text-white/30">
                    Guests can book this room.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(
                      initialFormData
                    );
                    setError("");
                  }}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/60 transition hover:border-white/25 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving Room..."
                    : "Save Room"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Room Inventory
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                All Rooms
              </h2>
            </div>

            <button
              type="button"
              onClick={fetchRooms}
              disabled={loadingRooms}
              className="self-start rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/60 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white sm:self-auto"
            >
              {loadingRooms
                ? "Refreshing..."
                : "Refresh Rooms"}
            </button>
          </div>

          {loadingRooms ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-24 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />

              <p className="mt-5 text-sm text-white/40">
                Loading rooms...
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-24 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-xl">
                🛏️
              </div>

              <h3 className="mt-5 font-serif text-2xl">
                No rooms added yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Add the first room for this property
                to make it available for guests.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                + Add First Room
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <article
                  key={getRoomId(room)}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171917] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  {room.images?.[0] ? (
                    <div className="relative h-52 overflow-hidden bg-white/[0.03]">
                      <img
                        src={room.images[0]}
                        alt={
                          room.roomType ||
                          "Hotel room"
                        }
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-black/10 text-5xl">
                      🛏️
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Room {room.roomNumber || "N/A"}
                        </p>

                        <h3 className="mt-1 font-serif text-2xl capitalize text-white">
                          {room.roomType ||
                            "Room"}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[11px] ${
                          room.isAvailable
                            ? "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-300/70"
                            : "border-white/10 bg-white/[0.03] text-white/35"
                        }`}
                      >
                        {room.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="mt-5">
                      <span className="font-serif text-3xl text-white">
                        ₹
                        {Number(
                          room.pricePerNight ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span className="ml-1 text-sm text-white/30">
                        / night
                      </span>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/35">
                          Maximum guests
                        </span>

                        <span className="text-white/70">
                          {room.maxGuests ||
                            1}
                        </span>
                      </div>

                      {Array.isArray(
                        room.amenities
                      ) &&
                        room.amenities.length >
                          0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {room.amenities.map(
                              (
                                amenity,
                                index
                              ) => (
                                <span
                                  key={`${amenity}-${index}`}
                                  className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/45"
                                >
                                  {amenity}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminRooms;