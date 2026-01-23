(function () {
    // Track component loading state
    const loadingState = {
        contentLoaded: false,
        componentsLoaded: false,
        animationsReady: false
    };

    async function loadHeroContent() {
        const pageKey = document.body.getAttribute("data-page") || "hyva";
        const jsonPath = "js/components/hero/hero-section.json";

        try {
            const res = await fetch(jsonPath, { cache: "no-cache" });
            if (!res.ok) throw new Error("Hero JSON load error: " + res.status);

            const data = await res.json();
            return data[pageKey] || data["hyva"];
        } catch (err) {
            console.warn(err);
            return null;
        }
    }

    function injectHeroContent(content) {
        if (!content) return;

        const titleEl = document.getElementById("service-hero-text");
        const subEl = document.getElementById("hero-subtext");

        if (titleEl) titleEl.innerHTML = content.title || "";
        if (subEl) subEl.textContent = content.subtitle || "";
    }

    function runHeroAnimation() {
        gsap.registerPlugin(SplitText, ScrollTrigger);

        let split;

        function splitHeroText() {
            const heroText = document.getElementById("service-hero-text");
            if (!heroText) return;

            // Force a layout calculation before splitting
            heroText.offsetHeight;

            let text = heroText.innerHTML.trim();
            let words = text
                .replace(/<br>/g, " <br> ")
                .split(" ")
                .filter(Boolean);

            heroText.innerHTML = "";

            words.forEach((word) => {
                if (word === "<br>") {
                    heroText.appendChild(document.createElement("br"));
                    return;
                }

                const wordWrapper = document.createElement("span");
                wordWrapper.className = "word";
                wordWrapper.style.display = "inline-block";

                [...word].forEach((letter) => {
                    const letterSpan = document.createElement("span");
                    letterSpan.className = "letter";
                    letterSpan.textContent = letter;
                    wordWrapper.appendChild(letterSpan);
                });

                heroText.appendChild(wordWrapper);
                heroText.appendChild(document.createTextNode(" "));
            });

            // Force layout calculation after DOM changes
            heroText.offsetHeight;
        }

        function animateHeroText() {
            const letters = document.querySelectorAll(
                ".service-hero-title .letter"
            );
            if (!letters.length) return;

            // Set initial state using GSAP from the start
            gsap.set(letters, { 
                opacity: 0, 
                y: 80,
                willChange: "transform, opacity"
            });

            // Small delay to ensure DOM is settled
            gsap.to(letters, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                stagger: { 
                    each: 0.03,
                    ease: "power2.inOut"
                },
                clearProps: "willChange",
                delay: 0.1
            });
        }

        function animateSubText() {
            const subTextElement = document.querySelector(".line-split-text-hero");
            if (!subTextElement) return;

            split = new SplitText(".line-split-text-hero", { 
                type: "lines",
                linesClass: "line-child"
            });

            gsap.set(split.lines, {
                opacity: 0,
                rotationX: -90,
                transformOrigin: "50% 50%",
                transformPerspective: 500
            });

            gsap.to(split.lines, {
                rotationX: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.18,
                delay: 0.4
            });
        }

        // Execute in sequence with proper timing
        splitHeroText();
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                animateHeroText();
                animateSubText();
            });
        });
    }

    // Wait for all components to load
    function waitForComponents() {
        return new Promise((resolve) => {
            const checkComponents = () => {
                // Check if all data-component elements are loaded
                const components = document.querySelectorAll('[data-component]');
                const allLoaded = Array.from(components).every(comp => {
                    return comp.children.length > 0 || comp.innerHTML.trim() !== '';
                });

                if (allLoaded) {
                    resolve();
                } else {
                    requestAnimationFrame(checkComponents);
                }
            };

            // Add a timeout to prevent infinite waiting
            setTimeout(() => resolve(), 5000);
            checkComponents();
        });
    }

    // Wait for images and media to load
    function waitForMedia() {
        return new Promise((resolve) => {
            const images = Array.from(document.images);
            const videos = Array.from(document.querySelectorAll('video'));
            
            let loadedCount = 0;
            const totalCount = images.length + videos.length;

            if (totalCount === 0) {
                resolve();
                return;
            }

            const checkComplete = () => {
                loadedCount++;
                if (loadedCount >= totalCount) {
                    resolve();
                }
            };

            images.forEach(img => {
                if (img.complete) {
                    checkComplete();
                } else {
                    img.addEventListener('load', checkComplete);
                    img.addEventListener('error', checkComplete);
                }
            });

            videos.forEach(video => {
                if (video.readyState >= 3) {
                    checkComplete();
                } else {
                    video.addEventListener('loadeddata', checkComplete);
                    video.addEventListener('error', checkComplete);
                }
            });

            // Timeout fallback
            setTimeout(resolve, 3000);
        });
    }

    function checkAllLoaded() {
        const allReady = Object.values(loadingState).every(state => state === true);
        
        if (allReady) {
            hideLoader();
        }
    }

    function hideLoader() {
        const loader = document.getElementById("hero-loader");
        const heroSection = document.querySelector(".line-split-section");

        // Hide loader with fade out
        if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }

        // Show hero content with fade in
        if (heroSection) {
            heroSection.style.opacity = "1";
        }
    }

    async function init() {
        const loader = document.getElementById("hero-loader");
        const heroSection = document.querySelector(".line-split-section");

        // Show loader, hide hero content
        if (loader) loader.style.display = "block";
        if (heroSection) heroSection.style.opacity = "0";

        try {
            // Load dynamic content
            const content = await loadHeroContent();
            injectHeroContent(content);
            loadingState.contentLoaded = true;
            
            // Wait for all components to load
            await waitForComponents();
            loadingState.componentsLoaded = true;
            
            // Wait for media to load
            await waitForMedia();
            
            // Additional small delay to ensure everything is settled
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Run animations only AFTER everything is ready
            runHeroAnimation();
            loadingState.animationsReady = true;

            // Check if everything is loaded
            checkAllLoaded();

        } catch (error) {
            console.error("Error during initialization:", error);
            // Hide loader even on error after a delay
            setTimeout(hideLoader, 5000);
        }
    }

    // Also listen for the window load event as a fallback
    window.addEventListener('load', () => {
        loadingState.componentsLoaded = true;
        checkAllLoaded();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();