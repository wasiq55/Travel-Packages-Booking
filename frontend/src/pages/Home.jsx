import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import {
  getHomeZones,
  getHomeStates,
  getHomeCities,
  getHomePlaces,
  getHomeHotels,
} from "../api/homeApi";



const images = {
  hero: "/images/hero.jpg",
  coast: "/images/goa.jpg",
  mountain: "/images/mountain.jpg",
  forest: "/images/forest.jpg",
  hotel: "/images/hotel.jpg",
  lake: "/images/lake.jpg",
  desert: "/images/desert.jpg",
  city: "/images/city.jpg",
};

const fallbackDestinations = [
  {
    name: "Goa",
    location: "Goa, India",
    image: images.coast,
    meta: "COAST / 01",
  },
  {
    name: "Himachal",
    location: "Himachal Pradesh, India",
    image: images.mountain,
    meta: "MOUNTAIN / 02",
  },
  {
    name: "Meghalaya",
    location: "Meghalaya, India",
    image: images.forest,
    meta: "FOREST / 03",
  },
  {
    name: "Udaipur",
    location: "Rajasthan, India",
    image: images.lake,
    meta: "LAKE / 04",
  },
  {
    name: "Jaisalmer",
    location: "Rajasthan, India",
    image: images.desert,
    meta: "DESERT / 05",
  },
  {
    name: "Mumbai",
    location: "Maharashtra, India",
    image: images.city,
    meta: "CITY / 06",
  },
];

const fallbackHotels = [
  {
    name: "The Fern House",
    location: "Coorg, Karnataka",
    image: images.hotel,
  },
  {
    name: "The Lake Retreat",
    location: "Udaipur, Rajasthan",
    image: images.lake,
  },
  {
    name: "Mountain View Stay",
    location: "Manali, Himachal Pradesh",
    image: images.mountain,
  },
];

const motionStyle = `
.home-motion-text {
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  filter: blur(8px);
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-text.home-motion-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  filter: blur(0);
}

.home-motion-image {
  clip-path: inset(12%);
  transform: scale(1.06);
  transition:
    clip-path 900ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-image.home-motion-in {
  clip-path: inset(0);
  transform: scale(1);
}

.home-motion-card-image {
  transition: transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-card:hover .home-motion-card-image {
  transform: scale(1.06);
}

.home-motion-title {
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-card:hover .home-motion-title {
  transform: translate3d(10px, 0, 0);
}

.home-motion-arrow {
  display: inline-block;
  transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-link:hover .home-motion-arrow {
  transform: rotate(45deg);
}

.home-motion-btn {
  transition:
    filter 300ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-btn:hover {
  filter: brightness(0.88);
}

.home-motion-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition: background-size 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-underline:hover {
  background-size: 100% 1px;
}

.home-motion-letter {
  display: inline-block;
  transform: translate3d(0, 110%, 0);
  opacity: 0;
  transition:
    transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-letter.home-motion-in {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

.home-motion-hero-image {
  transform: scale(1.1);
  transition: transform 1600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-hero-image.home-motion-hero-image-in {
  transform: scale(1);
}

.home-motion-magnetic {
  will-change: transform;
}

.home-motion-cursor {
  position: fixed;
  left: 0;
  top: 0;
  width: 92px;
  height: 92px;
  margin-left: -46px;
  margin-top: -46px;
  pointer-events: none;
  z-index: 9998;
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 300ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-cursor.home-motion-cursor-on {
  opacity: 1;
  transform: scale(1);
}

.home-motion-cursor-inner {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: #ff3d17;
  color: #0d0d0b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 500;
}

.home-motion-slat-section {
  position: relative;
  overflow: hidden;
}

.home-motion-slat {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 50;
  pointer-events: none;
  background: #0d0d0b;
  transform-origin: 50% 0;
  transform: scaleY(1);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-motion-slat-section.home-motion-slats-in .home-motion-slat {
  transform: scaleY(0);
}

.home-motion-letter-wrap {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .home-motion-text {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .home-motion-image {
    clip-path: inset(0) !important;
    transform: none !important;
  }

  .home-motion-letter {
    transform: none !important;
    opacity: 1 !important;
  }

  .home-motion-hero-image {
    transform: none !important;
  }

  .home-motion-slat {
    display: none !important;
  }

  .home-motion-cursor {
    display: none !important;
  }
}
`;

