(function () {
    function numberSpeeksSection() {
        gsap.registerPlugin(ScrollTrigger, SplitText);

        // Calculate years since founding
        function calculateYearsSinceFounding() {
            const FOUNDING_YEAR = 2006;
            const currentYear = new Date().getFullYear();
            return currentYear - FOUNDING_YEAR;
        }

        // Update the years counter data-target dynamically
        const yearsCounter = document.querySelector('#years-counter .stat-number');
        if (yearsCounter) {
            yearsCounter.setAttribute('data-target', calculateYearsSinceFounding());
        }

        // ---------- SPLIT TEXT ANIMATION ----------
        const titleSplit = new SplitText(".stats-title", { type: "words, chars" });
        const subSplit = new SplitText(".stats-sub", { type: "words, chars" });

        // Title fade + unblur
        gsap.from(titleSplit.chars, {
            scrollTrigger: {
                trigger: ".stats-wrapper",
                start: "top 80%",
            },
            opacity: 0,
            y: 20,
            filter: "blur(6px)",
            stagger: 0.05,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "filter",
        });

        // Subtitle fade + unblur
        gsap.from(subSplit.chars, {
            scrollTrigger: {
                trigger: ".stats-wrapper",
                start: "top 80%",
            },
            opacity: 0,
            y: 20,
            filter: "blur(6px)",
            stagger: 0.03,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.3,
            clearProps: "filter",
        });

        // Stats row fade + unblur
        gsap.from(".stats-row", {
            scrollTrigger: {
                trigger: ".stats-wrapper",
                start: "top 80%",
            },
            opacity: 0,
            y: 30,
            filter: "blur(8px)",
            duration: 0.8,
            ease: "power2.out",
            delay: 0.6,
            clearProps: "filter",
        });

        // ---------- STATS COUNT ANIMATION ----------
        function animateNumbers() {
            document.querySelectorAll(".stat-number").forEach((num) => {
                let target = +num.dataset.target;

                gsap.fromTo(
                    num,
                    { innerText: 0 },
                    {
                        innerText: target,
                        duration: 2,
                        ease: "power1.out",
                        snap: { innerText: 1 },
                    }
                );
            });
        }

        ScrollTrigger.create({
            trigger: ".stats-wrapper",
            start: "top 60%",
            once: true,
            onEnter: animateNumbers,
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", numberSpeeksSection);
    } else {
        numberSpeeksSection();
    }
})();