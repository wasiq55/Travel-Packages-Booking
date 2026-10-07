import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import TripBuilder from "./pages/trip-builder/TripBuilder";
import Destinations from "./pages/Destinations";
import HotelDetails from "./pages/trip-builder/HotelDetails";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Profile from "./pages/Profile";
import MyTrip from "./pages/MyTrip";
import Hotels from "./pages/Hotels";
import HotelBooking from "./pages/HotelBooking";
import HotelPayment from "./pages/HotelPayment";
import HotelConfirmation from "./pages/HotelConfirmation";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminFood from "./pages/admin/AdminFood";
import AdminHotelManagement from "./pages/admin/AdminHotelManagement";
import AddHotel from "./pages/admin/AddHotel";
import AdminCities from "./pages/admin/AdminCities";
import AdminStates from "./pages/admin/AdminStates";
import AdminPlaces from "./pages/admin/AdminPlaces";

import { TripBuilderProvider } from "./context/TripBuilderContext";

const App = () => {
  return (
    <TripBuilderProvider>
      <Navbar />

      <div className="min-h-screen bg-[#111311]">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/destinations"
            element={<Destinations />}
          />

          <Route
            path="/trip-builder"
            element={<TripBuilder />}
          />

          <Route
            path="/hotel/:hotelId"
            element={<HotelDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/my-trips"
            element={<MyTrip />}
          />

          <Route path="/hotels" element={<Hotels />} />

          <Route
            path="/hotel-booking"
            element={<HotelBooking />}
          />

          <Route path="/hotel-payment" element={<HotelPayment />} />
          <Route
            path="/hotel-confirmation"
            element={<HotelConfirmation />}
          />

          <Route
            path="/hotel-login"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">
                  Hotel Login Page
                </h1>
              </div>
            }
          />

          <Route
            path="/hotel-register"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">
                  Hotel Register Page
                </h1>
              </div>
            }
          />

          <Route
            path="/admin-login"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">
                  Admin Login Page
                </h1>
              </div>
            }
          />

          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin-hotels"
            element={<AdminHotelManagement />}
          />

          <Route
            path="/admin-hotels/add"
            element={<AddHotel />}
          />

          <Route
            path="/admin-rooms/:hotelId"
            element={<AdminRooms />}
          />

          <Route
            path="/admin-food"
            element={<AdminFood />}
          />

          <Route
            path="/admin-states"
            element={<AdminStates />}
          />

          <Route
            path="/admin-cities"
            element={<AdminCities />}
          />

          <Route
            path="/admin-places"
            element={<AdminPlaces />}
          />

          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-[#111311] text-[#f4f1e8]">
                <div className="text-center">
                  <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/35">
                    Wander
                  </p>

                  <h1 className="font-serif text-5xl">
                    404
                  </h1>

                  <p className="mt-3 text-sm text-white/45">
                    Page not found
                  </p>
                </div>
              </div>
            }
          />
        </Routes>

        <Footer />
      </div>
    </TripBuilderProvider>
  );
};

export default App;