const mongoose = require("mongoose");
const City = require("../models/City");
const Place = require("../models/Place");
require("dotenv").config();

const placesByCity = {
    Bhubaneswar: [
        {
            name: "Lingaraj Temple",
            description: "Ancient Hindu temple and famous spiritual destination",
            entryFee: 0
        },
        {
            name: "Udayagiri and Khandagiri Caves",
            description: "Historic rock-cut caves with ancient carvings",
            entryFee: 25
        },
        {
            name: "Dhauli Shanti Stupa",
            description: "Peace pagoda and historic Buddhist destination",
            entryFee: 0
        },
        {
            name: "Nandankanan Zoological Park",
            description: "Popular zoological park and wildlife destination",
            entryFee: 50
        }
    ],

    Cuttack: [
        {
            name: "Barabati Fort",
            description: "Historic fort located in Cuttack",
            entryFee: 20
        },
        {
            name: "Cuttack Chandi Temple",
            description: "Famous Hindu temple",
            entryFee: 0
        },
        {
            name: "Netaji Birth Place Museum",
            description: "Museum dedicated to Subhas Chandra Bose",
            entryFee: 10
        }
    ],

    Puri: [
        {
            name: "Jagannath Temple",
            description: "Famous Hindu temple in Puri",
            entryFee: 0
        },
        {
            name: "Puri Beach",
            description: "Popular beach and tourist destination",
            entryFee: 0
        },
        {
            name: "Gundicha Temple",
            description: "Important temple associated with Lord Jagannath",
            entryFee: 0
        }
    ],

    Aurangabad: [
        {
            name: "Deo Sun Temple",
            description: "Famous Sun Temple in Aurangabad, Bihar",
            entryFee: 0
        },
        {
            name: "Umga Temple",
            description: "Historic religious destination",
            entryFee: 0
        }
    ],

    Patna: [
        {
            name: "Golghar",
            description: "Historic granary and popular landmark",
            entryFee: 0
        },
        {
            name: "Patna Museum",
            description: "Museum showcasing historical artifacts",
            entryFee: 20
        },
        {
            name: "Buddha Smriti Park",
            description: "Peaceful park dedicated to Buddhist heritage",
            entryFee: 0
        }
    ],

    Mumbai: [
        {
            name: "Gateway of India",
            description: "Iconic monument overlooking the Arabian Sea",
            entryFee: 0
        },
        {
            name: "Marine Drive",
            description: "Famous seaside promenade",
            entryFee: 0
        },
        {
            name: "Elephanta Caves",
            description: "Historic rock-cut cave complex",
            entryFee: 40
        }
    ],

    Bengaluru: [
        {
            name: "Lalbagh Botanical Garden",
            description: "Beautiful botanical garden",
            entryFee: 30
        },
        {
            name: "Bangalore Palace",
            description: "Historic palace and tourist attraction",
            entryFee: 250
        },
        {
            name: "Cubbon Park",
            description: "Popular green space in Bengaluru",
            entryFee: 0
        }
    ],

    Jaipur: [
        {
            name: "Amber Fort",
            description: "Historic fort and architectural landmark",
            entryFee: 100
        },
        {
            name: "Hawa Mahal",
            description: "Iconic palace with unique architecture",
            entryFee: 50
        },
        {
            name: "City Palace",
            description: "Historic palace complex",
            entryFee: 200
        }
    ],

    "New Delhi": [
        {
            name: "India Gate",
            description: "Famous war memorial",
            entryFee: 0
        },
        {
            name: "Qutub Minar",
            description: "Historic UNESCO World Heritage monument",
            entryFee: 40
        },
        {
            name: "Red Fort",
            description: "Historic Mughal-era fort",
            entryFee: 35
        }
    ],

    Hyderabad: [
        {
            name: "Charminar",
            description: "Historic monument and city landmark",
            entryFee: 25
        },
        {
            name: "Golconda Fort",
            description: "Historic fort with impressive architecture",
            entryFee: 25
        },
        {
            name: "Hussain Sagar Lake",
            description: "Popular lake and tourist destination",
            entryFee: 0
        }
    ],

    Kochi: [
        {
            name: "Fort Kochi",
            description: "Historic coastal area",
            entryFee: 0
        },
        {
            name: "Chinese Fishing Nets",
            description: "Traditional fishing nets and tourist attraction",
            entryFee: 0
        },
        {
            name: "Mattancherry Palace",
            description: "Historic palace and museum",
            entryFee: 20
        }
    ]
};

const seedPlaces = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const [cityName, places] of Object.entries(placesByCity)) {
            const city = await City.findOne({
                name: cityName
            });

            if (!city) {
                console.log(`City not found: ${cityName}`);
                continue;
            }

            for (const place of places) {
                await Place.updateOne(
                    {
                        name: place.name,
                        city: city._id
                    },
                    {
                        $set: {
                            name: place.name,
                            city: city._id,
                            description: place.description,
                            entryFee: place.entryFee,
                            isPopular: true,
                            isActive: true
                        }
                    },
                    {
                        upsert: true
                    }
                );
            }

            console.log(`Places added for ${cityName}`);
        }

        console.log("Places seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

seedPlaces();