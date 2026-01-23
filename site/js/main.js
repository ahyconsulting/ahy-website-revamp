// REVERTED main.js - Optimized for minimal TBT
if (window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}
// State
let smoother;
let cachedViewportWidth = window.innerWidth;

// Utility to break up long tasks
const yieldToMain = () =>
    new Promise((resolve) => {
        if ("scheduler" in window && "yield" in scheduler) {
            scheduler.yield().then(resolve);
        } else {
            setTimeout(resolve, 0);
        }
    });

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

// Init - CHUNKED to reduce TBT
document.addEventListener(
    "componentsLoaded",
    async () => {
        // Task 1: ScrollSmoother (critical)
        try {
            window.smoother = initScrollSmoother();
        } catch (e) {
            console.error("ScrollSmoother init failed:", e);
        }

        await yieldToMain();

        // Task 2: GSAP animations (can be deferred)
        initIntroPinWithAboutUs();
    },
    { once: true }
);

function initScrollSmoother() {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
        smoothTouch: 0.1,
        normalizeScroll: true,
        ignoreMobileResize: true,
        speed: 0.7,
        maxSpeed: 3,
    });

    window.addEventListener(
        "resize",
        debounce(() => {
            cachedViewportWidth = window.innerWidth;
            smoother?.refresh();
        }, 250),
        { passive: true }
    );

    return smoother;
}

function initIntroPinWithAboutUs() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const intro = document.querySelector(".intro");
    const aboutUs = document.querySelector(".about-scroll-container");
    if (!aboutUs) return;

    const isMobileView = cachedViewportWidth <= 900;

    if (isMobileView) {
        // On mobile: ensure aboutUs is visible and positioned correctly
        gsap.set(aboutUs, { opacity: 1 });

        // Ensure intro is completely hidden on mobile
        if (intro) {
            intro.style.display = "none";
        }

        // Single refresh after all changes
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
    }

    // Desktop only: intro pinning
    if (!intro) return;

    ScrollTrigger.create({
        trigger: intro,
        start: "top top",
        endTrigger: aboutUs,
        end: "top top",
        pin: true,
        pinSpacing: false,
        scrub: true,
        pinnedContainer: "#smooth-content",
    });

    gsap.to(intro, {
        opacity: 1,
        scrollTrigger: {
            trigger: aboutUs,
            start: "top bottom",
            end: "top top",
            scrub: true,
            pinnedContainer: "#smooth-content",
            onUpdate: (self) => {
                intro.style.opacity = 1 - self.progress;
                intro.style.pointerEvents = self.progress > 0.1 ? "none" : "";
            },
        },
    });

    gsap.fromTo(
        aboutUs,
        { opacity: 0 },
        {
            opacity: 1,
            scrollTrigger: {
                trigger: aboutUs,
                start: "top bottom",
                end: "top top",
                scrub: true,
                pinnedContainer: "#smooth-content",
            },
        }
    );

    requestAnimationFrame(() => ScrollTrigger.refresh());
}

window.addEventListener(
    "beforeunload",
    () => {
        try {
            if (window.aboutUsThreeCleanup) window.aboutUsThreeCleanup();
        } catch (e) { }
        if (smoother) smoother.kill();
    },
    { once: true }
);

// Allow native scrolling inside cookie consent modal
window.addEventListener("load", () => {
    const ccRoot = document.getElementById("cc--main");
    if (!ccRoot) return;

    ["wheel", "touchstart", "touchmove"].forEach((event) => {
        ccRoot.addEventListener(event, (e) => e.stopPropagation(), { passive: true });
    });
});


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        // Optional: listen for updates
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available — you can prompt user to refresh
            //   console.log('New content available; consider refreshing.');
            }
          });
        });
      })
      .catch(err => {
        // console.error('ServiceWorker registration failed:', err);
      });
  });
}
