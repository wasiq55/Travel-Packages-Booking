const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");

const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");

dotenv.config();

const zoneName = "West India";

const data = {
    Maharashtra: {
        Mumbai: ["Gateway of India", "Marine Drive", "Elephanta Caves"],
        Pune: ["Shaniwar Wada", "Aga Khan Palace", "Sinhagad Fort"],
        Nashik: ["Trimbakeshwar Temple", "Sula Vineyards", "Pandavleni Caves"],
        Aurangabad: ["Bibi Ka Maqbara", "Ajanta Caves", "Ellora Caves"],
        Nagpur: ["Deekshabhoomi", "Sitabardi Fort", "Ambazari Lake"],
        Kolhapur: ["Mahalaxmi Temple", "Panhala Fort", "Rankala Lake"],
        Lonavala: ["Tiger Point", "Bhushi Dam", "Karla Caves"],
        Mahabaleshwar: ["Venna Lake", "Arthur's Seat", "Pratapgad Fort"],
        Ratnagiri: ["Ratnadurg Fort", "Ganpatipule Beach", "Thibaw Palace"]
    },

    Gujarat: {
        Ahmedabad: ["Sabarmati Ashram", "Kankaria Lake", "Adalaj Stepwell"],
        Surat: ["Dumas Beach", "Dutch Garden", "Sarthana Nature Park"],
        Vadodara: ["Laxmi Vilas Palace", "Sayaji Garden", "Baroda Museum"],
        Rajkot: ["Kaba Gandhi No Delo", "Rotary Midtown Dolls Museum", "Aji Dam"],
        Bhuj: ["Prag Mahal", "Aina Mahal", "Hamirsar Lake"],
        Dwarka: ["Dwarkadhish Temple", "Bet Dwarka", "Rukmini Devi Temple"],
        Somnath: ["Somnath Temple", "Triveni Sangam", "Bhalka Tirth"],
        Junagadh: ["Uparkot Fort", "Girnar Hill", "Mahabat Maqbara"],
        "Statue of Unity": ["Statue of Unity", "Valley of Flowers", "Sardar Sarovar Dam"]
    },

    Goa: {
        Panaji: ["Basilica of Bom Jesus", "Dona Paula", "Miramar Beach"],
        Calangute: ["Calangute Beach", "Baga Beach", "Calangute Market"],
        Margao: ["Colva Beach", "Margao Municipal Garden", "Our Lady of Mercy Church"],
        Vasco: ["Bogmallo Beach", "Naval Aviation Museum", "Mormugao Fort"],
        Mapusa: ["Mapusa Market", "Anjuna Beach", "Chapora Fort"]
    },

    Rajasthan: {
        Jaipur: ["Amber Fort", "Hawa Mahal", "City Palace"],
        Udaipur: ["Lake Pichola", "City Palace", "Fateh Sagar Lake"],
        Jodhpur: ["Mehrangarh Fort", "Umaid Bhawan Palace", "Jaswant Thada"],
        Jaisalmer: ["Jaisalmer Fort", "Sam Sand Dunes", "Patwon Ki Haveli"],
        Pushkar: ["Pushkar Lake", "Brahma Temple", "Savitri Temple"],
        Ajmer: ["Ajmer Sharif Dargah", "Ana Sagar Lake", "Adhai Din Ka Jhonpra"],
        Bikaner: ["Junagarh Fort", "Lalgarh Palace", "Karni Mata Temple"],
        "Mount Abu": ["Nakki Lake", "Dilwara Temples", "Guru Shikhar"],
        Kota: ["Seven Wonders Park", "Kishore Sagar Lake", "City Palace"]
    },

    "Dadra and Nagar Haveli and Daman and Diu": {
        Silvassa: ["Vanganga Lake Garden", "Tribal Museum", "Dudhni Waterfalls"],
        Daman: ["Devka Beach", "Daman Fort", "Jampore Beach"],
        Diu: ["Diu Fort", "Nagoa Beach", "St Paul's Church"]
    }
};

const getPlaceImage = (placeName, cityName) => {
    const query = encodeURIComponent(`${placeName} ${cityName} India`);
    return `https://source.unsplash.com/800x600/?${query}`;
};

const seedWestIndia = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const zone = await Zone.findOne({
            name: zoneName
        });

        if (!zone) {
            throw new Error(`Zone not found: ${zoneName}`);
        }

        for (const [stateName, cities] of Object.entries(data)) {
            const state = await State.findOne({
                name: stateName,
                zone: zone._id
            });

            if (!state) {
                console.log(`State not found: ${stateName}`);
                continue;
            }

            for (const [cityName, places] of Object.entries(cities)) {
                let city = await City.findOne({
                    name: cityName,
                    state: state._id
                });

                if (!city) {
                    city = await City.create({
                        name: cityName,
                        slug: slugify(cityName, {
                            lower: true
                        }),
                        state: state._id,
                        description: `${cityName} is a popular destination in ${stateName}.`,
                        isPopular: true,
                        isActive: true
                    });
                }

                for (const placeName of places) {
                    const existingPlace = await Place.findOne({
                        name: placeName,
                        city: city._id
                    });

                    await Place.updateOne(
                        {
                            name: placeName,
                            city: city._id
                        },
                        {
                            $set: {
                                name: placeName,
                                slug: slugify(placeName, {
                                    lower: true
                                }),
                                city: city._id,
                                description: `${placeName} is a popular tourist attraction in ${cityName}, ${stateName}.`,
                                image: existingPlace?.image || getPlaceImage(placeName, cityName),
                                entryFee: 0,
                                visitingHours: "06:00 AM - 08:00 PM",
                                bestTimeToVisit: "October to March",
                                isPopular: true,
                                isActive: true
                            }
                        },
                        {
                            upsert: true
                        }
                    );

                    console.log(
                        `Seeded: ${stateName} > ${cityName} > ${placeName}`
                    );
                }
            }
        }

        console.log("West India places seeded successfully");
    } catch (error) {
        console.error("West India seeder error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedWestIndia();