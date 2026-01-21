(function () {
    // --- 1. SETUP BUTTON TEXT & ANIMATION ---
    function initButtonAnimation() {
        const buttons = document.querySelectorAll('.prefooter-center-btn');

        buttons.forEach(button => {
            const defaultText = button.getAttribute("data-default");
            const hoverText = button.getAttribute("data-hover");
            const wrapper = button.querySelector('.btn-text-wrapper');

            // Helper to wrap letters in spans
            function splitToSpans(text) {
                return text.split('').map(char => 
                    `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');
            }

            // Inject HTML with Grid structure
            wrapper.innerHTML = `
                <div class="text-default">${splitToSpans(defaultText)}</div>
                <div class="text-hover">${splitToSpans(hoverText)}</div>
            `;

            // Select chars
            const defaultChars = wrapper.querySelectorAll('.text-default .char');
            const hoverChars = wrapper.querySelectorAll('.text-hover .char');

            // Hover Events
            button.addEventListener('mouseenter', () => {
                // Animate OLD text UP and fade out
                gsap.to(defaultChars, {
                    y: '-100%',
                    opacity: 0,
                    stagger: 0.02,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });

                // Animate NEW text UP from bottom
                gsap.to(hoverChars, {
                    y: '0%',
                    opacity: 1,
                    stagger: 0.02,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });
            });

            button.addEventListener('mouseleave', () => {
                // Reverse: New text goes back DOWN
                gsap.to(hoverChars, {
                    y: '100%',
                    opacity: 0,
                    stagger: 0.02,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });

                // Reverse: Old text comes back DOWN
                gsap.to(defaultChars, {
                    y: '0%',
                    opacity: 1,
                    stagger: 0.02,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });
            });
        });
    }


    // --- INITIALIZATION ---
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            initButtonAnimation();
            // initAirplaneAnimation();
            // initHeader();
        });
    } else {
        initButtonAnimation();
        // initAirplaneAnimation();
        // initHeader();
    }

})();