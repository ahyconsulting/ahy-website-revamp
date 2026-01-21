(function () {
    function initHeader() {
        gsap.registerPlugin(ScrollTrigger);

            const section = document.querySelector(".scrollableCards-section");
            const boxes = gsap.utils.toArray(".scrollableCards-box");
            const cards = gsap.utils.toArray(".scrollableCards-card");
            const initials = gsap.utils.toArray(".scrollableCards-initial");

            let boxEntrance = null;
            let cardSlide = null;

            function initScrollableCardsAnimations() {
                if (boxEntrance) boxEntrance.kill();
                if (cardSlide) cardSlide.kill();

                const isMobile = window.innerWidth <= 1024;

                // Box + initial entrance
                boxEntrance = ScrollTrigger.create({
                    trigger: section,
                    start: "top bottom",
                    end: "top top",
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        boxes.forEach((box, i) => {
                            const delay = 0.15;
                            const duration = 0.7;
                            const start = i * delay;
                            const end = start + duration;
                            const p = Math.min(Math.max((progress - start) / duration, 0), 1);
                            gsap.set(box, { y: `${125 - p * 125}%` });

                            const scaleDelay = 0.4;
                            const scaleProgress = Math.max(0, (p - scaleDelay) / (1 - scaleDelay));
                            gsap.set(initials[i], { scale: scaleProgress });
                        });
                    },
                });

                // Card slide + rotation + zoom
                cardSlide = ScrollTrigger.create({
                    trigger: section,
                    start: "top top",
                    end: `+=${window.innerHeight * 3}`,
                    pin: true,
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;

                        cards.forEach((card, i) => {
                            const slideDelay = 0.075;
                            const slideDuration = 0.4;
                            const start = i * slideDelay;
                            const end = start + slideDuration;

                            // Calculate zoom scale
                            const zoomStart = 0.2 + i * 0.12;
                            const zoomEnd = zoomStart + 0.4;
                            let scale = 0.8;
                            if (progress >= zoomStart && progress <= zoomEnd) {
                                const zp = (progress - zoomStart) / (zoomEnd - zoomStart);
                                scale = 0.8 + zp * 0.2;
                            } else if (progress > zoomEnd) {
                                scale = 1;
                            }

                            if (progress >= start && progress <= end) {
                                const p = (progress - start) / slideDuration;

                                if (isMobile) {
                                    const yStart = -150 - i * 50;
                                    const yEnd = -50;
                                    const rotationStart = 50 - i * 10;
                                    const rotationEnd = 0;
                                    gsap.set(card, {
                                        y: `${yStart + p * (yEnd - yStart)}%`,
                                        rotation: rotationStart + p * (rotationEnd - rotationStart),
                                        scale: scale,
                                        opacity: p,
                                    });
                                } else {
                                    const xStart = 100 + i * 50;
                                    const xEnd = -50;
                                    const rotationStart = 50 - i * 10;
                                    const rotationEnd = 0;
                                    gsap.set(card, {
                                        x: `${xStart + p * (xEnd - xStart)}%`,
                                        y: "-50%",
                                        rotation: rotationStart + p * (rotationEnd - rotationStart),
                                        scale: scale,
                                        opacity: p,
                                    });
                                }
                            } else if (progress > end) {
                                gsap.set(card, { x: "-50%", y: "-50%", rotation: 0, scale: scale, opacity: 1 });
                            } else {
                                gsap.set(card, { scale: 0.8, opacity: 0 });
                            }
                        });
                    },
                });
            }

            initScrollableCardsAnimations();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();
