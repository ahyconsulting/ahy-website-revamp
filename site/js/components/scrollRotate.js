(function () {
    function initHeader() {
        const textEl = document.querySelector(".scroll-text");
        if (!textEl) return;

        console.log("ScrollRotate Initialized!");

        const circle = new CircleType(textEl).radius(5);

        let currentRotation = 0;
        let easeRotation = 0;

        function updateRotation() {
            easeRotation += (currentRotation - easeRotation) * 0.08;
            textEl.style.transform = `rotate(${easeRotation}deg)`;
            requestAnimationFrame(updateRotation);
        }

        updateRotation();

        window.addEventListener("scroll", () => {
            currentRotation = window.scrollY * 0.2;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();
