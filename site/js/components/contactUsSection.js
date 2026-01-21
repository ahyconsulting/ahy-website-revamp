(function () {
    // Ensure GSAP plugins required are registered
    function registerPlugins() {
        if (window.gsap) {
            const { ScrollTrigger, SplitText } = window;
            try {
                gsap.registerPlugin(ScrollTrigger, SplitText);
            } catch (e) {
                // Already registered / not available — ignore
            }
        }
    }


    function initButtonAnimation() {
        const buttons = document.querySelectorAll('.contactUs-center-btn');

        buttons.forEach(button => {
            const defaultText = button.getAttribute("data-default");
            const hoverText = button.getAttribute("data-hover");
            const wrapper = button.querySelector('.contactUs-btn-text-wrapper');

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

    async function loadContactContentFromJSON() {
        const pageKey = document.body.getAttribute("data-page") || "hyva";
        const jsonPath = "js/components/contact/contact-section.json";

        try {
            const res = await fetch(jsonPath, { cache: "no-cache" });
            if (!res.ok) throw new Error("Failed to fetch contact JSON: " + res.status);
            const data = await res.json();
            // fallback to hyva if pageKey not present
            return data[pageKey] || data["hyva"] || null;
        } catch (err) {
            console.warn("Contact content load error:", err);
            return null;
        }
    }
    document.querySelectorAll('.btn-anim').forEach(button => {
                const text = button.textContent.trim();
                const spans = text.split('').map(char => {
                    // Replace spaces with non-breaking space entity to preserve them
                    return char === ' ' ? '&nbsp;' : char;
                }).join('</span><span>');
                button.innerHTML = '<div><span>' + spans + '</span></div>';
            });
    function injectContent(content) {
        if (!content) return;

        const titleEl = document.querySelector(".contact-title");
        const subEl = document.querySelector(".contact-sub");
        const btnEl = document.querySelector(".contact-btn");
        const bgTextEl = document.querySelector(".contact-bg-text");

        if (titleEl) titleEl.innerHTML = content.title || "";
        if (subEl) subEl.textContent = content.subtitle || "";
        if (btnEl) btnEl.textContent = content.button || "Contact Us";
        if (bgTextEl) bgTextEl.textContent = content.bgText || "";
    }

    function runAnimations() {
        // Only run animations if GSAP + SplitText exist
        if (!window.gsap || !window.SplitText || !window.ScrollTrigger) {
            // If SplitText plugin isn't loaded, run a simpler fade-in.
            const wrapper = document.querySelector(".contact-wrapper");
            if (wrapper) {
                gsap && gsap.from(wrapper, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
            }
            return;
        }

        // Create SplitText instances AFTER content injected
        const contactTitleSplit = new SplitText(".contact-title", { type: "words, chars" });
        const contactSubSplit = new SplitText(".contact-sub", { type: "words, chars" });

        gsap.from(contactTitleSplit.chars, {
            scrollTrigger: { trigger: ".contact-wrapper", start: "top 80%" },
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.6,
            ease: "power2.out",
        });

        gsap.from(contactSubSplit.chars, {
            scrollTrigger: { trigger: ".contact-wrapper", start: "top 80%" },
            opacity: 0,
            y: 20,
            stagger: 0.03,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.3,
        });

        gsap.from(".contact-btn", {
            scrollTrigger: { trigger: ".contact-wrapper", start: "top 80%" },
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.6,
        });

        // subtle bg text animation
        gsap.from(".contact-bg-text", {
            scrollTrigger: { trigger: ".contact-section", start: "top 85%", once: true },
            opacity: 0,
            y: 40,
            duration: 1.4,
            ease: "power3.out",
        });
    }

    async function init() {
        registerPlugins();
        initButtonAnimation();

        const content = await loadContactContentFromJSON();
        injectContent(content);
        runAnimations();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();