function getList(response, key) {
  const result = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.[key])) {
    return result[key];
  }

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  return [];
}

function getName(item, fallback) {
  return (
    item?.name ||
    item?.title ||
    item?.cityName ||
    item?.placeName ||
    item?.hotelName ||
    fallback
  );
}

function getLocation(item) {
  return (
    item?.location?.name ||
    item?.city?.name ||
    item?.cityName ||
    item?.state?.name ||
    item?.stateName ||
    (typeof item?.location === "string" ? item.location : "") ||
    ""
  );
}

function getImage(item, fallback) {
  const image =
    item?.image ||
    item?.imageUrl ||
    item?.coverImage ||
    item?.thumbnail ||
    item?.photos?.[0]?.url ||
    item?.photos?.[0];

  if (!image || typeof image !== "string") {
    return fallback;
  }

  const value = image.trim();

  if (!value) {
    return fallback;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return `http://localhost:5000/${value.replace(/^\/+/, "")}`;
}

function splitText(text) {
  return Array.from(text).map((character, index) => (
    <span
      key={`${character}-${index}`}
      className="home-motion-letter home-motion-in"
      style={{
        transitionDelay: `${index * 45}ms`,
      }}
    >
      {character === " " ? "\u00A0" : character}
    </span>
  ));
}

function SafeImage({
  src,
  alt,
  className = "",
  fallback = images.hero,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(src || fallback);

  useEffect(() => {
    setImageSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={imageSrc || fallback}
      alt={alt}
      className={className}
      onError={() => {
        if (fallback && imageSrc !== fallback) {
          setImageSrc(fallback);
        }
      }}
      {...props}
    />
  );
}

function WebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let renderer;
    let frame;
    let observer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

    camera.position.z = 10;

    const count = 140;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] =
        (Math.random() - 0.5) * 18;

      positions[i * 3 + 1] =
        (Math.random() - 0.5) * 11;

      positions[i * 3 + 2] =
        (Math.random() - 0.5) * 5;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.025,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });

    const particles = new THREE.Points(
      geometry,
      material
    );

    scene.add(particles);

    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;

      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(resize);
      observer.observe(canvas);
    }

    resize();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const startTime = performance.now();

    const animate = () => {
      frame = requestAnimationFrame(animate);

      if (!reducedMotion) {
        const time =
          (performance.now() - startTime) / 1000;

        particles.rotation.y = time * 0.015;
        particles.rotation.x =
          Math.sin(time * 0.1) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function LouverHero({ slides }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);
  const [heroImageReady, setHeroImageReady] = useState(false);

  const heroRef = useRef(null);
  const touchStart = useRef(null);
  const timeoutRef = useRef(null);

  const total = slides.length;

  const next = () => {
    if (animating || total < 2) {
      return;
    }

    setAnimating(true);
    setHeroImageReady(false);

    setActive(
      (value) => (value + 1) % total
    );

    window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setAnimating(false);
    }, 750);
  };

  const previous = () => {
    if (animating || total < 2) {
      return;
    }

    setAnimating(true);
    setHeroImageReady(false);

    setActive(
      (value) => (value - 1 + total) % total
    );

    window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setAnimating(false);
    }, 750);
  };

  useEffect(() => {
    setHeroImageReady(false);
  }, [active]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "ArrowRight") {
        next();
      }

      if (event.key === "ArrowLeft") {
        previous();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [animating, total]);

  useEffect(() => {
    const handleWheel = (event) => {
      if (!heroRef.current) {
        return;
      }

      const rect =
        heroRef.current.getBoundingClientRect();

      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight
      ) {
        return;
      }

      if (Math.abs(event.deltaY) < 18) {
        return;
      }

      if (event.deltaY > 0) {
        next();
      } else {
        previous();
      }
    };

    window.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, [animating, total]);

  useEffect(() => {
    if (total < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!animating) {
        setAnimating(true);
        setHeroImageReady(false);

        setActive(
          (value) => (value + 1) % total
        );

        window.clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {
          setAnimating(false);
        }, 750);
      }
    }, 4500);

    return () => {
      window.clearInterval(timer);
    };
  }, [total, animating]);

  useEffect(() => {
    return () => {
      window.clearTimeout(
        timeoutRef.current
      );
    };
  }, []);

  const handlePointerMove = (event) => {
    const rect =
      heroRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const value =
      (event.clientX - rect.left) /
      rect.width;

    setMouseX(
      Math.max(0, Math.min(1, value))
    );
  };

  const handlePointerDown = (event) => {
    touchStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event) => {
    if (!touchStart.current) {
      return;
    }

    const distance =
      event.clientX - touchStart.current.x;

    touchStart.current = null;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance < 0) {
      next();
    } else {
      previous();
    }
  };

  if (!total) {
    return null;
  }

  const current = slides[active];
  const nextSlide =
    slides[(active + 1) % total];

  return (
    <section
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative isolate min-h-screen overflow-hidden bg-[#111311] text-white"
    >
      <WebGLBackground />

      <div className="absolute inset-0">
        <SafeImage
          src={current.image}
          alt={current.name}
          fallback={images.hero}
          onLoad={() =>
            setHeroImageReady(true)
          }
          className={`home-motion-hero-image h-full w-full object-cover ${heroImageReady
              ? "home-motion-hero-image-in"
              : ""
            }`}
        />

        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/75 via-transparent to-[#111311]/20" />
      </div>

      <div className="relative z-20 flex min-h-screen flex-col px-5 pb-7 pt-6 sm:px-8 lg:px-10">
        <div className="flex justify-between">
          <div className="home-motion-text home-motion-in">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/45">
              WANDER INDIA
            </p>

            <p className="mt-2 font-serif text-2xl tracking-[-0.05em]">
              Travel / 2026
            </p>
          </div>

          <div className="hidden text-right sm:block home-motion-text home-motion-in">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
              Interactive destination wall
            </p>

            <p className="mt-2 text-xs text-white/60">
              Move / Scroll / Drag
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div
            className="relative h-[62vh] min-h-[420px] w-[92vw] max-w-[1250px] sm:h-[68vh]"
            style={{
              perspective: "1500px",
            }}
          >
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map(
                (_, index) => {
                  const progress =
                    index / 19;

                  const cursorDistance =
                    progress - mouseX;

                  const tilt = Math.max(
                    -8,
                    Math.min(
                      8,
                      cursorDistance * -12
                    )
                  );

                  const animationRotation =
                    animating
                      ? progress < 0.5
                        ? 85
                        : -85
                      : 0;

                  return (
                    <div
                      key={index}
                      className="absolute top-0 h-full"
                      style={{
                        left: `${progress * 100}%`,
                        width: "5.2%",
                        transformStyle:
                          "preserve-3d",
                        transform: `translateX(-50%) rotateY(${tilt +
                          animationRotation
                          }deg)`,
                        transition: animating
                          ? "transform 750ms cubic-bezier(.16,1,.3,1)"
                          : "transform 160ms ease-out",
                        zIndex: 50 - index,
                      }}
                    >
                      <div
                        className="relative h-full w-full overflow-hidden border-r border-white/20 bg-black"
                        style={{
                          transformStyle:
                            "preserve-3d",
                        }}
                      >
                        <SafeImage
                          src={current.image}
                          alt={current.name}
                          fallback={images.hero}
                          draggable="false"
                          className="absolute h-full max-w-none object-cover opacity-100"
                          style={{
                            width: "1920%",
                            left: `${-(progress * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 z-[60] border border-white/20" />

            <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center px-6 text-center">
              <div>
                <p className="home-motion-text home-motion-in text-[9px] uppercase tracking-[0.4em] text-white/75 sm:text-[10px]">
                  {current.meta}
                </p>

                <h1 className="home-motion-letter-wrap mt-5 font-serif text-6xl leading-[0.85] tracking-[-0.07em] drop-shadow-2xl sm:text-8xl lg:text-[120px]">
                  {splitText(current.name)}
                </h1>

                <p className="home-motion-text home-motion-in mt-5 text-[10px] uppercase tracking-[0.3em] text-white/75 sm:text-xs">
                  {current.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
          <div className="home-motion-text home-motion-in">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
              Next
            </p>

            <p className="mt-2 font-serif text-lg">
              {nextSlide.name}
            </p>
          </div>

          <div className="text-center home-motion-text home-motion-in">
            <p className="font-mono text-xs">
              {String(active + 1).padStart(
                2,
                "0"
              )}

              <span className="mx-2 text-white/30">
                /
              </span>

              {String(total).padStart(
                2,
                "0"
              )}
            </p>

            <div className="mt-3 h-px w-32 bg-white/20 sm:w-48">
              <div
                className="h-full bg-white transition-all duration-700"
                style={{
                  width: `${((active + 1) /
                      total) *
                    100
                    }%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/trip-builder"
              className="home-motion-btn home-motion-magnetic home-motion-link rounded-full border border-white/25 px-5 py-3 text-[9px] uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
            >
              Plan this trip{" "}
              <span className="home-motion-arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reveal({
  children,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      element.classList.add(
        "home-motion-in"
      );
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add(
              "home-motion-in"
            );

            observer.disconnect();
          }
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -5% 0px",
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`home-motion-text ${className}`}
    >
      {children}
    </div>
  );
}

function MotionImage({
  src,
  alt,
  className = "",
  fallback = images.hero,
  ...props
}) {
  const ref = useRef(null);

  const [imageSrc, setImageSrc] =
    useState(src || fallback);

  useEffect(() => {
    setImageSrc(src || fallback);
  }, [src, fallback]);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      element.classList.add(
        "home-motion-in"
      );
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add(
              "home-motion-in"
            );

            observer.disconnect();
          }
        },
        {
          threshold: 0.08,
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <img
      ref={ref}
      src={imageSrc || fallback}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (
          fallback &&
          imageSrc !== fallback
        ) {
          setImageSrc(fallback);
        }
      }}
      className={`home-motion-image ${className}`}
      {...props}
    />
  );
}

