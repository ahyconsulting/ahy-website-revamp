!(function () {
    const DOM = { container: null, centerContent: null, stickyWrap: null };
    const debounce = (fn, ms) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    };

    function init() {
        DOM.container = document.querySelector(".about-scroll-container");
        if (!DOM.container) return;
        
        // gsap.registerPlugin(ScrollTrigger);
        
        // Use consistent breakpoint with hero section
        const MOBILE_BREAKPOINT = 900;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= MOBILE_BREAKPOINT;
        let threeJSCleanup;

        // Simplified lighting config
        const LIGHTING = {
            ambientIntensity: isMobile ? 0.6 : 1,
            hemisphereIntensity: isMobile ? 0.85 : 0.35,
            directionalIntensity: isMobile ? 1.5 : 1,
            materialMetalness: isMobile ? 0.6 : 1,
            materialRoughness: isMobile ? 0.35 : 0.15
        };

        const FLOAT = { amplitude: 0.08, speed: 0.8, rotAmp: 0.03 };
        const TILT = { targetX: 0, targetY: 0, currentX: 0, currentY: 0, maxX: 0.25, maxY: 0.4, ease: 0.1 };

        function initFallback() {
            DOM.centerContent = document.querySelector(".about-center-content");
            if (!DOM.centerContent) return;

            const fragment = document.createDocumentFragment();

            // Wrapper holds the float animation (CSS) while the inner image receives tilt transforms from JS
            const wrap = document.createElement("div");
            wrap.className = "logo-static-wrap";

            const img = document.createElement("img");
            img.src = window.innerWidth <= MOBILE_BREAKPOINT 
              ? "assets/ahy-3d-illustration-mobile.webp"
              : "assets/ahy-3d-illustration.webp";
            img.alt = "AHY Illustration";
            img.setAttribute("width", "100%");
            img.setAttribute("height", "100%");
            img.className = "logo-static";
            img.loading = "lazy";
            img.decoding = "async";
            wrap.appendChild(img);
            fragment.appendChild(wrap);

            const overlay = document.createElement("div");
            overlay.className = "logo-overlay";
            fragment.appendChild(overlay);

            DOM.centerContent.appendChild(fragment);

            const progress = document.getElementById("progress-container");
            if (progress) progress.style.display = "none";

            requestAnimationFrame(() => {
                // Keep these events for compatibility with other code that listens for them
                document.dispatchEvent(new CustomEvent("3dModelLoaded"));
                document.dispatchEvent(new CustomEvent("hdrEnvLoaded"));
            });
            // No hover tilt: keep only cleanup that removes DOM elements
            threeJSCleanup = () => {
                try { overlay.remove(); } catch (e) {}
                try { wrap.remove(); } catch (e) {}
            };
        }

        function lazyInitThreeJS() {
            // No WebGL model — use a static illustration image instead.
            DOM.centerContent = document.querySelector(".about-center-content");
            if (!DOM.centerContent) return;

            // Insert the static illustration immediately (no dynamic imports)
            initFallback();
        }

        

        function handleResponsive() {
            const container = DOM.centerContent || document.querySelector(".about-center-content");
            if (!container) return;

            const isSmall = window.innerWidth <= MOBILE_BREAKPOINT;
            const img = container.querySelector("img.logo-fallback");
            const overlay = container.querySelector(".logo-overlay");
            const canvases = container.querySelectorAll("canvas");

            if (isSmall) {
                canvases.forEach(c => c.remove());
                if (!img) initFallback();
            } else {
                img?.remove();
                overlay?.remove();
            }
        }

        window.addEventListener("resize", debounce(handleResponsive, 120), { passive: true });
        function calculateYearsSinceFounding() {
            const FOUNDING_YEAR = 2006; // Set your company's founding year here
            const currentYear = new Date().getFullYear();
            return currentYear - FOUNDING_YEAR;
        }
        function animateCounters() {
            const counters = [
                { id: "#counter1 .count", target: 230 },
                { id: "#counter2 .count", target: calculateYearsSinceFounding()},
                { id: "#counter3 .count", target: 183 }
            ];

             counters.forEach(({ id, target }) => {
                const el = document.querySelector(id);
                if (!el) return;

                gsap.fromTo(el, 
                    { innerText: 0 },
                    {
                        innerText: target,
                        duration: 2,
                        ease: "power1.out",
                        snap: { innerText: 1 },
                        onUpdate: function() {
                            el.textContent = Math.floor(this.targets()[0].innerText);
                        }
                    }
                );
            });
        }

        function animatePartners() {
            const wrappers = document.querySelectorAll(".our-partner-logo-wrapper");

            wrappers.forEach((wrapper, index) => {
                const column = wrapper.querySelector(".our-partner-logo-column");
                if (!column) return;

                const items = Array.from(column.querySelectorAll("li")).filter(li => !li.classList.contains("clone"));
                if (!items.length) return;

                column.innerHTML = "";
                const fragment = document.createDocumentFragment();
                items.forEach(item => fragment.appendChild(item));

                const clone = items[0].cloneNode(true);
                clone.classList.add("clone");
                fragment.appendChild(clone);
                column.appendChild(fragment);

                const itemHeight = items[0].offsetHeight || 80;
                const tl = gsap.timeline({ 
                    repeat: -1, 
                    delay: 0.5 * index
                });

                for (let i = 0; i < items.length; i++) {
                    tl.to(column, { y: -(i + 1) * itemHeight, duration: 1.5, ease: "power2.inOut" }, "+=2");
                }
                tl.set(column, { y: 0 });
            });
        }

        // Initialize
        handleResponsive();
        // lazyInitThreeJS();
        initFallback();

        window.aboutUsThreeCleanup = () => {
            try { 
                if (typeof threeJSCleanup === "function") threeJSCleanup(); 
            } catch (err) {
                console.error('Cleanup failed:', err);
            }
        };

        // GSAP setup
        gsap.set(".about-bottom-panel", { opacity: 0 });
        gsap.set(".about-content", { opacity: 1 });
        gsap.set(".our-partner-section", { opacity: 0, y: 100 });

        (function setupScrollTrigger(retries = 20) {
            DOM.stickyWrap = document.querySelector(".about-sticky-wrap");
            if (!DOM.stickyWrap) return;

            const rect = DOM.stickyWrap.getBoundingClientRect();
            if ((rect.height === 0 || rect.width === 0) && retries > 0) {
                requestAnimationFrame(() => setupScrollTrigger(retries - 1));
                return;
            }

            const isSmall = window.innerWidth <= MOBILE_BREAKPOINT;
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: DOM.container,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: isSmall ? 0.5 : 1,
                    pin: ".about-sticky-wrap",
                    pinSpacing: true,
                    anticipatePin: isSmall ? 1 : 3
                }
            });

            if (isSmall) {
                tl.to(".about-bottom-panel", { opacity: 1, duration: 0.8, ease: "power2.out", onStart: animateCounters }, 0)
                  .addLabel("countersComplete", "+=0.5")
                  .to(".about-bottom-panel", { opacity: 0, duration: 0.6, ease: "power2.out" }, "countersComplete")
                  .to(".our-partner-section", { opacity: 1, y: 0, duration: 1, ease: "power2.out", onStart: animatePartners }, "countersComplete+=0.3")
                  .to(".about-main-frame", { scale: 0.6, borderRadius: "20px", duration: 1, ease: "power2.inOut" }, "countersComplete+=1.5");
            } else {
                tl.to(".about-bottom-panel", { opacity: 1, duration: 1.2, ease: "power3.out", onStart: animateCounters }, "-=0.8")
                  .addLabel("countersComplete", "+=0.8")
                  .to(".about-bottom-panel", { opacity: 0, duration: 1, ease: "power2.out" }, "countersComplete")
                  .to(".our-partner-section", { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", onStart: animatePartners }, "countersComplete+=0.5")
                  .to(".about-main-frame", { scale: 0.5, borderRadius: "26px", duration: 1.5, ease: "power2.inOut" }, "countersComplete+=2.5");
            }

            ScrollTrigger.refresh();
        })();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();