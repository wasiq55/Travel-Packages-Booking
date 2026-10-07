const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");

const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");

dotenv.config();

const zoneName = "South India";

const data = {
    "Andhra Pradesh": {
        Visakhapatnam: ["RK Beach", "Kailasagiri", "Araku Valley"],
        Vijayawada: ["Kanaka Durga Temple", "Prakasam Barrage", "Bhavani Island"],
        Tirupati: ["Tirumala Temple", "Kapila Theertham", "Sri Govindaraja Swamy Temple"],
        Amaravati: ["Amaravati Stupa", "Amaralingeswara Temple", "Dhyana Buddha Statue"],
        Nellore: ["Mypadu Beach", "Nellapattu Bird Sanctuary", "Ranganathaswamy Temple"],
        Kurnool: ["Belum Caves", "Oravakallu Rock Garden", "Konda Reddy Fort"]
    },

    Telangana: {
        Hyderabad: ["Charminar", "Golconda Fort", "Hussain Sagar Lake"],
        Warangal: ["Warangal Fort", "Thousand Pillar Temple", "Ramappa Temple"],
        Nizamabad: ["Nizamabad Fort", "Ali Sagar Reservoir", "Siddulagutta"],
        Karimnagar: ["Elgandal Fort", "Lower Manair Dam", "Vemulawada Temple"],
        Khammam: ["Khammam Fort", "Kinnerasani Wildlife Sanctuary", "Laxmi Narasimha Temple"],
        Adilabad: ["Kuntala Waterfall", "Pochera Waterfall", "Kawal Wildlife Sanctuary"]
    },

    Karnataka: {
        Bengaluru: ["Lalbagh Botanical Garden", "Bangalore Palace", "Cubbon Park"],
        Mysuru: ["Mysore Palace", "Chamundi Hill", "Brindavan Gardens"],
        Hampi: ["Virupaksha Temple", "Vijaya Vittala Temple", "Hampi Bazaar"],
        Coorg: ["Abbey Falls", "Raja's Seat", "Dubare Elephant Camp"],
        Mangaluru: ["Panambur Beach", "Kadri Manjunath Temple", "Sultan Battery"],
        Gokarna: ["Om Beach", "Kudle Beach", "Mahabaleshwar Temple"],
        Chikmagalur: ["Mullayanagiri", "Baba Budangiri", "Hebbe Falls"],
        Udupi: ["Sri Krishna Temple", "Malpe Beach", "St Mary's Island"],
        Badami: ["Badami Cave Temples", "Agastya Lake", "Banashankari Temple"]
    },

    Kerala: {
        Kochi: ["Fort Kochi", "Mattancherry Palace", "Chinese Fishing Nets"],
        Munnar: ["Tea Gardens", "Eravikulam National Park", "Mattupetty Dam"],
        Alleppey: ["Alleppey Backwaters", "Alappuzha Beach", "Vembanad Lake"],
        Thiruvananthapuram: ["Sree Padmanabhaswamy Temple", "Kovalam Beach", "Napier Museum"],
        Wayanad: ["Edakkal Caves", "Soochipara Falls", "Banasura Sagar Dam"],
        Thekkady: ["Periyar Wildlife Sanctuary", "Periyar Lake", "Mangala Devi Temple"],
        Varkala: ["Varkala Beach", "Janardhana Swamy Temple", "Varkala Cliff"],
        Kozhikode: ["Kozhikode Beach", "Kappad Beach", "Beypore"]
    },

    "Tamil Nadu": {
        Chennai: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St George"],
        Ooty: ["Ooty Lake", "Doddabetta Peak", "Government Botanical Garden"],
        Madurai: ["Meenakshi Amman Temple", "Thirumalai Nayakkar Palace", "Gandhi Memorial Museum"],
        Coimbatore: ["Marudamalai Temple", "Gedee Car Museum", "Isha Yoga Center"],
        Kodaikanal: ["Kodaikanal Lake", "Coaker's Walk", "Pillar Rocks"],
        Rameswaram: ["Ramanathaswamy Temple", "Pamban Bridge", "Dhanushkodi"],
        Thanjavur: ["Brihadeeswarar Temple", "Thanjavur Palace", "Saraswathi Mahal Library"],
        Mahabalipuram: ["Shore Temple", "Pancha Rathas", "Arjuna's Penance"],
        Kanyakumari: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue", "Kanyakumari Beach"]
    },

    Goa: {
        Panaji: ["Basilica of Bom Jesus", "Miramar Beach", "Dona Paula"],
        Calangute: ["Calangute Beach", "Baga Beach", "Calangute Market"],
        Margao: ["Colva Beach", "Our Lady of Mercy Church", "Margao Municipal Garden"],
        Vasco: ["Bogmallo Beach", "Naval Aviation Museum", "Mormugao Fort"],
        Mapusa: ["Mapusa Market", "Anjuna Beach", "Chapora Fort"]
    }
};

const getPlaceImage = (placeName, cityName) => {
    const query = encodeURIComponent(`${placeName} ${cityName} India`);
    return `https://source.unsplash.com/800x600/?${query}`;
};

const seedSouthIndia = async () => {
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

        console.log("South India places seeded successfully");
    } catch (error) {
        console.error("South India seeder error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedSouthIndia();