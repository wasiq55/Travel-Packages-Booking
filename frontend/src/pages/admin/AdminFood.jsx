import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const initialForm = {
  hotelId: "",
  title: "",
  mealType: "breakfast",
  foodType: "veg",
  pricePerPerson: "",
  description: "",
  image: "",
  menuItems: "",
  isAvailable: true,
};

const AdminFood = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedHotel = location.state?.hotel;

  const [hotels, setHotels] = useState([]);
  const [foodPackages, setFoodPackages] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getHotelId = (hotel) => {
    return hotel?._id || hotel?.id;
  };

  const fetchHotels = async () => {
    try {
      const response = await api.get("/hotels/admin/all");

      setHotels(response.data.hotels || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load hotels"
      );
    }
  };

  const fetchFoodPackages = async (hotelId) => {
    if (!hotelId) {
      setFoodPackages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/food/hotel/${hotelId}`
      );

      setFoodPackages(
        response.data.foodPackages || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load food packages"
      );
      setFoodPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHotels = async () => {
      await fetchHotels();

      if (selectedHotel) {
        const hotelId = getHotelId(selectedHotel);

        setForm((previous) => ({
          ...previous,
          hotelId,
        }));

        await fetchFoodPackages(hotelId);
      } else {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (name === "hotelId") {
      fetchFoodPackages(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.hotelId) {
      setError("Please select a hotel.");
      return;
    }

    if (!form.title.trim()) {
      setError(
        "Food package title is required."
      );
      return;
    }

    if (
      form.pricePerPerson === "" ||
      Number(form.pricePerPerson) < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    const menuItems = form.menuItems
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      hotelId: form.hotelId,
      title: form.title.trim(),
      mealType: form.mealType,
      foodType: form.foodType,
      pricePerPerson: Number(
        form.pricePerPerson
      ),
      description:
        form.description.trim(),
      image: form.image.trim(),
      menuItems,
      isAvailable: form.isAvailable,
    };

    try {
      setSaving(true);

      const response = await api.post(
        "/food/admin",
        payload
      );

      setSuccess(
        response.data.message ||
          "Food package added successfully."
      );

      const hotelId = form.hotelId;

      setForm({
        ...initialForm,
        hotelId,
      });

      await fetchFoodPackages(hotelId);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add food package."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (foodId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food package?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/food/${foodId}`
      );

      setSuccess(
        "Food package deleted successfully."
      );

      await fetchFoodPackages(
        form.hotelId
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete food package."
      );
    }
  };

  const getMealLabel = (mealType) => {
    const labels = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      "full-day": "Full Day",
    };

    return labels[mealType] || mealType;
  };

  const getFoodTypeLabel = (foodType) => {
    const labels = {
      veg: "Vegetarian",
      "non-veg": "Non-Vegetarian",
      both: "Veg & Non-Veg",
    };

    return labels[foodType] || foodType;
  };

  const selectedHotelFromList = hotels.find(
    (hotel) =>
      String(getHotelId(hotel)) ===
      String(form.hotelId)
  );

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
              Food & Dining
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Manage breakfast, meals and dining
              packages available at your hotels.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-white/45">
            {foodPackages.length}{" "}
            {foodPackages.length === 1
              ? "Package"
              : "Packages"}
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

        <div className="mb-7 rounded-3xl border border-white/10 bg-[#171917] p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Selected Property
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                {selectedHotelFromList?.name ||
                  selectedHotel?.name ||
                  "Select a Hotel"}
              </h2>

              <p className="mt-2 text-sm text-white/40">
                {selectedHotelFromList?.city?.name ||
                  selectedHotel?.city?.name ||
                  selectedHotelFromList?.cityName ||
                  ""}
              </p>
            </div>

            <div className="w-full lg:w-80">
              <label
                htmlFor="hotelId"
                className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/30"
              >
                Hotel
              </label>

              <select
                id="hotelId"
                name="hotelId"
                value={form.hotelId}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option
                  value=""
                  className="bg-[#171917]"
                >
                  Select a hotel
                </option>

                {hotels.map((hotel) => (
                  <option
                    key={getHotelId(hotel)}
                    value={getHotelId(hotel)}
                    className="bg-[#171917]"
                  >
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[390px_1fr]">
          <section className="h-fit rounded-3xl border border-white/10 bg-[#171917] p-6 sm:p-7">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Dining Setup
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Add Food Package
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Create a dining option that guests
                can add to their trip.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Package Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Breakfast Buffet"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mealType"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Meal Type
                  </label>

                  <select
                    id="mealType"
                    name="mealType"
                    value={form.mealType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3.5 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option
                      value="breakfast"
                      className="bg-[#171917]"
                    >
                      Breakfast
                    </option>

                    <option
                      value="lunch"
                      className="bg-[#171917]"
                    >
                      Lunch
                    </option>

                    <option
                      value="dinner"
                      className="bg-[#171917]"
                    >
                      Dinner
                    </option>

                    <option
                      value="full-day"
                      className="bg-[#171917]"
                    >
                      Full Day
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="foodType"
                    className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                  >
                    Food Type
                  </label>

                  <select
                    id="foodType"
                    name="foodType"
                    value={form.foodType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3.5 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option
                      value="veg"
                      className="bg-[#171917]"
                    >
                      Veg
                    </option>

                    <option
                      value="non-veg"
                      className="bg-[#171917]"
                    >
                      Non-Veg
                    </option>

                    <option
                      value="both"
                      className="bg-[#171917]"
                    >
                      Both
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="pricePerPerson"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Price Per Person
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35">
                    ₹
                  </span>

                  <input
                    id="pricePerPerson"
                    type="number"
                    name="pricePerPerson"
                    value={
                      form.pricePerPerson
                    }
                    onChange={handleChange}
                    placeholder="250"
                    min="0"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Image URL
                </label>

                <input
                  id="image"
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/food.jpg"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the dining package..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              <div>
                <label
                  htmlFor="menuItems"
                  className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35"
                >
                  Menu Items
                </label>

                <textarea
                  id="menuItems"
                  name="menuItems"
                  value={form.menuItems}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tea, Coffee, Bread, Fruits"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/25">
                  Separate menu items with commas.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-black accent-white"
                />

                <span>
                  <span className="block text-sm text-white/80">
                    Package is available
                  </span>

                  <span className="mt-1 block text-xs text-white/30">
                    Guests can select this dining
                    package.
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding Package..."
                  : "Add Food Package"}
              </button>
            </form>
          </section>

          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                  Dining Inventory
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Food Packages
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  {selectedHotelFromList?.name ||
                    selectedHotel?.name
                    ? `Dining options for ${
                        selectedHotelFromList?.name ||
                        selectedHotel?.name
                      }`
                    : "Select a hotel to view its packages."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchFoodPackages(
                    form.hotelId
                  )
                }
                disabled={
                  loading ||
                  !form.hotelId
                }
                className="self-start rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/55 transition hover:border-white/25 hover:text-white disabled:opacity-40 sm:self-auto"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {!form.hotelId ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 text-2xl">
                    🍽️
                  </div>

                  <h3 className="mt-5 font-serif text-2xl">
                    Select a Hotel
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/35">
                    Choose a hotel above to see and
                    manage its food packages.
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />

                  <p className="mt-5 text-sm text-white/40">
                    Loading food packages...
                  </p>
                </div>
              </div>
            ) : foodPackages.length === 0 ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 text-2xl">
                    🍴
                  </div>

                  <h3 className="mt-5 font-serif text-2xl">
                    No Food Packages
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/35">
                    Add the first dining package for
                    this hotel using the form.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {foodPackages.map(
                  (food) => (
                    <article
                      key={food._id}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171917] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                    >
                      <div className="relative h-52 overflow-hidden bg-black/10">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl">
                            🍽️
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
                          {getMealLabel(
                            food.mealType
                          )}
                        </span>

                        <span
                          className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-[11px] backdrop-blur-sm ${
                            food.isAvailable
                              ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300/80"
                              : "border-white/10 bg-black/30 text-white/40"
                          }`}
                        >
                          {food.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-serif text-2xl text-white">
                              {food.title}
                            </h3>

                            <p className="mt-1 text-xs text-white/35">
                              {getFoodTypeLabel(
                                food.foodType
                              )}
                            </p>
                          </div>

                          <div className="whitespace-nowrap text-right">
                            <p className="font-serif text-2xl text-white">
                              ₹
                              {Number(
                                food.pricePerPerson ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                              Per Person
                            </p>
                          </div>
                        </div>

                        {food.description && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/40">
                            {food.description}
                          </p>
                        )}

                        {food.menuItems?.length >
                          0 && (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/25">
                              Menu
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {food.menuItems.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <span
                                    key={`${food._id}-${index}`}
                                    className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/45"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              food._id
                            )
                          }
                          className="mt-5 w-full rounded-full border border-red-400/20 px-4 py-2.5 text-xs font-medium text-red-300/70 transition hover:border-red-400/40 hover:bg-red-400/[0.06] hover:text-red-300"
                        >
                          Delete Package
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminFood;