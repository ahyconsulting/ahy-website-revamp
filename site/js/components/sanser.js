(function () {
    function initHeader() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        if (ScrollTrigger.isTouch === 1) {
            ScrollTrigger.normalizeScroll(true);
        }

        ScrollTrigger.config({ anticipatePin: 1 }); // Reduce pin jumps

        let isScrolling = false;

        function smoothTo(y) {
            isScrolling = true;
            gsap.to(window, {
                duration: 0.45,
                ease: "power2.out",
                scrollTo: { y, autoKill: true },
                onComplete: () => (isScrolling = false),
            });
        }

        const data = [
            {
                title: "Design",
                info: "Intuitive, UX focussed and clean design delivery.",
                svg: `<svg class="sanser-svg-fill" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path class="sanser-svg-fill" d="M576 320C576 320.9 576 321.8 576 322.7C575.6 359.2 542.4 384 505.9 384L408 384C381.5 384 360 405.5 360 432C360 435.4 360.4 438.7 361 441.9C363.1 452.1 367.5 461.9 371.8 471.8C377.9 485.6 383.9 499.3 383.9 513.8C383.9 545.6 362.3 574.5 330.5 575.8C327 575.9 323.5 576 319.9 576C178.5 576 63.9 461.4 63.9 320C63.9 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320zM192 352C192 334.3 177.7 320 160 320C142.3 320 128 334.3 128 352C128 369.7 142.3 384 160 384C177.7 384 192 369.7 192 352zM192 256C209.7 256 224 241.7 224 224C224 206.3 209.7 192 192 192C174.3 192 160 206.3 160 224C160 241.7 174.3 256 192 256zM352 160C352 142.3 337.7 128 320 128C302.3 128 288 142.3 288 160C288 177.7 302.3 192 320 192C337.7 192 352 177.7 352 160zM448 256C465.7 256 480 241.7 480 224C480 206.3 465.7 192 448 192C430.3 192 416 206.3 416 224C416 241.7 430.3 256 448 256z"/>
        </svg>`,
            },
            {
                title: "Build",
                info: "Highly responsive & optimised coding for faster load times.",
                svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Laptop Icon -->
          <rect class="sanser-svg-fill" x="15" y="25" width="70" height="45" rx="3"/>
          <rect class="sanser-svg-fill" fill="#16213e" x="20" y="30" width="60" height="35"/>
          <path class="sanser-svg-fill" d="M 10 70 L 15 75 L 85 75 L 90 70 Z"/>
          <circle class="sanser-svg-fill" cx="50" cy="73" r="2"/>
        </svg>`,
            },
            {
                title: "Deploy",
                info: "We ship your applications to one of the most secure infrastructures.",
                svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Rocket Icon -->
          <path class="sanser-svg-fill" d="M 50 15 L 60 40 L 70 55 L 65 60 L 50 50 L 35 60 L 30 55 L 40 40 Z"/>
          <ellipse class="sanser-svg-fill" cx="50" cy="35" rx="8" ry="12"/>
          <path class="sanser-svg-fill" d="M 35 60 L 30 75 L 35 70 Z"/>
          <path class="sanser-svg-fill" d="M 65 60 L 70 75 L 65 70 Z"/>
          <circle class="sanser-svg-fill" cx="50" cy="32" r="4" fill="#16213e"/>
          <path class="sanser-svg-fill" d="M 45 50 Q 42 60 45 68 Q 48 62 50 68 Q 52 62 55 68 Q 58 60 55 50 Z" opacity="0.8"/>
        </svg>`,
            },
        ];

        document.querySelectorAll(".sanser-total-number").forEach((el) => (el.textContent = data.length));

        function updateContent(front, back, step, fillProgress) {
            // Update text content
            document.querySelector(".sanser-front-title").textContent = front?.title || "";
            document.querySelector(".sanser-front-info").textContent = front?.info || "";
            document.querySelector(".sanser-back-title").textContent = back?.title || "";
            document.querySelector(".sanser-back-info").textContent = back?.info || "";
            document.querySelector(".sanser-front-svg").innerHTML = front?.svg || "";
            document.querySelector(".sanser-back-svg").innerHTML = back?.svg || "";

            // Apply fill color based on progress - fully transparent at start
            const fillColor = `rgba(236, 25, 101, ${fillProgress})`;
            const strokeColor = `rgba(196, 66, 112, ${fillProgress})`;

            document.querySelectorAll(".sanser-front-svg .sanser-svg-fill").forEach((el) => {
                el.style.fill = fillColor;
                el.style.stroke = strokeColor;
            });
            document.querySelectorAll(".sanser-back-svg .sanser-svg-fill").forEach((el) => {
                el.style.fill = fillColor;
                el.style.stroke = strokeColor;
            });
        }

        gsap.to(".sanser-section2", {
            scrollTrigger: {
                trigger: ".sanser-section2",
                start: "top top",
                end: "+=" + window.innerHeight * 5,
                pin: true,
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const total = data.length;

                    let index = Math.floor(progress * total);
                    if (index >= total) index = total - 1;

                    const frontIndex = index;
                    const backIndex = Math.min(index + 1, total - 1);

                    const conicVal = (progress * total - index) * 100;
                    const fillProgress = progress * total - index; // 0 to 1

                    // Update background conic gradient
                    document.querySelector(".sanser-background").style.setProperty("--sanser-conic-t", conicVal + "%");
                    document.querySelector(".sanser-background").style.setProperty("--sanser-conic-b", conicVal + "%");

                    // Rotate the card based on progress
                    document.querySelector(".sanser-card").style.setProperty("--sanser-rotate-y", -(index * 180) + "deg");

                    // Update the content
                    updateContent(data[frontIndex], data[backIndex], index + 1, fillProgress);
                },
            },
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();
