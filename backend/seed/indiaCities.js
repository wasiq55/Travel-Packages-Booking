const mongoose = require("mongoose");
const State = require("../models/State");
const City = require("../models/City");
require("dotenv").config();

const citiesByState = {
    Odisha: [
        "Bhubaneswar",
        "Cuttack",
        "Puri",
        "Rourkela",
        "Sambalpur",
        "Berhampur",
        "Konark",
        "Balasore"
    ],
    Bihar: [
        "Patna",
        "Gaya",
        "Muzaffarpur",
        "Bhagalpur",
        "Darbhanga",
        "Nalanda",
        "Aurangabad"
    ],
    Jharkhand: [
        "Ranchi",
        "Jamshedpur",
        "Dhanbad",
        "Bokaro",
        "Deoghar"
    ],
    "West Bengal": [
        "Kolkata",
        "Darjeeling",
        "Siliguri",
        "Durgapur",
        "Howrah"
    ],
    "Uttar Pradesh": [
        "Lucknow",
        "Agra",
        "Varanasi",
        "Prayagraj",
        "Kanpur",
        "Noida",
        "Ayodhya",
        "Mathura"
    ],
    Rajasthan: [
        "Jaipur",
        "Udaipur",
        "Jodhpur",
        "Jaisalmer",
        "Kota",
        "Ajmer"
    ],
    Maharashtra: [
        "Mumbai",
        "Pune",
        "Nagpur",
        "Nashik",
        "Aurangabad",
        "Kolhapur"
    ],
    Gujarat: [
        "Ahmedabad",
        "Surat",
        "Vadodara",
        "Rajkot",
        "Dwarka",
        "Gandhinagar"
    ],
    Karnataka: [
        "Bengaluru",
        "Mysuru",
        "Mangaluru",
        "Hubballi",
        "Hampi",
        "Coorg"
    ],
    Kerala: [
        "Kochi",
        "Thiruvananthapuram",
        "Kozhikode",
        "Munnar",
        "Alappuzha",
        "Thrissur"
    ],
    "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Ooty",
        "Salem",
        "Tiruchirappalli"
    ],
    Telangana: [
        "Hyderabad",
        "Warangal",
        "Nizamabad",
        "Karimnagar"
    ],
    "Andhra Pradesh": [
        "Visakhapatnam",
        "Vijayawada",
        "Tirupati",
        "Guntur",
        "Nellore"
    ],
    Goa: [
        "Panaji",
        "Margao",
        "Vasco da Gama",
        "Calangute"
    ],
    Punjab: [
        "Amritsar",
        "Ludhiana",
        "Jalandhar",
        "Patiala"
    ],
    Haryana: [
        "Gurugram",
        "Faridabad",
        "Panipat",
        "Ambala"
    ],
    "Himachal Pradesh": [
        "Shimla",
        "Manali",
        "Dharamshala",
        "Kullu"
    ],
    Uttarakhand: [
        "Dehradun",
        "Rishikesh",
        "Haridwar",
        "Nainital",
        "Mussoorie"
    ],
    Delhi: [
        "New Delhi",
        "Delhi"
    ],
    Assam: [
        "Guwahati",
        "Dibrugarh",
        "Jorhat",
        "Silchar"
    ],
    "Arunachal Pradesh": [
        "Itanagar",
        "Tawang",
        "Pasighat"
    ],
    Meghalaya: [
        "Shillong",
        "Cherrapunji",
        "Tura"
    ],
    Sikkim: [
        "Gangtok",
        "Namchi",
        "Pelling"
    ],
    "Jammu and Kashmir": [
        "Srinagar",
        "Jammu",
        "Gulmarg",
        "Pahalgam",
        "Sonamarg",
        "Anantnag",
        "Doda",
        "Katra"
    ],
};

const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

const getCityImage = (cityName) => {
    return `https://placehold.co/800x600?text=${encodeURIComponent(cityName)}`;
};

const seedCities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        for (const [stateName, cityNames] of Object.entries(citiesByState)) {
            const state = await State.findOne({
                name: {
                    $regex: `^${stateName.trim()}$`,
                    $options: "i"
                }
            });

            if (!state) {
                console.log(`State not found: ${stateName}`);
                continue;
            }

            console.log(`Processing state: ${state.name}`);

            for (const cityName of cityNames) {
                await City.updateOne(
                    {
                        name: cityName,
                        state: state._id
                    },
                    {
                        $set: {
                            name: cityName,
                            slug: createSlug(cityName),
                            state: state._id,
                            image: getCityImage(cityName),
                            description: `${cityName} is a popular tourist destination in India.`,
                            isPopular: true,
                            isActive: true
                        }
                    },
                    {
                        upsert: true
                    }
                );

                console.log(`City updated: ${cityName}`);
            }

            console.log(`Cities added for ${state.name}`);
        }

        console.log("Cities seeded successfully");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error.message);

        await mongoose.connection.close();
        process.exit(1);
    }
};

seedCities();