const mongoose = require("mongoose");
const Zone = require("../models/Zone");
const State = require("../models/State");
require("dotenv").config();

const statesByZone = {
    "north-india": [
        "Punjab",
        "Haryana",
        "Himachal Pradesh",
        "Uttarakhand",
        "Uttar Pradesh",
        "Rajasthan",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Chandigarh"
    ],
    "south-india": [
        "Andhra Pradesh",
        "Telangana",
        "Karnataka",
        "Kerala",
        "Tamil Nadu",
        "Goa",
        "Puducherry",
        "Lakshadweep",
        "Andaman and Nicobar Islands"
    ],
    "east-india": [
        "Odisha",
        "West Bengal",
        "Bihar",
        "Jharkhand"
    ],
    "west-india": [
        "Maharashtra",
        "Gujarat",
        "Madhya Pradesh",
        "Chhattisgarh",
        "Dadra and Nagar Haveli and Daman and Diu"
    ],
    "northeast-india": [
        "Assam",
        "Arunachal Pradesh",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Tripura",
        "Sikkim"
    ]
};

const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/ and /g, "-")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

const seedStates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const [zoneSlug, stateNames] of Object.entries(statesByZone)) {
            const zone = await Zone.findOne({
                slug: zoneSlug
            });

            if (!zone) {
                console.log(`Zone not found: ${zoneSlug}`);
                continue;
            }

            for (const name of stateNames) {
                await State.updateOne(
                    {
                        name,
                        zone: zone._id
                    },
                    {
                        $set: {
                            name,
                            slug: createSlug(name),
                            zone: zone._id,
                            isActive: true
                        }
                    },
                    {
                        upsert: true
                    }
                );
            }
        }

        console.log("States seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

seedStates();