function DestinationCard({
  item,
  className = "",
}) {
  if (!item) {
    return null;
  }

  return (
    <Link
      to="/trip-builder"
      data-motion-card
      className={`home-motion-card home-motion-link group relative block overflow-hidden bg-[#e9e6dd] p-2 ${className}`}
    >
      <div className="relative h-full min-h-0 overflow-hidden">
        <MotionImage
          src={item.image}
          alt={item.name}
          fallback={images.hero}
          className="home-motion-card-image h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="home-motion-title font-serif text-3xl tracking-[-0.04em]">
                {item.name}
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/75">
                {item.location}
              </p>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:opacity-100">
              <span className="home-motion-arrow">
                ↗
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SlatReveal({
  children,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      element.classList.add(
        "home-motion-slats-in"
      );
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => {
              element.classList.add(
                "home-motion-slats-in"
              );
            }, 80);

            observer.disconnect();
          }
        },
        {
          threshold: 0.12,
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`home-motion-slat-section ${className}`}
    >
      {children}

      {Array.from({ length: 20 }).map(
        (_, index) => (
          <span
            key={index}
            className="home-motion-slat"
            style={{
              left: `${(index * 100) / 20}%`,
              width: `${100 / 20 + 0.2}%`,
              transitionDelay: `${index * 60}ms`,
            }}
          />
        )
      )}
    </div>
  );
}

