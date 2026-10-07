const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");

const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");

dotenv.config();

const zoneName = "North India";

const data = {
    "Jammu & Kashmir": {
        Srinagar: ["Dal Lake", "Mughal Gardens", "Shankaracharya Temple"],
        Gulmarg: ["Gulmarg Gondola", "Apharwat Peak"],
        Pahalgam: ["Betaab Valley", "Aru Valley"],
        Jammu: ["Vaishno Devi Temple", "Mubarak Mandi Palace"]
    },

    Ladakh: {
        Leh: ["Leh Palace", "Shanti Stupa", "Magnetic Hill"],
        Kargil: ["Kargil War Memorial", "Drass Valley"],
        "Nubra Valley": ["Diskit Monastery", "Hunder Sand Dunes"],
        Pangong: ["Pangong Lake", "Spangmik Village"]
    },

    "Himachal Pradesh": {
        Shimla: ["Mall Road", "The Ridge", "Jakhoo Temple"],
        Manali: ["Solang Valley", "Hadimba Temple", "Rohtang Pass"],
        Dharamshala: ["McLeod Ganj", "Bhagsu Waterfall"],
        Kullu: ["Raghunath Temple", "Great Himalayan National Park"],
        Dalhousie: ["Khajjiar", "Panchpula"],
        Kasol: ["Parvati Valley", "Manikaran Sahib"]
    },

    Punjab: {
        Amritsar: ["Golden Temple", "Jallianwala Bagh", "Wagah Border"],
        Ludhiana: ["Nehru Rose Garden", "Lodhi Fort"],
        Jalandhar: ["Devi Talab Mandir", "Science City"],
        Patiala: ["Qila Mubarak", "Sheesh Mahal"],
        Bathinda: ["Qila Mubarak", "Rose Garden"]
    },

    Haryana: {
        Gurugram: ["Cyber Hub", "Sultanpur National Park"],
        Faridabad: ["Surajkund", "Badkhal Lake"],
        Panipat: ["Panipat Museum", "Kabuli Bagh Mosque"],
        Kurukshetra: ["Brahma Sarovar", "Jyotisar"],
        Hisar: ["Firoz Shah Palace", "Rakhigarhi"]
    },

    Uttarakhand: {
        Dehradun: ["Robber's Cave", "Sahastradhara"],
        Mussoorie: ["Mall Road", "Kempty Falls", "Gun Hill"],
        Nainital: ["Naini Lake", "Naina Devi Temple"],
        Rishikesh: ["Triveni Ghat", "Neer Garh Waterfall"],
        Haridwar: ["Har Ki Pauri", "Mansa Devi Temple"],
        Badrinath: ["Badrinath Temple", "Mana Village"],
        Kedarnath: ["Kedarnath Temple", "Bhairavnath Temple"]
    },

    "Uttar Pradesh": {
        Lucknow: ["Bara Imambara", "Rumi Darwaza", "Chota Imambara"],
        Agra: ["Taj Mahal", "Agra Fort", "Mehtab Bagh"],
        Varanasi: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath"],
        Prayagraj: ["Triveni Sangam", "Anand Bhavan"],
        Ayodhya: ["Ram Mandir", "Hanuman Garhi"],
        Mathura: ["Krishna Janmabhoomi", "Vishram Ghat"],
        Vrindavan: ["Banke Bihari Temple", "Prem Mandir"],
        Kanpur: ["JK Temple", "Moti Jheel"],
        Meerut: ["Augharnath Temple", "Gandhi Bagh"]
    },

    Rajasthan: {
        Jaipur: ["Amber Fort", "Hawa Mahal", "City Palace"],
        Udaipur: ["Lake Pichola", "City Palace", "Fateh Sagar Lake"],
        Jodhpur: ["Mehrangarh Fort", "Umaid Bhawan Palace"],
        Jaisalmer: ["Jaisalmer Fort", "Sam Sand Dunes"],
        Pushkar: ["Pushkar Lake", "Brahma Temple"],
        Ajmer: ["Ajmer Sharif Dargah", "Ana Sagar Lake"],
        Bikaner: ["Junagarh Fort", "Lalgarh Palace"],
        "Mount Abu": ["Nakki Lake", "Dilwara Temples"],
        Kota: ["Seven Wonders Park", "Kishore Sagar Lake"]
    },

    Delhi: {
        "New Delhi": ["India Gate", "Qutub Minar", "Humayun's Tomb"],
        "Old Delhi": ["Red Fort", "Jama Masjid", "Chandni Chowk"],
        Dwarka: ["ISKCON Temple", "Dwarka Sector 21"],
        Saket: ["Garden of Five Senses", "Select Citywalk"]
    },

    Chandigarh: {
        Chandigarh: ["Rock Garden", "Sukhna Lake", "Rose Garden"]
    }
};

const getPlaceImage = (placeName, cityName) => {
    const query = encodeURIComponent(`${placeName} ${cityName} India`);
    return `https://source.unsplash.com/800x600/?${query}`;
};

const seedNorthIndia = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const zone = await Zone.findOne({ name: zoneName });

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
                        slug: slugify(cityName, { lower: true }),
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
                                slug: slugify(placeName, { lower: true }),
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

                    console.log(`Seeded: ${stateName} > ${cityName} > ${placeName}`);
                }
            }
        }

        console.log("North India places seeded successfully");
    } catch (error) {
        console.error("North India seeder error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedNorthIndia();