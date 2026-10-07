const mongoose = require("mongoose");
const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");
require("dotenv").config();

const zoneName = "East India";

const data = {
    Odisha: {
        Bhubaneswar: [
            "Lingaraj Temple",
            "Mukteshwar Temple",
            "Rajarani Temple",
            "Dhauli Shanti Stupa",
            "Udayagiri and Khandagiri Caves",
            "Nandankanan Zoological Park"
        ],
        Cuttack: [
            "Barabati Fort",
            "Cuttack Chandi Temple",
            "Netaji Birth Place Museum",
            "Dhabaleswar Temple"
        ],
        Puri: [
            "Jagannath Temple",
            "Puri Beach",
            "Gundicha Temple",
            "Raghurajpur Artist Village"
        ],
        Konark: [
            "Konark Sun Temple",
            "Chandrabhaga Beach",
            "Ramachandi Beach"
        ],
        Sambalpur: [
            "Hirakud Dam",
            "Samaleswari Temple",
            "Huma Leaning Temple",
            "Debrigarh Wildlife Sanctuary"
        ],
        Rourkela: [
            "Hanuman Vatika",
            "Mandira Dam",
            "Vedavyas Temple",
            "Khandadhar Waterfall"
        ],
        Baripada: [
            "Similipal National Park",
            "Barehipani Waterfall",
            "Joranda Waterfall"
        ],
        Koraput: [
            "Deomali Hills",
            "Sabara Srikhetra",
            "Duduma Waterfall",
            "Gupteswar Cave"
        ],
        Balasore: [
            "Chandipur Beach",
            "Panchalingeswar Temple",
            "Talasari Beach"
        ],
        Jajpur: [
            "Ratnagiri Buddhist Complex",
            "Udayagiri Buddhist Complex",
            "Lalitgiri Buddhist Complex",
            "Biraja Temple"
        ]
    },

    Bihar: {
        Patna: [
            "Golghar",
            "Bihar Museum",
            "Buddha Smriti Park",
            "Patna Sahib Gurudwara",
            "Eco Park"
        ],
        Gaya: [
            "Vishnupad Temple",
            "Mangla Gauri Temple",
            "Brahmayoni Hill"
        ],
        "Bodh Gaya": [
            "Mahabodhi Temple",
            "Great Buddha Statue",
            "Thai Monastery"
        ],
        Rajgir: [
            "Griddhakuta Hill",
            "Vishwa Shanti Stupa",
            "Rajgir Ropeway",
            "Hot Springs"
        ],
        Nalanda: [
            "Nalanda Mahavihara Ruins",
            "Xuanzang Memorial Hall",
            "Nalanda Archaeological Museum"
        ],
        Vaishali: [
            "Ashokan Pillar",
            "Vishwa Shanti Stupa",
            "Buddha Relic Stupa"
        ],
        Bhagalpur: [
            "Vikramshila Ruins",
            "Vikramshila Dolphin Sanctuary",
            "Mandar Hill"
        ],
        "West Champaran": [
            "Valmiki Tiger Reserve",
            "Valmiki Ashram",
            "Lauria Nandangarh"
        ],
        Rohtas: [
            "Rohtasgarh Fort",
            "Sher Shah Suri Tomb",
            "Mundeshwari Devi Temple"
        ],
        Jehanabad: [
            "Barabar Caves",
            "Siddheshwar Nath Temple"
        ],
        Aurangabad: [
            "Deo Sun Temple",
            "Surya Kund",
            "Umga Temple"
        ]
    },

    Jharkhand: {
        Ranchi: [
            "Dassam Falls",
            "Hundru Falls",
            "Jagannath Temple",
            "Rock Garden",
            "Tagore Hill"
        ],
        Jamshedpur: [
            "Jubilee Park",
            "Dalma Wildlife Sanctuary",
            "Dimna Lake",
            "Tata Steel Zoological Park"
        ],
        Dhanbad: [
            "Maithon Dam",
            "Topchanchi Lake",
            "Bhatinda Falls"
        ],
        Deoghar: [
            "Baba Baidyanath Temple",
            "Trikut Pahar",
            "Tapovan Caves",
            "Nandan Pahar"
        ],
        Netarhat: [
            "Netarhat Sunrise Point",
            "Magnolia Point",
            "Upper Ghaghri Waterfall"
        ],
        Hazaribagh: [
            "Hazaribagh National Park",
            "Hazaribagh Lake",
            "Canary Hill"
        ],
        Bokaro: [
            "City Park",
            "Garga Dam",
            "Jagannath Temple Bokaro"
        ]
    },

    "West Bengal": {
        Kolkata: [
            "Victoria Memorial",
            "Howrah Bridge",
            "Indian Museum",
            "Science City",
            "Eco Park"
        ],
        Darjeeling: [
            "Tiger Hill",
            "Darjeeling Himalayan Railway",
            "Batasia Loop",
            "Peace Pagoda"
        ],
        Siliguri: [
            "Mahananda Wildlife Sanctuary",
            "Salugara Monastery",
            "ISKCON Temple"
        ],
        Kalimpong: [
            "Deolo Hill",
            "Durpin Monastery",
            "Cactus Nursery"
        ],
        Digha: [
            "New Digha Beach",
            "Shankarpur Beach",
            "Amarabati Park"
        ],
        Sundarbans: [
            "Sundarbans National Park",
            "Sajnekhali Watch Tower",
            "Sudhanyakhali Watch Tower"
        ],
        Murshidabad: [
            "Hazarduari Palace",
            "Katra Mosque",
            "Nizamat Imambara"
        ],
        Bishnupur: [
            "Rasmancha",
            "Jor Bangla Temple",
            "Madanmohan Temple"
        ],
        Shantiniketan: [
            "Visva-Bharati University",
            "Rabindra Bhavana",
            "Amar Kutir"
        ]
    }
};
const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const sleep = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
};

