
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const City = require("../models/City");
const State = require("../models/State");

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const getCoordinates = async (cityName, stateName) => {
    const query = `${cityName}, ${stateName}, India`;

    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: query,
                    format: "json",
                    limit: 1,
                    countrycodes: "in"
                },
                headers: {
                    "User-Agent": "TravelPlatform/1.0"
                },
                timeout: 15000
            }
        );

        if (!response.data || response.data.length === 0) {
            return null;
        }

        const latitude = Number(response.data[0].lat);
        const longitude = Number(response.data[0].lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
        }

        return { latitude, longitude };
    } catch (error) {
        console.error(`Search error for ${query}:`, error.message);
        return null;
    }
};

const updateCities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const cities = await City.find()
            .populate("state", "name")
            .sort({ name: 1 });

        console.log(`Found ${cities.length} cities`);

        let updated = 0;
        let skipped = 0;
        let notFound = 0;

        for (const city of cities) {
            const latitude = city.location?.latitude;
            const longitude = city.location?.longitude;

            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
            ) {
                console.log(`SKIPPED: ${city.name} already has coordinates`);
                skipped++;
                continue;
            }

            const stateName = city.state?.name;

            if (!stateName) {
                console.log(`NO STATE FOUND: ${city.name}`);
                notFound++;
                continue;
            }

            console.log(`Searching: ${city.name}, ${stateName}`);

            const coordinates = await getCoordinates(city.name, stateName);

            if (!coordinates) {
                console.log(`NOT FOUND: ${city.name}, ${stateName}`);
                notFound++;
                await sleep(1000);
                continue;
            }

            await City.updateOne(
                { _id: city._id },
                {
                    $set: {
                        "location.latitude": coordinates.latitude,
                        "location.longitude": coordinates.longitude
                    }
                }
            );

            console.log(
                `UPDATED: ${city.name} -> ${coordinates.latitude}, ${coordinates.longitude}`
            );

            updated++;

            await sleep(1000);
        }

        console.log("\n========== RESULT ==========");
        console.log(`Total cities: ${cities.length}`);
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Not found: ${notFound}`);
        console.log("============================");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("MongoDB connection closed");
        }
    }
};

updateCities();