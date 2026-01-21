!(function () {
    let prefooterInitialized = false;

    /* ===============================
       🔹 LAZY INIT (heavy animations)
    ================================ */
    async function initPrefooterAnimations() {
        if (prefooterInitialized) return;
        prefooterInitialized = true;

        await loadMotionPathPlugin();

        initPlane();
        initTextTimeline();
        initParallaxPills();

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.refresh();
    }

    function loadMotionPathPlugin() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/js/MotionPath.min.js?v=dev";
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initPrefooterAnimations();
                    observer.disconnect();
                }
            });
        },
        { rootMargin: "20% 0px" }
    );

    const target = document.querySelector(".prefooter-section-sub-hero");
    if (target) observer.observe(target);

    /* ===============================
       🔘 BUTTON SLOT HOVER
    ================================ */
    function initButtons() {
        document.querySelectorAll(".prefooter-center-btn").forEach(btn => {
            const def = btn.dataset.default || btn.textContent.trim();
            const hov = btn.dataset.hover || def;
            const wrap = btn.querySelector(".btn-text-wrapper");

            const chars = txt =>
                txt.split("").map(c =>
                    `<span class="char">${c === " " ? "&nbsp;" : c}</span>`
                ).join("");

            wrap.innerHTML = `
                <div class="text-default">${chars(def)}</div>
                <div class="text-hover">${chars(hov)}</div>
            `;

            const d = wrap.querySelectorAll(".text-default .char");
            const h = wrap.querySelectorAll(".text-hover .char");

            const enter = () => {
                gsap.to(d, { y: "-100%", opacity: 0, stagger: 0.02, duration: 0.4 });
                gsap.to(h, { y: "0%", opacity: 1, stagger: 0.02, duration: 0.4 });
            };

            const leave = () => {
                gsap.to(h, { y: "100%", opacity: 0, stagger: 0.02, duration: 0.4 });
                gsap.to(d, { y: "0%", opacity: 1, stagger: 0.02, duration: 0.4 });
            };

            btn.addEventListener("mouseenter", enter);
            btn.addEventListener("mouseleave", leave);
            btn.addEventListener("focus", enter);
            btn.addEventListener("blur", leave);
        });
    }

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", initButtons)
        : initButtons();

    /* ===============================
       ✈ AIRPLANE ANIMATION
    ================================ */
    function initPlane() {
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        const plane = document.querySelector(".animated-object");
        const path = document.getElementById("motionPath");
        if (!plane || !path) return;

        const isMobile = window.innerWidth <= 768;
        const scrollDistance = isMobile ? 2000 : 3600;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".prefooter-section-sub-hero",
                start: "top top",
                end: "+=" + scrollDistance,
                scrub: 1
            }
        });

        tl.fromTo(
            plane,
            { autoAlpha: 0, scale: isMobile ? 2.5 : 10 },
            {
                autoAlpha: 1,
                motionPath: {
                    path: "#motionPath",
                    align: "#motionPath",
                    autoRotate: true
                },
                ease: "none"
            }
        );
    }

    /* ===============================
       📝 TEXT + CTA TIMELINE
    ================================ */
    function initTextTimeline() {
        const headings = gsap.utils.toArray(
            ".prefooter-appearance-1 .prefooter-heading-style-h2"
        );
        const btn = document.querySelector(".prefooter-center-btn");

        const isMobile = window.innerWidth <= 768;
        const scrollDistance = isMobile ? 1800 : 3200;

        gsap.set(btn, { opacity: 0, scale: 0.8, pointerEvents: "none" });
        gsap.set(".prefooter-center-text", { opacity: 0, y: 50 });

        const tl = gsap.timeline();

        headings.forEach(h => {
            tl.fromTo(h, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0);
        });

        tl.to(".prefooter-appearance-1", { opacity: 0, duration: 0.6 }, "+=0.2")
          .to(".prefooter-center-text", { opacity: 1, y: 0, duration: 1.2 }, "-=0.3")
          .to(btn, {
              opacity: 1,
              scale: 1,
              pointerEvents: "auto",
              duration: 1.2
          }, "-=0.8");

        ScrollTrigger.create({
            animation: tl,
            trigger: ".prefooter-section-sub-hero",
            start: "top top",
            end: "+=" + scrollDistance,
            scrub: 1,
            pin: true,
            anticipatePin: 1
        });
    }

    /* ===============================
       💊 PARALLAX PILLS
    ================================ */
    function initParallaxPills() {
        const pills = document.querySelectorAll(".parallax-pill");
        if (!pills.length) return;

        const isMobile = window.innerWidth <= 768;
        const scrollDistance = isMobile ? 500 : 600;

        pills.forEach((pill, i) => {
            const speed = parseFloat(pill.dataset.speed) || 1;
            const dir = i % 2 === 0 ? -1 : 1;

            gsap.to(pill, {
                y: dir * speed * (isMobile ? 160 : 280),
                ease: "none",
                scrollTrigger: {
                    trigger: ".prefooter-section-sub-hero",
                    start: "top top",
                    end: "+=" + scrollDistance,
                    scrub: 1
                }
            });
        });
    }
})();
