import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddHotel = () => {
    const navigate = useNavigate();

    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        city: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        amenities: "",
        checkInTime: "12:00",
        checkOutTime: "11:00"
    });

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setCitiesLoading(true);

                const response = await api.get("/cities");

                setCities(response.data.cities || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load cities"
                );
            } finally {
                setCitiesLoading(false);
            }
        };

        fetchCities();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const hotelData = {
                ...formData,
                amenities: formData.amenities
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            };

            const response = await api.post("/hotels", hotelData);

            setMessage(
                response.data.message ||
                "Hotel added successfully"
            );

            setFormData({
                name: "",
                city: "",
                description: "",
                address: "",
                phone: "",
                email: "",
                amenities: "",
                checkInTime: "12:00",
                checkOutTime: "11:00"
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to add hotel"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111311] px-5 py-8 text-[#f4f1e8] sm:px-8 lg:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 border-b border-white/10 pb-8">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                        className="mb-6 text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                    >
                        ← Admin Dashboard
                    </button>

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
                                Wander / Hotels
                            </p>

                            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                                Add New Hotel
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                                Add a property to Wander and connect it
                                with its destination city.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/35">
                            New Property
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                        <p className="text-sm text-emerald-300">
                            {message}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                Property Information
                            </p>

                            <h2 className="mt-2 font-serif text-2xl">
                                Basic Details
                            </h2>

                            <p className="mt-2 text-sm text-white/40">
                                Enter the main information about the
                                hotel.
                            </p>
                        </div>

                        <div className="space-y-7 px-6 py-7 sm:px-8">
                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Hotel Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter hotel name"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    City
                                </label>

                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    disabled={citiesLoading}
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option
                                        value=""
                                        className="bg-[#171917]"
                                    >
                                        {citiesLoading
                                            ? "Loading cities..."
                                            : "Select a city"}
                                    </option>

                                    {cities.map((city) => (
                                        <option
                                            key={city._id}
                                            value={city._id}
                                            className="bg-[#171917]"
                                        >
                                            {city.name}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-2 text-xs text-white/25">
                                    Select the destination city where
                                    this hotel is located.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the hotel, its atmosphere and main features..."
                                    rows="5"
                                    className="w-full resize-none rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter complete hotel address"
                                    rows="3"
                                    required
                                    className="w-full resize-none rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                Contact
                            </p>

                            <h2 className="mt-2 font-serif text-2xl">
                                Contact Information
                            </h2>

                            <p className="mt-2 text-sm text-white/40">
                                Add contact details for the property.
                            </p>
                        </div>

                        <div className="grid gap-7 px-6 py-7 md:grid-cols-2 sm:px-8">
                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter hotel email"
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#171917]">
                        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                Hotel Experience
                            </p>

                            <h2 className="mt-2 font-serif text-2xl">
                                Amenities & Timing
                            </h2>

                            <p className="mt-2 text-sm text-white/40">
                                Define the facilities and standard
                                check-in and check-out times.
                            </p>
                        </div>

                        <div className="space-y-7 px-6 py-7 sm:px-8">
                            <div>
                                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                    Amenities
                                </label>

                                <input
                                    type="text"
                                    name="amenities"
                                    value={formData.amenities}
                                    onChange={handleChange}
                                    placeholder="WiFi, Parking, Restaurant, Pool"
                                    className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"
                                />

                                <p className="mt-2 text-xs text-white/25">
                                    Separate each amenity with a comma.
                                </p>
                            </div>

                            <div className="grid gap-7 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                        Check-in Time
                                    </label>

                                    <input
                                        type="time"
                                        name="checkInTime"
                                        value={formData.checkInTime}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none focus:border-white/25"
                                    />

                                    <p className="mt-2 text-xs text-white/25">
                                        Default: 12:00 PM
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/35">
                                        Check-out Time
                                    </label>

                                    <input
                                        type="time"
                                        name="checkOutTime"
                                        value={formData.checkOutTime}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-white/10 bg-[#111311] px-4 py-3.5 text-sm text-white outline-none focus:border-white/25"
                                    />

                                    <p className="mt-2 text-xs text-white/25">
                                        Default: 11:00 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin-hotels")
                            }
                            className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/55 transition hover:border-white/20 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || citiesLoading}
                            className="rounded-full bg-[#f4f1e8] px-7 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Adding Hotel..."
                                : "Add Hotel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHotel;