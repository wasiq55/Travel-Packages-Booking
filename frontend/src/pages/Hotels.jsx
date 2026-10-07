import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../api/axios";

gsap.registerPlugin(ScrollTrigger);

const Hotels = () => {
    const navigate = useNavigate();

    const pageRef = useRef(null);
    const heroContentRef = useRef(null);
    const canvasRef = useRef(null);

    const [hotels, setHotels] = useState([]);
    const [cities, setCities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [error, setError] = useState("");

    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2");

    const [searched, setSearched] = useState(false);

    const [popularIndex, setPopularIndex] = useState(0);
    const [trendingIndex, setTrendingIndex] = useState(0);
    const [posterIndex, setPosterIndex] = useState(0);

    const posters = [
        {
            image: "/images/hotel.jpg",
            eyebrow: "The stay starts here",
            title: "Hotels made for the journey.",
            description:
                "Find beautiful rooms, thoughtful spaces and memorable stays across India.",
            location: "India"
        },
        {
            image: "/images/goa.jpg",
            eyebrow: "Coastal stays",
            title: "Wake up somewhere beautiful.",
            description:
                "From beachside resorts to quiet escapes, find a stay that feels like part of the journey.",
            location: "Goa"
        },
        {
            image: "/images/mountain.jpg",
            eyebrow: "Mountain escapes",
            title: "A room with a view.",
            description:
                "Trade busy streets for mountain air, peaceful mornings and unforgettable landscapes.",
            location: "India"
        }
    ];

    const destinationImages = [
        "/images/goa.jpg",
        "/images/mountain.jpg",
        "/images/lake.jpg",
        "/images/hotel.jpg",
        "/images/forest.jpg",
        "/images/desert.jpg",
        "/images/city.jpg"
    ];

    const fallbackHotelImages = [
        "/images/hotel.jpg",
        "/images/lake.jpg",
        "/images/mountain.jpg",
        "/images/goa.jpg",
        "/images/forest.jpg",
        "/images/desert.jpg",
        "/images/city.jpg"
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setCitiesLoading(true);
                setError("");

                const [hotelsResponse, citiesResponse] = await Promise.all([
                    api.get("/hotels"),
                    api.get("/cities")
                ]);

                const hotelData =
                    hotelsResponse.data?.hotels ||
                    hotelsResponse.data?.data ||
                    (Array.isArray(hotelsResponse.data)
                        ? hotelsResponse.data
                        : []);

                const cityData =
                    citiesResponse.data?.cities ||
                    citiesResponse.data?.data ||
                    (Array.isArray(citiesResponse.data)
                        ? citiesResponse.data
                        : []);

                setHotels(hotelData);
                setCities(cityData);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load hotels. Please try again."
                );
            } finally {
                setLoading(false);
                setCitiesLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (hotels.length <= 3) {
            return;
        }

        const timer = setInterval(() => {
            setPopularIndex((previous) => {
                const maxIndex = Math.max(hotels.length - 3, 0);
                return previous >= maxIndex ? 0 : previous + 1;
            });
        }, 4500);

        return () => clearInterval(timer);
    }, [hotels.length]);

    useEffect(() => {
        if (hotels.length <= 3) {
            return;
        }

        const timer = setInterval(() => {
            setTrendingIndex((previous) => {
                const maxIndex = Math.max(hotels.length - 3, 0);
                return previous >= maxIndex ? 0 : previous + 1;
            });
        }, 5200);

        return () => clearInterval(timer);
    }, [hotels.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            setPosterIndex((previous) =>
                previous >= posters.length - 1 ? 0 : previous + 1
            );
        }, 5500);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        if (!container) {
            return;
        }

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            38,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );

        camera.position.set(5.5, 4.2, 8.5);
        camera.lookAt(0, 2, 0);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(
            container.clientWidth,
            container.clientHeight,
            false
        );

        const hotelGroup = new THREE.Group();
        hotelGroup.position.set(0, -1.8, 0);
        scene.add(hotelGroup);

        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaa79e,
            roughness: 0.72,
            metalness: 0.08
        });

        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x252723,
            roughness: 0.6,
            metalness: 0.15
        });

        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xc7bca1,
            emissive: 0x514936,
            emissiveIntensity: 0.45,
            roughness: 0.3,
            metalness: 0.15
        });

        const poolMaterial = new THREE.MeshStandardMaterial({
            color: 0x6e7770,
            roughness: 0.25,
            metalness: 0.1
        });

        const buildingGeometry = new THREE.BoxGeometry(
            4.8,
            6.2,
            2.6
        );

        const building = new THREE.Mesh(
            buildingGeometry,
            buildingMaterial
        );

        building.position.y = 3.1;
        hotelGroup.add(building);

        const sideGeometry = new THREE.BoxGeometry(
            1.7,
            3.4,
            3.2
        );

        const leftWing = new THREE.Mesh(
            sideGeometry,
            darkMaterial
        );

        leftWing.position.set(-3.15, 1.7, 0.1);
        hotelGroup.add(leftWing);

        const rightWing = new THREE.Mesh(
            sideGeometry,
            darkMaterial
        );

        rightWing.position.set(3.15, 1.7, 0.1);
        hotelGroup.add(rightWing);

        const entranceGeometry = new THREE.BoxGeometry(
            1.45,
            2.8,
            0.18
        );

        const entrance = new THREE.Mesh(
            entranceGeometry,
            darkMaterial
        );

        entrance.position.set(0, 1.4, 1.4);
        hotelGroup.add(entrance);

        const roofGeometry = new THREE.BoxGeometry(
            5.5,
            0.25,
            3.1
        );

        const roof = new THREE.Mesh(
            roofGeometry,
            darkMaterial
        );

        roof.position.y = 6.25;
        hotelGroup.add(roof);

        const poolGeometry = new THREE.BoxGeometry(
            3.3,
            0.12,
            1.4
        );

        const pool = new THREE.Mesh(
            poolGeometry,
            poolMaterial
        );

        pool.position.set(0, 6.48, 0.15);
        hotelGroup.add(pool);

        const windowGeometry = new THREE.BoxGeometry(
            0.42,
            0.7,
            0.08
        );

        const windowGroup = new THREE.Group();

        for (let row = 0; row < 7; row += 1) {
            for (let column = 0; column < 5; column += 1) {
                const window = new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );

                window.position.set(
                    -1.7 + column * 0.85,
                    1.05 + row * 0.78,
                    1.35
                );

                windowGroup.add(window);
            }
        }

        hotelGroup.add(windowGroup);

        const sideWindowGeometry = new THREE.BoxGeometry(
            0.55,
            0.5,
            0.08
        );

        for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 2; column += 1) {
                const leftWindow = new THREE.Mesh(
                    sideWindowGeometry,
                    windowMaterial
                );

                leftWindow.rotation.y = Math.PI / 2;
                leftWindow.position.set(
                    -4.03,
                    0.9 + row * 0.85,
                    -0.65 + column * 1
                );

                hotelGroup.add(leftWindow);

                const rightWindow = new THREE.Mesh(
                    sideWindowGeometry,
                    windowMaterial
                );

                rightWindow.rotation.y = Math.PI / 2;
                rightWindow.position.set(
                    4.03,
                    0.9 + row * 0.85,
                    -0.65 + column * 1
                );

                hotelGroup.add(rightWindow);
            }
        }

        const terraceGeometry = new THREE.BoxGeometry(
            6.8,
            0.18,
            3.8
        );

        const terrace = new THREE.Mesh(
            terraceGeometry,
            darkMaterial
        );

        terrace.position.y = -0.15;
        hotelGroup.add(terrace);

        const light = new THREE.PointLight(
            0xf4e9c8,
            35,
            15
        );

        light.position.set(0, 4.2, 4);
        scene.add(light);

        const fillLight = new THREE.PointLight(
            0xffffff,
            12,
            14
        );

        fillLight.position.set(-5, 3, 3);
        scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            1.8
        );

        scene.add(ambientLight);

        const groundGeometry = new THREE.PlaneGeometry(
            20,
            20
        );

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x111311,
            roughness: 1
        });

        const ground = new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.25;
        scene.add(ground);

        const mouse = {
            x: 0,
            y: 0
        };

        const target = {
            x: 0,
            y: 0
        };

        const handleMouseMove = (event) => {
            mouse.x = event.clientX / window.innerWidth - 0.5;
            mouse.y = event.clientY / window.innerHeight - 0.5;
        };

        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height, false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", resize);

        resize();

        let animationFrame;

        const animate = () => {
            animationFrame = requestAnimationFrame(animate);

            target.y +=
                (mouse.x * 0.28 - target.y) * 0.025;

            target.x +=
                (-mouse.y * 0.12 - target.x) * 0.025;

            hotelGroup.rotation.y +=
                (target.y - hotelGroup.rotation.y) * 0.035;

            hotelGroup.rotation.x +=
                (target.x - hotelGroup.rotation.x) * 0.035;

            hotelGroup.position.y =
                -1.8 + Math.sin(Date.now() * 0.0008) * 0.035;

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame);

            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener("resize", resize);

            buildingGeometry.dispose();
            sideGeometry.dispose();
            entranceGeometry.dispose();
            roofGeometry.dispose();
            poolGeometry.dispose();
            windowGeometry.dispose();
            sideWindowGeometry.dispose();
            terraceGeometry.dispose();
            groundGeometry.dispose();

            buildingMaterial.dispose();
            darkMaterial.dispose();
            windowMaterial.dispose();
            poolMaterial.dispose();
            groundMaterial.dispose();

            renderer.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (!pageRef.current) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                heroContentRef.current,
                {
                    opacity: 0,
                    y: 45
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    ease: "power3.out"
                }
            );

            gsap.utils
                .toArray("[data-reveal]")
                .forEach((element) => {
                    gsap.fromTo(
                        element,
                        {
                            opacity: 0,
                            y: 45
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.9,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: element,
                                start: "top 88%",
                                once: true
                            }
                        }
                    );
                });

            gsap.utils
                .toArray("[data-line]")
                .forEach((element) => {
                    gsap.fromTo(
                        element,
                        {
                            scaleX: 0,
                            transformOrigin: "left center"
                        },
                        {
                            scaleX: 1,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: element,
                                start: "top 90%",
                                once: true
                            }
                        }
                    );
                });
        }, pageRef);

        return () => context.revert();
    }, [loading, hotels.length, cities.length]);

    const getCityId = (city) => {
        if (!city) {
            return "";
        }

        if (typeof city === "string") {
            return city;
        }

        return city._id || city.id || "";
    };

    const getCityName = (city) => {
        if (!city) {
            return "";
        }

        if (typeof city === "string") {
            const matchedCity = cities.find(
                (item) => getCityId(item) === city
            );

            return matchedCity?.name || "";
        }

        return city.name || "";
    };

    const getHotelCityId = (hotel) => {
        if (!hotel?.city) {
            return "";
        }

        if (typeof hotel.city === "string") {
            return hotel.city;
        }

        return hotel.city._id || hotel.city.id || "";
    };

    const getHotelCityName = (hotel) => {
        if (!hotel?.city) {
            return "";
        }

        if (typeof hotel.city === "string") {
            const matchedCity = cities.find(
                (city) => getCityId(city) === hotel.city
            );

            return matchedCity?.name || "";
        }

        return hotel.city.name || "";
    };

    const getHotelImage = (hotel, index = 0) => {
        if (hotel?.image) {
            return hotel.image;
        }

        if (hotel?.images?.length > 0) {
            return hotel.images[0];
        }

        if (hotel?.photos?.length > 0) {
            return hotel.photos[0];
        }

        return fallbackHotelImages[
            index % fallbackHotelImages.length
        ];
    };

    const getHotelPrice = (hotel) => {
        if (hotel?.startingPrice !== undefined) {
            return hotel.startingPrice;
        }

        if (hotel?.pricePerNight !== undefined) {
            return hotel.pricePerNight;
        }

        if (hotel?.minPrice !== undefined) {
            return hotel.minPrice;
        }

        if (hotel?.price !== undefined) {
            return hotel.price;
        }

        return null;
    };

    const getRating = (hotel) => {
        if (hotel?.rating !== undefined) {
            return hotel.rating;
        }

        if (hotel?.averageRating !== undefined) {
            return hotel.averageRating;
        }

        return null;
    };

    const getAmenities = (hotel) => {
        if (Array.isArray(hotel?.amenities)) {
            return hotel.amenities;
        }

        if (typeof hotel?.amenities === "string") {
            return hotel.amenities
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }

        return [];
    };

    const filteredHotels = useMemo(() => {
        if (!destination) {
            return hotels;
        }

        return hotels.filter((hotel) => {
            const hotelCityId = getHotelCityId(hotel);
            const hotelCityName =
                getHotelCityName(hotel).toLowerCase();

            return (
                hotelCityId === destination ||
                hotelCityName ===
                    getCityName(destination).toLowerCase()
            );
        });
    }, [hotels, destination, cities]);

    const popularHotels = useMemo(() => {
        return hotels.slice(0, 10);
    }, [hotels]);

    const trendingHotels = useMemo(() => {
        return [...hotels]
            .sort((a, b) => {
                const ratingA = Number(getRating(a) || 0);
                const ratingB = Number(getRating(b) || 0);

                return ratingB - ratingA;
            })
            .slice(0, 10);
    }, [hotels]);

    const visiblePopularHotels = popularHotels.slice(
        popularIndex,
        popularIndex + 3
    );

    const visibleTrendingHotels = trendingHotels.slice(
        trendingIndex,
        trendingIndex + 3
    );

    const handleSearch = (event) => {
        event.preventDefault();

        if (checkIn && checkOut && checkOut <= checkIn) {
            setError(
                "Check-out date must be after check-in date."
            );
            return;
        }

        setError("");
        setSearched(true);

        document
            .getElementById("hotel-results")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    };

    const handleViewHotel = (hotel) => {
        navigate(`/hotel/${hotel._id}`);
    };

    const handleDestinationSearch = (city) => {
        const cityId = getCityId(city);

        setDestination(cityId);
        setSearched(true);

        setTimeout(() => {
            document
                .getElementById("hotel-results")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 100);
    };

    const clearSearch = () => {
        setDestination("");
        setCheckIn("");
        setCheckOut("");
        setGuests("2");
        setSearched(false);
        setError("");
    };

    const movePopular = (direction) => {
        const maxIndex = Math.max(
            popularHotels.length - 3,
            0
        );

        setPopularIndex((previous) => {
            if (direction === "next") {
                return previous >= maxIndex
                    ? 0
                    : previous + 1;
            }

            return previous <= 0
                ? maxIndex
                : previous - 1;
        });
    };

    const moveTrending = (direction) => {
        const maxIndex = Math.max(
            trendingHotels.length - 3,
            0
        );

        setTrendingIndex((previous) => {
            if (direction === "next") {
                return previous >= maxIndex
                    ? 0
                    : previous + 1;
            }

            return previous <= 0
                ? maxIndex
                : previous - 1;
        });
    };

    const movePoster = (direction) => {
        setPosterIndex((previous) => {
            if (direction === "next") {
                return previous >= posters.length - 1
                    ? 0
                    : previous + 1;
            }

            return previous <= 0
                ? posters.length - 1
                : previous - 1;
        });
    };

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const renderHotelCard = (hotel, index = 0) => {
        const image = getHotelImage(hotel, index);
        const price = getHotelPrice(hotel);
        const rating = getRating(hotel);
        const amenities = getAmenities(hotel);
        const cityName = getHotelCityName(hotel);

        return (
            <motion.article
                key={hotel._id || hotel.id || index}
                initial={{
                    opacity: 0,
                    y: 30
                }}
                whileInView={{
                    opacity: 1,
                    y: 0
                }}
                viewport={{
                    once: true,
                    amount: 0.15
                }}
                transition={{
                    duration: 0.65,
                    delay: index * 0.06
                }}
                whileHover={{
                    y: -8
                }}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#181a17]"
            >
                <div className="relative h-64 overflow-hidden">
                    <motion.img
                        src={image}
                        alt={hotel.name || "Hotel"}
                        className="h-full w-full object-cover"
                        whileHover={{
                            scale: 1.07
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut"
                        }}
                        onError={(event) => {
                            event.currentTarget.src =
                                fallbackHotelImages[
                                    index %
                                        fallbackHotelImages.length
                                ];
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/80 via-transparent to-[#111311]/10" />

                    {rating !== null && (
                        <div className="absolute right-4 top-4 rounded-xl border border-white/15 bg-[#111311]/80 px-3 py-2 text-xs backdrop-blur-md">
                            ★ {rating}
                        </div>
                    )}

                    <div className="absolute bottom-4 left-5">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
                            {cityName || "India"}
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-serif text-2xl tracking-tight">
                        {hotel.name || "Wander Stay"}
                    </h3>

                    <div className="mt-4 flex min-h-6 flex-wrap gap-2">
                        {amenities
                            .slice(0, 2)
                            .map(
                                (
                                    amenity,
                                    amenityIndex
                                ) => (
                                    <span
                                        key={`${amenity}-${amenityIndex}`}
                                        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[8px] uppercase tracking-[0.12em] text-white/40"
                                    >
                                        {amenity}
                                    </span>
                                )
                            )}
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
                        <div>
                            <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                From
                            </p>

                            {price !== null ? (
                                <p className="mt-1 text-lg font-semibold">
                                    ₹
                                    {Number(
                                        price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                    <span className="ml-1 text-xs font-normal text-white/35">
                                        / night
                                    </span>
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-white/35">
                                    View pricing
                                </p>
                            )}
                        </div>

                        <motion.button
                            type="button"
                            onClick={() =>
                                handleViewHotel(hotel)
                            }
                            whileHover={{
                                scale: 1.04
                            }}
                            whileTap={{
                                scale: 0.96
                            }}
                            className="rounded-xl bg-[#f4f1e8] px-5 py-2.5 text-xs font-semibold text-[#111311]"
                        >
                            View
                        </motion.button>
                    </div>
                </div>
            </motion.article>
        );
    };

    return (
        <div
            ref={pageRef}
            className="min-h-screen overflow-hidden bg-[#111311] text-[#f4f1e8]"
        >
            <section className="relative min-h-[760px] overflow-hidden border-b border-white/10">
                <div className="absolute inset-0">
                    <img
                        src="/images/hotel.jpg"
                        alt="Luxury hotel"
                        className="h-full w-full object-cover opacity-25"
                    />

                    <div className="absolute inset-0 bg-[#111311]/80" />

                    <div className="absolute inset-0 bg-gradient-to-r from-[#111311] via-[#111311]/90 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#111311] to-transparent" />

                <div className="absolute right-[-8%] top-16 h-[620px] w-[58%] opacity-90 lg:right-[-3%] lg:w-[52%]">
                    <canvas
                        ref={canvasRef}
                        className="h-full w-full"
                    />
                </div>

                <div
                    ref={heroContentRef}
                    className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 lg:px-10 lg:pb-32 lg:pt-32"
                >
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -20
                            }}
                            animate={{
                                opacity: 1,
                                x: 0
                            }}
                            transition={{
                                duration: 0.8
                            }}
                            className="mb-7 flex items-center gap-4"
                        >
                            <span className="h-px w-12 bg-white/40" />

                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/45">
                                Wander / Hotel Collection
                            </p>
                        </motion.div>

                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 30
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: 0.15,
                                duration: 0.9,
                                ease: "easeOut"
                            }}
                            className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-[105px]"
                        >
                            Check in.
                            <span className="block text-white/35">
                                Slow down.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: 0.35,
                                duration: 0.8
                            }}
                            className="mt-8 max-w-xl text-sm leading-7 text-white/50 sm:text-base"
                        >
                            Discover hotels, resorts and beautiful
                            places to stay across India. Your next
                            room is waiting.
                        </motion.p>
                    </div>

                    <motion.form
                        onSubmit={handleSearch}
                        initial={{
                            opacity: 0,
                            y: 35
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            delay: 0.55,
                            duration: 0.9
                        }}
                        className="mt-14 max-w-6xl rounded-[26px] border border-white/10 bg-[#181a17]/95 p-3 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="grid gap-2 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_auto]">
                            <div className="rounded-2xl bg-[#111311] px-5 py-4">
                                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/30">
                                    Destination
                                </label>

                                <select
                                    value={destination}
                                    onChange={(event) =>
                                        setDestination(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        citiesLoading
                                    }
                                    className="w-full bg-transparent text-sm text-white outline-none"
                                >
                                    <option
                                        value=""
                                        className="bg-[#181a17]"
                                    >
                                        {citiesLoading
                                            ? "Loading cities..."
                                            : "Where do you want to stay?"}
                                    </option>

                                    {cities.map(
                                        (city) => (
                                            <option
                                                key={getCityId(
                                                    city
                                                )}
                                                value={getCityId(
                                                    city
                                                )}
                                                className="bg-[#181a17]"
                                            >
                                                {city.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="rounded-2xl bg-[#111311] px-5 py-4">
                                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/30">
                                    Check-in
                                </label>

                                <input
                                    type="date"
                                    value={checkIn}
                                    min={today}
                                    onChange={(event) =>
                                        setCheckIn(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                />
                            </div>

                            <div className="rounded-2xl bg-[#111311] px-5 py-4">
                                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/30">
                                    Check-out
                                </label>

                                <input
                                    type="date"
                                    value={checkOut}
                                    min={
                                        checkIn ||
                                        today
                                    }
                                    onChange={(event) =>
                                        setCheckOut(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                />
                            </div>

                            <div className="rounded-2xl bg-[#111311] px-5 py-4">
                                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/30">
                                    Guests
                                </label>

                                <select
                                    value={guests}
                                    onChange={(event) =>
                                        setGuests(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full bg-transparent text-sm text-white outline-none"
                                >
                                    {Array.from(
                                        {
                                            length: 8
                                        },
                                        (
                                            _,
                                            index
                                        ) => (
                                            <option
                                                key={
                                                    index +
                                                    1
                                                }
                                                value={
                                                    index +
                                                    1
                                                }
                                                className="bg-[#181a17]"
                                            >
                                                {index +
                                                    1}{" "}
                                                {index ===
                                                0
                                                    ? "Guest"
                                                    : "Guests"}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <motion.button
                                type="submit"
                                whileHover={{
                                    scale: 1.02
                                }}
                                whileTap={{
                                    scale: 0.97
                                }}
                                className="rounded-2xl bg-[#f4f1e8] px-7 py-4 text-sm font-semibold text-[#111311] lg:min-w-[130px]"
                            >
                                Search Hotels
                            </motion.button>
                        </div>
                    </motion.form>

                    <div className="mt-7 flex flex-wrap gap-3">
                        {[
                            "Luxury",
                            "Resorts",
                            "Beach stays",
                            "Mountain stays",
                            "City hotels"
                        ].map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/35"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {!loading && hotels.length > 0 && (
                <section
                    data-reveal
                    className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
                >
                    <div
                        data-line
                        className="mb-9 flex items-end justify-between gap-5"
                    >
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                                01 / Popular hotels
                            </p>

                            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                                Guests keep coming back.
                            </h2>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    movePopular(
                                        "previous"
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white"
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    movePopular("next")
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {visiblePopularHotels.map(
                                (hotel, index) =>
                                    renderHotelCard(
                                        hotel,
                                        popularIndex +
                                            index
                                    )
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            <section
                data-reveal
                className="relative overflow-hidden border-y border-white/10"
            >
                <div className="relative h-[580px] sm:h-[650px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={
                                posters[posterIndex]
                                    .title
                            }
                            initial={{
                                opacity: 0,
                                scale: 1.03
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.99
                            }}
                            transition={{
                                duration: 0.9
                            }}
                            className="absolute inset-0"
                        >
                            <img
                                src={
                                    posters[
                                        posterIndex
                                    ].image
                                }
                                alt={
                                    posters[
                                        posterIndex
                                    ].title
                                }
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-[#111311]/60" />

                            <div className="absolute inset-0 bg-gradient-to-r from-[#111311]/90 via-[#111311]/40 to-transparent" />

                            <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20">
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 35
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{
                                        delay: 0.2,
                                        duration: 0.8
                                    }}
                                    className="max-w-2xl"
                                >
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                                        {
                                            posters[
                                                posterIndex
                                            ].eyebrow
                                        }
                                    </p>

                                    <h2 className="mt-4 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
                                        {
                                            posters[
                                                posterIndex
                                            ].title
                                        }
                                    </h2>

                                    <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                                        {
                                            posters[
                                                posterIndex
                                            ].description
                                        }
                                    </p>

                                    <motion.button
                                        type="button"
                                        whileHover={{
                                            scale: 1.04
                                        }}
                                        whileTap={{
                                            scale: 0.96
                                        }}
                                        onClick={() => {
                                            const city =
                                                cities.find(
                                                    (
                                                        item
                                                    ) =>
                                                        item.name
                                                            ?.toLowerCase()
                                                            .includes(
                                                                posters[
                                                                    posterIndex
                                                                ].location.toLowerCase()
                                                            )
                                                );

                                            if (
                                                city
                                            ) {
                                                handleDestinationSearch(
                                                    city
                                                );
                                            } else {
                                                document
                                                    .getElementById(
                                                        "hotel-results"
                                                    )
                                                    ?.scrollIntoView(
                                                        {
                                                            behavior:
                                                                "smooth"
                                                        }
                                                    );
                                            }
                                        }}
                                        className="mt-8 rounded-xl bg-[#f4f1e8] px-7 py-3.5 text-sm font-semibold text-[#111311]"
                                    >
                                        Explore{" "}
                                        {
                                            posters[
                                                posterIndex
                                            ].location
                                        }
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-8 right-5 flex gap-2 sm:right-8 lg:right-10">
                        <button
                            type="button"
                            onClick={() =>
                                movePoster(
                                    "previous"
                                )
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#111311]/60 text-white backdrop-blur-md"
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                movePoster("next")
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#111311]/60 text-white backdrop-blur-md"
                        >
                            →
                        </button>
                    </div>

                    <div className="absolute bottom-10 left-5 flex gap-2 sm:left-8 lg:left-10">
                        {posters.map(
                            (poster, index) => (
                                <button
                                    key={
                                        poster.title
                                    }
                                    type="button"
                                    onClick={() =>
                                        setPosterIndex(
                                            index
                                        )
                                    }
                                    className={`h-1 rounded-full transition-all ${
                                        index ===
                                        posterIndex
                                            ? "w-10 bg-white"
                                            : "w-5 bg-white/30"
                                    }`}
                                />
                            )
                        )}
                    </div>
                </div>
            </section>

            {!loading && cities.length > 0 && (
                <section
                    data-reveal
                    className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
                >
                    <div className="mb-10 max-w-xl">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                            03 / Hotel destinations
                        </p>

                        <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                            Where will you check in?
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-white/40">
                            Choose a destination and explore
                            hotels available around the city.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {cities
                            .slice(0, 7)
                            .map((city, index) => (
                                <motion.button
                                    key={getCityId(
                                        city
                                    )}
                                    type="button"
                                    onClick={() =>
                                        handleDestinationSearch(
                                            city
                                        )
                                    }
                                    whileHover={{
                                        y: -7
                                    }}
                                    whileTap={{
                                        scale: 0.98
                                    }}
                                    className="group relative h-64 overflow-hidden rounded-[22px] border border-white/10 text-left"
                                >
                                    <motion.img
                                        src={
                                            destinationImages[
                                                index %
                                                    destinationImages.length
                                            ]
                                        }
                                        alt={
                                            city.name
                                        }
                                        className="h-full w-full object-cover"
                                        whileHover={{
                                            scale: 1.08
                                        }}
                                        transition={{
                                            duration: 0.8
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/90 via-[#111311]/20 to-transparent" />

                                    <div className="absolute bottom-5 left-5">
                                        <p className="font-serif text-2xl">
                                            {
                                                city.name
                                            }
                                        </p>

                                        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/50">
                                            Hotels &
                                            stays
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                    </div>
                </section>
            )}

            {!loading &&
                trendingHotels.length > 0 && (
                    <section
                        data-reveal
                        className="border-y border-white/10 bg-[#181a17]"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                            <div className="mb-9 flex items-end justify-between gap-5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                                        04 / Highly rated
                                    </p>

                                    <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                                        Beautiful places
                                        to stay.
                                    </h2>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            moveTrending(
                                                "previous"
                                            )
                                        }
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white"
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            moveTrending(
                                                "next"
                                            )
                                        }
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg text-white/60 transition hover:border-white/30 hover:text-white"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {visibleTrendingHotels.map(
                                    (
                                        hotel,
                                        index
                                    ) =>
                                        renderHotelCard(
                                            hotel,
                                            trendingIndex +
                                                index
                                        )
                                )}
                            </div>
                        </div>
                    </section>
                )}

            <section
                data-reveal
                className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
            >
                <div className="mb-12 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                        05 / The Wander stay
                    </p>

                    <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                        Everything you need before check-in.
                    </h2>

                    <p className="mt-5 text-sm leading-7 text-white/40">
                        Search, compare and choose your hotel
                        without losing sight of the journey.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            number: "01",
                            icon: "⌂",
                            title: "Great locations",
                            text: "Find hotels close to beaches, cities, mountains and places worth exploring."
                        },
                        {
                            number: "02",
                            icon: "▱",
                            title: "Room choices",
                            text: "Explore available stays and choose the room that fits your trip."
                        },
                        {
                            number: "03",
                            icon: "₹",
                            title: "Clear pricing",
                            text: "See starting prices before moving forward with your booking."
                        },
                        {
                            number: "04",
                            icon: "↗",
                            title: "Easy exploring",
                            text: "Move from destination discovery to your hotel in just a few steps."
                        }
                    ].map((item) => (
                        <motion.div
                            key={item.number}
                            whileHover={{
                                y: -7
                            }}
                            className="rounded-[22px] border border-white/10 bg-[#181a17] p-7"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-sm text-white/60">
                                    {item.icon}
                                </span>

                                <span className="text-[10px] text-white/25">
                                    {item.number}
                                </span>
                            </div>

                            <h3 className="mt-9 font-serif text-2xl">
                                {item.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-white/40">
                                {item.text}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section
                id="hotel-results"
                className="border-t border-white/10 bg-[#111311]"
            >
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
                                {searched
                                    ? "Search Results"
                                    : "All Available Hotels"}
                            </p>

                            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                                {destination
                                    ? `Hotels in ${getCityName(
                                          destination
                                      )}`
                                    : "Choose your stay."}
                            </h2>

                            {!loading && (
                                <p className="mt-3 text-sm text-white/40">
                                    {
                                        filteredHotels.length
                                    }{" "}
                                    {filteredHotels.length ===
                                    1
                                        ? "hotel"
                                        : "hotels"}{" "}
                                    available
                                </p>
                            )}
                        </div>

                        {destination && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="self-start rounded-xl border border-white/10 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-white/50 transition hover:border-white/25 hover:text-white sm:self-auto"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            className="rounded-[24px] border border-red-400/20 bg-red-400/5 p-7"
                        >
                            <p className="text-sm text-red-300">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="mt-5 rounded-xl border border-red-400/20 px-5 py-2.5 text-xs text-red-200 transition hover:bg-red-400/10"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}

                    {loading && !error && (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="overflow-hidden rounded-[24px] border border-white/10 bg-[#181a17]"
                                    >
                                        <div className="h-64 animate-pulse bg-white/5" />

                                        <div className="space-y-4 p-6">
                                            <div className="h-5 w-2/3 animate-pulse rounded bg-white/5" />

                                            <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />

                                            <div className="h-3 w-full animate-pulse rounded bg-white/5" />

                                            <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredHotels.length ===
                            0 && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 30
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                className="rounded-[24px] border border-white/10 bg-[#181a17] px-6 py-20 text-center"
                            >
                                <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                                    No hotels found
                                </p>

                                <h3 className="mt-4 font-serif text-3xl">
                                    Try another destination.
                                </h3>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                                    We couldn't find
                                    any hotels matching
                                    your selected city.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        clearSearch
                                    }
                                    className="mt-7 rounded-xl bg-[#f4f1e8] px-6 py-3 text-sm font-semibold text-[#111311] transition hover:bg-white"
                                >
                                    Explore All Hotels
                                </button>
                            </motion.div>
                        )}

                    {!loading &&
                        !error &&
                        filteredHotels.length >
                            0 && (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredHotels.map(
                                    (
                                        hotel,
                                        index
                                    ) => {
                                        const image =
                                            getHotelImage(
                                                hotel,
                                                index
                                            );

                                        const price =
                                            getHotelPrice(
                                                hotel
                                            );

                                        const rating =
                                            getRating(
                                                hotel
                                            );

                                        const amenities =
                                            getAmenities(
                                                hotel
                                            );

                                        const cityName =
                                            getHotelCityName(
                                                hotel
                                            );

                                        return (
                                            <motion.article
                                                key={
                                                    hotel._id ||
                                                    hotel.id ||
                                                    index
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 40
                                                }}
                                                whileInView={{
                                                    opacity: 1,
                                                    y: 0
                                                }}
                                                viewport={{
                                                    once: true,
                                                    amount: 0.1
                                                }}
                                                transition={{
                                                    duration: 0.65,
                                                    delay:
                                                        (index %
                                                            3) *
                                                        0.08
                                                }}
                                                whileHover={{
                                                    y: -8
                                                }}
                                                className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#181a17]"
                                            >
                                                <div className="relative h-64 overflow-hidden">
                                                    <motion.img
                                                        src={
                                                            image
                                                        }
                                                        alt={
                                                            hotel.name ||
                                                            "Hotel"
                                                        }
                                                        className="h-full w-full object-cover"
                                                        whileHover={{
                                                            scale: 1.08
                                                        }}
                                                        transition={{
                                                            duration: 0.8
                                                        }}
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.src =
                                                                fallbackHotelImages[
                                                                    index %
                                                                        fallbackHotelImages.length
                                                                ];
                                                        }}
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/80 via-transparent to-transparent" />

                                                    {rating !==
                                                        null && (
                                                        <div className="absolute right-4 top-4 rounded-xl border border-white/15 bg-[#111311]/80 px-3 py-2 text-xs backdrop-blur-md">
                                                            ★{" "}
                                                            {
                                                                rating
                                                            }
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-4 left-5">
                                                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/60">
                                                            {cityName ||
                                                                "India"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="font-serif text-2xl tracking-tight">
                                                        {
                                                            hotel.name
                                                        }
                                                    </h3>

                                                    {hotel.description && (
                                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/40">
                                                            {
                                                                hotel.description
                                                            }
                                                        </p>
                                                    )}

                                                    {amenities.length >
                                                        0 && (
                                                        <div className="mt-5 flex flex-wrap gap-2">
                                                            {amenities
                                                                .slice(
                                                                    0,
                                                                    3
                                                                )
                                                                .map(
                                                                    (
                                                                        amenity,
                                                                        amenityIndex
                                                                    ) => (
                                                                        <span
                                                                            key={`${amenity}-${amenityIndex}`}
                                                                            className="rounded-lg border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/40"
                                                                        >
                                                                            {
                                                                                amenity
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}

                                                            {amenities.length >
                                                                3 && (
                                                                <span className="rounded-lg border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30">
                                                                    +
                                                                    {amenities.length -
                                                                        3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                                                        <div>
                                                            {price !==
                                                            null ? (
                                                                <>
                                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                                                                        Starting
                                                                        from
                                                                    </p>

                                                                    <p className="mt-1 text-lg font-semibold">
                                                                        ₹
                                                                        {Number(
                                                                            price
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                        <span className="ml-1 text-xs font-normal text-white/35">
                                                                            /
                                                                            night
                                                                        </span>
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-xs text-white/35">
                                                                    View
                                                                    rooms
                                                                    for
                                                                    pricing
                                                                </p>
                                                            )}
                                                        </div>

                                                        <motion.button
                                                            type="button"
                                                            whileHover={{
                                                                scale: 1.05
                                                            }}
                                                            whileTap={{
                                                                scale: 0.96
                                                            }}
                                                            onClick={() =>
                                                                handleViewHotel(
                                                                    hotel
                                                                )
                                                            }
                                                            className="rounded-xl bg-[#f4f1e8] px-5 py-2.5 text-xs font-semibold text-[#111311]"
                                                        >
                                                            View
                                                            Rooms
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                </div>
            </section>
        </div>
    );
};

export default Hotels;