function useMotionLayer() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (reduced || !finePointer) {
      return;
    }

    const magneticElements =
      Array.from(
        document.querySelectorAll(
          ".home-motion-magnetic"
        )
      );

    const cleanups = [];

    magneticElements.forEach((element) => {
      const handleMove = (event) => {
        const rect =
          element.getBoundingClientRect();

        const x =
          ((event.clientX -
            rect.left) /
            rect.width -
            0.5) *
          14;

        const y =
          ((event.clientY -
            rect.top) /
            rect.height -
            0.5) *
          14;

        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };

      const handleLeave = () => {
        element.style.transform =
          "translate3d(0, 0, 0)";
      };

      element.addEventListener(
        "pointermove",
        handleMove
      );

      element.addEventListener(
        "pointerleave",
        handleLeave
      );

      cleanups.push(() => {
        element.removeEventListener(
          "pointermove",
          handleMove
        );

        element.removeEventListener(
          "pointerleave",
          handleLeave
        );
      });
    });

    const cursor =
      document.createElement("div");

    cursor.className =
      "home-motion-cursor";

    const cursorInner =
      document.createElement("div");

    cursorInner.className =
      "home-motion-cursor-inner";

    cursorInner.textContent =
      "View ↗";

    cursor.appendChild(cursorInner);

    document.body.appendChild(cursor);

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let animationFrame;

    const handlePointerMove = (
      event
    ) => {
      targetX = event.clientX;
      targetY = event.clientY;

      const target = event.target;

      const card =
        target instanceof Element
          ? target.closest(
            "[data-motion-card]"
          )
          : null;

      if (card) {
        cursor.classList.add(
          "home-motion-cursor-on"
        );
      } else {
        cursor.classList.remove(
          "home-motion-cursor-on"
        );
      }
    };

    const animateCursor = () => {
      currentX +=
        (targetX - currentX) * 0.16;

      currentY +=
        (targetY - currentY) * 0.16;

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      animationFrame =
        requestAnimationFrame(
          animateCursor
        );
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );

    animationFrame =
      requestAnimationFrame(
        animateCursor
      );

    cleanups.push(() => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      cancelAnimationFrame(
        animationFrame
      );

      cursor.remove();
    });

    return () => {
      cleanups.forEach((cleanup) =>
        cleanup()
      );
    };
  }, []);
}

