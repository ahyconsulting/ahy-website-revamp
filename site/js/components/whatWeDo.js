(function () {
    function initHeader() {
        ScrollTrigger.create({
            trigger: ".featured-services",
            start: "top bottom",
            end: "top top",
            scrub: 1,
            onUpdate: (self) => {
                const headers = document.querySelectorAll(
                    ".featured-services-header"
                );
                gsap.set(headers[0], { x: `${100 - self.progress * 100}%` });
                gsap.set(headers[1], { x: `${-100 + self.progress * 100}%` });
                gsap.set(headers[2], { x: `${100 - self.progress * 100}%` });
            },
        });

        ScrollTrigger.create({
            trigger: ".featured-services",
            start: "top top",
            end: `+=${window.innerHeight * 2}`,
            pin: true,
            scrub: 1,
            pinSpacing: false,
            onUpdate: (self) => {
                const headers = document.querySelectorAll(
                    ".featured-services-header"
                );
                if (self.progress <= 0.5) {
                    const yProgress = self.progress / 0.5;
                    
                    // Fade out top header as it moves up
                    const topOpacity = 1 - yProgress;
                    gsap.set(headers[0], { y: `${-yProgress * 100}%`, opacity: topOpacity });
                    
                    // Keep center visible
                    gsap.set(headers[1], { opacity: 1 });
                    
                    // Fade out bottom header as it moves down
                    const bottomOpacity = 1 - yProgress;
                    gsap.set(headers[2], { y: `${yProgress * 100}%`, opacity: bottomOpacity });
                    
                } else {
                    gsap.set(headers[0], { y: `-100%`, opacity: 0 });
                    gsap.set(headers[2], { y: `100%`, opacity: 0 });

                    const scaleProgress = (self.progress - 0.5) / 0.5;
                    const minScale = window.innerWidth < 1000 ? 0.35 : 0.1;
                    const scale = 1 - scaleProgress * (1 - minScale);
                    
                    // Fade out center header as it scales down
                    const centerOpacity = 1 - scaleProgress;

                    headers.forEach((header) => {
                        gsap.set(header, { scale: scale });
                    });
                    
                    gsap.set(headers[1], { opacity: centerOpacity });
                }
            },
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();