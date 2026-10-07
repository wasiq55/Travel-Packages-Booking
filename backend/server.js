require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const zoneRoutes = require("./routes/zoneRoutes");
const stateRoutes = require("./routes/stateRoutes");
const cityRoutes = require("./routes/cityRoutes");
const placeRoutes = require("./routes/placeRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const adminHotelRoutes = require("./routes/adminHotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const tripRoutes = require("./routes/tripRoutes");

const tripHotelRoutes = require("./routes/tripHotelRoutes");
const transportRoutes = require("./routes/transportRoutes");
const activityRoutes = require("./routes/activityRoutes");
const tripPriceRoutes = require("./routes/tripPriceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const foodRoutes = require("./routes/foodRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(
cors({
origin: "http://localhost:5173",
credentials: true
})
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/admin/hotels", adminHotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/trips", tripRoutes);

app.use("/api/trip-hotels", tripHotelRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/trip-price", tripPriceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/food", foodRoutes);



app.get("/", (req, res) => {
res.json({
success: true,
message: "Travel Platform API is running"
});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});