const getPlaceImage = async (placeName, cityName) => {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const searchQuery = `${placeName} ${cityName} India`;

            const url = new URL(
                "https://commons.wikimedia.org/w/api.php"
            );

            url.searchParams.set("action", "query");
            url.searchParams.set("generator", "search");
            url.searchParams.set("gsrsearch", searchQuery);
            url.searchParams.set("gsrnamespace", "6");
            url.searchParams.set("gsrlimit", "3");
            url.searchParams.set("prop", "imageinfo");
            url.searchParams.set("iiprop", "url");
            url.searchParams.set("iiurlwidth", "800");
            url.searchParams.set("format", "json");
            url.searchParams.set("origin", "*");

            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "TravelPlatform/1.0 (contact@example.com)"
                }
            });

            if (response.status === 429) {
                const retryAfter = response.headers.get("retry-after");

                const waitTime = retryAfter
                    ? Number(retryAfter) * 1000
                    : attempt * 10000;

                console.log(
                    `Rate limited. Waiting ${waitTime / 1000} seconds...`
                );

                await sleep(waitTime);

                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.info);
            }

            const pages = result.query?.pages;

            if (!pages) {
                console.log(`Image not found: ${placeName}`);
                return "";
            }

            const pageList = Object.values(pages);

            for (const page of pageList) {
                const imageInfo = page.imageinfo?.[0];

                if (imageInfo?.thumburl || imageInfo?.url) {
                    console.log(`Image found: ${placeName}`);

                    return imageInfo.thumburl || imageInfo.url;
                }
            }

            console.log(`Image not found: ${placeName}`);

            return "";
        } catch (error) {
            console.log(
                `Image search failed: ${placeName} - ${error.message}`
            );

            if (attempt < maxRetries) {
                await sleep(attempt * 10000);
            }
        }
    }

    console.log(`Skipping image after retries: ${placeName}`);

    return "";
};

const seedEastIndia = async () => {
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

            for (const [cityName, placeNames] of Object.entries(cities)) {
                let city = await City.findOne({
                    name: cityName,
                    state: state._id
                });

                if (!city) {
                    city = await City.create({
                        name: cityName,
                        slug: slugify(cityName),
                        state: state._id,
                        isPopular: true,
                        isActive: true
                    });

                    console.log(`City created: ${cityName}`);
                }

                for (const placeName of placeNames) {
                    const existingPlace = await Place.findOne({
                        name: placeName,
                        city: city._id
                    });

                    let image = existingPlace?.image || "";

                    if (!image) {
                        image = await getPlaceImage(
                            placeName,
                            cityName
                        );
                    }

                    await Place.updateOne(
                        {
                            name: placeName,
                            city: city._id
                        },
                        {
                            $set: {
                                name: placeName,
                                city: city._id,
                                description: `${placeName} is a tourist destination in ${cityName}, ${stateName}.`,
                                image: image,
                                entryFee: 0,
                                visitingHours: "Check before visiting",
                                bestTimeToVisit: "October to March",
                                isPopular: true,
                                isActive: true
                            }
                        },
                        {
                            upsert: true
                        }
                    );

                    console.log(`Place updated: ${placeName}`);

                    await new Promise((resolve) =>
                        setTimeout(resolve, 1500)
                    );
                }

                console.log(`Places seeded for ${cityName}`);
            }
        }

        console.log("East India data seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

seedEastIndia();