export default function Home() {
  const [zones, setZones] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);

  useMotionLayer();

  useEffect(() => {
    const style =
      document.createElement("style");

    style.setAttribute(
      "data-home-motion",
      "true"
    );

    style.textContent = motionStyle;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      const results =
        await Promise.allSettled([
          getHomeZones(),
          getHomeStates(),
          getHomeCities(),
          getHomePlaces(),
          getHomeHotels(),
        ]);

      if (!active) {
        return;
      }

      const values = results.map(
        (result) =>
          result.status === "fulfilled"
            ? result.value
            : []
      );

      setZones(
        getList(values[0], "zones")
      );

      setStates(
        getList(values[1], "states")
      );

      setCities(
        getList(values[2], "cities")
      );

      setPlaces(
        getList(values[3], "places")
      );

      setHotels(
        getList(values[4], "hotels")
      );
    };

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  const destinationCards =
    Array.from({ length: 6 }, (_, index) => {
      const place = places[index];
      const fallback =
        fallbackDestinations[index];

      return {
        name: place
          ? getName(
            place,
            fallback.name
          )
          : fallback.name,
        location: place
          ? getLocation(place) ||
          fallback.location
          : fallback.location,
        image: fallback.image,
        meta: fallback.meta,
      };
    });

  const hotelCards =
    Array.from({ length: 3 }, (_, index) => {
      const hotel = hotels[index];

      const fallback =
        fallbackHotels[
        index % fallbackHotels.length
        ];

      if (!hotel) {
        return fallback;
      }

      return {
        name: getName(
          hotel,
          `Stay ${index + 1}`
        ),
        location:
          getLocation(hotel) ||
          fallback.location,
        image: getImage(
          hotel,
          fallback.image
        ),
      };
    });

  return (
    <main className="overflow-hidden bg-[#f2f0e9] text-[#171b18]">
      <LouverHero
        slides={destinationCards}
      />

      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
                  01 — The journey
                </p>

                <p className="mt-8 max-w-sm font-serif text-3xl leading-tight tracking-[-0.04em]">
                  India is not one
                  destination. It is
                  thousands of different
                  stories.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[100px]">
                  Find the place
                  <br />
                  <span className="italic text-black/35">
                    that feels yours.
                  </span>
                </h2>

                <p className="mt-9 max-w-xl text-sm leading-7 text-black/50 sm:text-base">
                  Explore cities,
                  coastlines, mountains,
                  forests and hidden
                  places. Choose what
                  interests you and build
                  the journey around it.
                </p>

                <Link
                  to="/trip-builder"
                  className="home-motion-link home-motion-underline mt-8 inline-flex items-center gap-4 pb-2 text-sm"
                >
                  Start planning
                  <span className="home-motion-arrow">
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#171b18] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {[
                [
                  zones.length || "04",
                  "Regions",
                ],
                [
                  states.length || "28",
                  "States",
                ],
                [
                  cities.length || "100+",
                  "Cities",
                ],
                [
                  places.length || "500+",
                  "Places",
                ],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-r border-white/10 px-5 py-8 last:border-0 sm:px-8 sm:py-12"
                >
                  <p className="font-serif text-5xl tracking-[-0.06em] sm:text-7xl">
                    {value}
                  </p>

                  <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/35">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#e5e3db] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
              02 — Destinations
            </p>

            <h2 className="mt-7 max-w-4xl font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[100px]">
              Places that
              <br />
              <span className="italic text-black/35">
                pull you in.
              </span>
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <DestinationCard
                item={destinationCards[0]}
                className="h-[500px] sm:h-[650px]"
              />
            </Reveal>

            <Reveal className="lg:col-span-5 lg:pt-28">
              <DestinationCard
                item={destinationCards[1]}
                className="h-[420px] sm:h-[540px]"
              />
            </Reveal>

            <Reveal className="lg:col-span-4 lg:pt-12">
              <DestinationCard
                item={destinationCards[2]}
                className="h-[400px] sm:h-[480px]"
              />
            </Reveal>

            <Reveal className="lg:col-span-8">
              <DestinationCard
                item={destinationCards[3]}
                className="h-[450px] sm:h-[600px]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
                  03 — Stays
                </p>

                <h2 className="mt-7 font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-7xl">
                  Stay
                  <br />
                  somewhere
                  <br />
                  <span className="italic text-black/35">
                    beautiful.
                  </span>
                </h2>

                <p className="mt-8 max-w-sm text-sm leading-7 text-black/50">
                  Find a place that feels
                  right after a day of
                  exploring.
                </p>

                <Link
                  to="/hotels"
                  className="home-motion-link home-motion-underline mt-8 inline-flex items-center gap-4 pb-2 text-sm"
                >
                  Browse hotels
                  <span className="home-motion-arrow">
                    ↗
                  </span>
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <DestinationCard
                  item={hotelCards[0]}
                  className="h-[450px] sm:mt-20 sm:h-[540px]"
                />

                <DestinationCard
                  item={hotelCards[1]}
                  className="h-[450px] sm:h-[540px]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#dcdad2] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="grid gap-14 lg:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
                  04 — Trip builder
                </p>

                <h2 className="mt-7 font-serif text-5xl leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[90px]">
                  Build it
                  <br />
                  <span className="italic text-black/35">
                    your way.
                  </span>
                </h2>
              </div>

              <div>
                {[
                  [
                    "01",
                    "Choose a direction",
                    "Start with a zone, state, city or place.",
                  ],
                  [
                    "02",
                    "Collect places",
                    "Choose the destinations you want to visit.",
                  ],
                  [
                    "03",
                    "Find your stay",
                    "Pick hotels and rooms for your journey.",
                  ],
                  [
                    "04",
                    "Create your trip",
                    "Bring everything together into one itinerary.",
                  ],
                ].map(
                  ([number, title, text]) => (
                    <div
                      key={number}
                      className="home-motion-text grid grid-cols-[55px_1fr] border-t border-black/15 py-7"
                    >
                      <span className="font-mono text-xs text-black/35">
                        {number}
                      </span>

                      <div>
                        <h3 className="font-serif text-2xl">
                          {title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-black/50">
                          {text}
                        </p>
                      </div>
                    </div>
                  )
                )}

                <Link
                  to="/trip-builder"
                  className="home-motion-btn home-motion-magnetic home-motion-link mt-8 inline-flex rounded-full bg-[#171b18] px-7 py-4 text-[9px] uppercase tracking-[0.2em] text-white"
                >
                  Build itinerary{" "}
                  <span className="home-motion-arrow ml-2">
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SlatReveal className="min-h-[650px] bg-[#171b18] px-5 py-28 text-white sm:px-8 lg:min-h-[750px] lg:px-12 lg:py-40">
        <SafeImage
          src={images.hero}
          fallback={images.hero}
          alt="Goa, India"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[#171b18]/35" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#171b18]/90 via-[#171b18]/30 to-[#171b18]/20" />

        <div className="relative z-[60]">
          <Reveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/50">
                05 — Next destination
              </p>

              <h2 className="mt-8 font-serif text-6xl leading-[0.85] tracking-[-0.07em] sm:text-8xl lg:text-[125px]">
                Where will
                <br />
                you go?
              </h2>

              <p className="mx-auto mt-9 max-w-xl text-sm leading-7 text-white/55">
                Choose a destination,
                find a stay and build a
                journey that belongs to
                you.
              </p>

              <Link
                to="/trip-builder"
                className="home-motion-btn home-motion-magnetic home-motion-link mt-10 inline-flex rounded-full bg-[#f2f0e9] px-8 py-4 text-[9px] uppercase tracking-[0.2em] text-[#171b18]"
              >
                Start your journey{" "}
                <span className="home-motion-arrow ml-2">
                  ↗
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </SlatReveal>
    </main>
  );
}