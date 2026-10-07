const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");

const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");

dotenv.config();

const zoneName = "Northeast India";

const data = {
    Assam: {
        Guwahati: ["Kamakhya Temple", "Umananda Island", "Assam State Museum"],
        Kaziranga: ["Kaziranga National Park", "Kohora Range", "Orchid Park"],
        Jorhat: ["Majuli Island", "Tocklai Tea Research Institute", "Gibbon Wildlife Sanctuary"],
        Dibrugarh: ["Tea Gardens", "Dehing Patkai National Park", "Bogibeel Bridge"],
        Sivasagar: ["Sivasagar Sivadol", "Rang Ghar", "Talatal Ghar"],
        Tezpur: ["Agnigarh", "Bamuni Hills", "Chitralekha Udyan"]
    },

    Meghalaya: {
        Shillong: ["Elephant Falls", "Shillong Peak", "Ward's Lake"],
        Cherrapunji: ["Nohkalikai Falls", "Mawsmai Cave", "Seven Sisters Falls"],
        Dawki: ["Umngot River", "Dawki Bridge", "Border View Point"],
        Tura: ["Tura Peak", "Pelga Falls", "Nokrek National Park"],
        Mawlynnong: ["Living Root Bridge", "Mawlynnong Village", "Balancing Rock"]
    },

    Sikkim: {
        Gangtok: ["Tsomgo Lake", "Rumtek Monastery", "Banjhakri Falls"],
        Pelling: ["Pemayangtse Monastery", "Rabdentse Ruins", "Khecheopalri Lake"],
        Namchi: ["Char Dham", "Samdruptse Hill", "Temi Tea Garden"],
        Lachung: ["Yumthang Valley", "Zero Point", "Chopta Valley"],
        Lachen: ["Gurudongmar Lake", "Thangu Valley", "Lachen Monastery"]
    },

    "Arunachal Pradesh": {
        Itanagar: ["Ita Fort", "Ganga Lake", "Jawaharlal Nehru State Museum"],
        Tawang: ["Tawang Monastery", "Sela Pass", "Madhuri Lake"],
        Ziro: ["Ziro Valley", "Talley Valley", "Tarin Fish Farm"],
        Bomdila: ["Bomdila Monastery", "Apple Orchards", "Eaglenest Wildlife Sanctuary"],
        Dirang: ["Dirang Valley", "Hot Water Springs", "Sangti Valley"],
        "Pasighat": ["Daying Ering Wildlife Sanctuary", "Siang River", "Pangin"]
    },

    Nagaland: {
        Kohima: ["Kohima War Cemetery", "Naga Heritage Village", "Japfu Peak"],
        Dimapur: ["Kachari Ruins", "Diezephe Village", "Triple Falls"],
        Mokokchung: ["Mokokchung Village", "Longkhum Village", "Chuchuyimlang Village"],
        Mon: ["Longwa Village", "Shangnyu Village", "Veda Peak"],
        Wokha: ["Mount Tiyi", "Doyang Reservoir", "Wokha Village"]
    },

    Manipur: {
        Imphal: ["Kangla Fort", "Ima Keithel", "Shree Govindajee Temple"],
        Ukhrul: ["Shirui Hills", "Kachai Waterfall", "Khangkhui Cave"],
        Churachandpur: ["Tuibong Peace Ground", "Tipaimukh", "Khuga Dam"],
        Bishnupur: ["Loktak Lake", "Sendra Island", "Keibul Lamjao National Park"]
    },

    Mizoram: {
        Aizawl: ["Mizoram State Museum", "Durtlang Hills", "Solomon's Temple"],
        Lunglei: ["Serkawn", "Lunglei Viewpoint", "Thorangtlang Wildlife Sanctuary"],
        Champhai: ["Mura Puk", "Rih Dil", "Zokhawthar"],
        Kolasib: ["Tamdil Lake", "Vairengte", "Rengti River"]
    },

    Tripura: {
        Agartala: ["Ujjayanta Palace", "Neermahal Palace", "Jagannath Temple"],
        Unakoti: ["Unakoti Rock Carvings", "Unakoti Hill", "Jampui Hills"],
        Dharmanagar: ["Jampui Hills", "Rowa Wildlife Sanctuary", "Kamalpur"],
        Udaipur: ["Tripura Sundari Temple", "Kalyan Sagar Lake", "Neermahal"]
    }
};

const getPlaceImage = (placeName, cityName) => {
    const query = encodeURIComponent(`${placeName} ${cityName} India`);
    return `https://source.unsplash.com/800x600/?${query}`;
};

const seedNortheastIndia = async () => {
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
                                bestTimeToVisit: "October to April",
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

        console.log("Northeast India places seeded successfully");
    } catch (error) {
        console.error("Northeast India seeder error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedNortheastIndia();