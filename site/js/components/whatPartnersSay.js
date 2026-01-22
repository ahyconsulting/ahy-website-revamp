(function () {
    function initWhatPartnersSay() {
        const section = document.querySelector(".whatPartnersSay-section");
        if (!section) return;

        // Title
        const title = section.querySelector(".whatPartnersSay-title");
        const cards = Array.from(
            section.querySelectorAll(".whatPartnersSay-card")
        );
        if (!title || !cards.length) return;

        // Register plugin if not already
        if (gsap && ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        // If GSAP or ScrollTrigger are missing, show content simply and bail
        if (!gsap || !ScrollTrigger) {
            cards.forEach((card) => {
                card.style.opacity = 1;
            });
            title.style.opacity = 1;
            return;
        }

        // prefer reduced motion
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) {
            // Make sure content is visible without animation, but keep a subtle rotation
            cards.forEach((card) => {
                const isLeft = card.classList.contains(
                    "whatPartnersSay-card--left"
                );
                const rotation =
                    gsap && gsap.utils
                        ? isLeft
                            ? gsap.utils.random(-12, -6)
                            : gsap.utils.random(6, 12)
                        : isLeft
                            ? -8
                            : 8;
                card.style.opacity = 1;
                card.style.transform = `rotate(${rotation}deg)`;
            });
            title.style.opacity = 1;
            return;
        }

        // Detect mobile so we can stack cards and animate them sequentially
        const isMobile = window.matchMedia("(max-width: 560px)").matches;

        // Setup initial states for cards (offscreen and randomly rotated)
        cards.forEach((card, idx) => {
            const isLeft = card.classList.contains(
                "whatPartnersSay-card--left"
            );
            // randomize rotation: larger initial tilt on desktop, smaller on mobile
            const initialRotation = isLeft
                ? gsap.utils.random(-25, -10)
                : gsap.utils.random(10, 25);
            const targetRotation = initialRotation * 0.25; // reduced magnitude toward straight but not zero
            card.dataset.initialRotation = initialRotation;
            card.dataset.targetRotation = targetRotation;

            if (isMobile) {
                // For stacked mobile layout: start slightly below and fade in with a small rotation
                const fromY = 60 + idx * 12; // staggered starting offsets for a nice fall-in
                gsap.set(card, {
                    x: 0,
                    y: fromY,
                    rotation: initialRotation * 0.6,
                    autoAlpha: 0,
                });
            } else {
                // Desktop/tablet: diagonal entry from left/right with larger offsets
                const fromX = isLeft
                    ? -gsap.utils.random(200, 450)
                    : gsap.utils.random(200, 450);
                const fromY = gsap.utils.random(40, 140);
                gsap.set(card, {
                    x: fromX,
                    y: fromY,
                    rotation: initialRotation,
                    autoAlpha: 0,
                });
            }
        });

        // Ensure title starts visible
        gsap.set(title, { opacity: 1, scale: 1, y: 0 });

        // Create timeline with ScrollTrigger
        // compute a longer 'end' distance to make the scroll feel longer and more gradual
        const endDistance = Math.max(
            window.innerHeight * 1.2,
            section.offsetHeight * 1.1,
            900
        );

        // For mobile we want the animation to start earlier and play over a shorter distance
        const mobileEndDistance = Math.max(
            window.innerHeight * 0.6,
            section.offsetHeight * 0.8,
            500
        );

        // kill any existing timeline attached to this section to avoid duplicate triggers
        if (section._whatPartnersTl) {
            try {
                section._whatPartnersTl.kill();
            } catch (e) { }
        }

        // choose start/end/scrub values depending on viewport size
        const scrollStart = isMobile ? "top 90%" : "top 60%";
        const scrollEnd = isMobile
            ? `+=${Math.round(mobileEndDistance)}`
            : `+=${Math.round(endDistance)}`;
        const scrubValue = isMobile ? 0.8 : 1.2;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: scrollStart,
                // extend the end distance so the animation plays over a longer scroll on desktop,
                // but shorter on mobile so cards don't appear too late
                end: scrollEnd,
                // use a numeric scrub to add smoothing (short inertia) to scroll-driven animation
                scrub: scrubValue,
                // markers: true,
                pin: false,
                onUpdate(self) {
                    // optional debug
                },
            },
        });

        // Title: scale down slightly but keep visible
        if (!isMobile) {
            // Desktop/tablet: scale and move up, but keep visible
            tl.to(title, { 
                scale: 0.92, 
                y: -20,
                opacity: 0.85,
                duration: 0.5, 
                ease: "power2.out" 
            });
        } else {
            // Mobile: animate position/scale but keep visible
            tl.to(title, {
                y: -20,          // slide up a bit as you scroll
                scale: 0.95,     // optional subtle scale
                opacity: 0.9,
                duration: 0.5,
                ease: "power2.out",
            });
        }


        // Cards: animate in. On mobile we animate stacked cards sequentially; on larger
        // screens we keep the diagonal incoming animation with small overlap.
        if (isMobile) {
            tl.to(
                cards,
                {
                    y: 0,
                    rotation: (i, el) =>
                        parseFloat(el.dataset.targetRotation) || 0,
                    autoAlpha: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    stagger: 0.18,
                },
                "-=0.3"
            );
        } else {
            // Animate each card individually so we can use a different final rotation per card
            cards.forEach((card, i) => {
                const targetRotation =
                    parseFloat(card.dataset.targetRotation) || 0;
                // animate translation and opacity; rotate toward targetRotation (not fully straight)
                tl.to(
                    card,
                    {
                        x: 0,
                        y: 0,
                        rotation: targetRotation,
                        autoAlpha: 1,
                        duration: 0.9,
                        ease: "power2.out",
                    },
                    `-=${0.4 - i * 0.03}`
                ); // small overlap with previous item
            });
        }

        // Refresh ScrollTrigger on resize/orientation change to re-calc start/end
        const handleRefresh = () => ScrollTrigger.refresh();
        window.addEventListener("resize", handleRefresh);
        window.addEventListener("orientationchange", handleRefresh);

        // store timeline so we can kill/reinit cleanly later on
        section._whatPartnersTl = tl;
    }

    // Init on DOM ready (or re-init when content loads)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWhatPartnersSay);
    } else {
        initWhatPartnersSay();
    }
})();
