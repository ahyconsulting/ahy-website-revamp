(function () {
    async function initHeader() {
        gsap.registerPlugin(MorphSVGPlugin);

        const accordionNav = document.querySelector(".faq-accordion-nav");
        const contentContainer = document.querySelector(".faq-accordion-content-container");
        const hoverBg = document.querySelector(".faq-hover-background");
        const morphPath = document.getElementById("faqMorphPath");

        // Determine current page
        const page = document.body.dataset.page || "home";

        // Fetch JSON data
        let sections = [];
        try {
            const res = await fetch("./js/components/faq/faq.json");
            const data = await res.json();
            sections = data[page] || [];
        } catch (err) {
            console.error("Failed to load FAQ data:", err);
            return;
        }

        if (!sections.length) return;

        let activeSection = 0; // Set first section as active dynamically
        let currentHoverIndex = -1;

        // Create accordion items and content dynamically
        sections.forEach((item, index) => {
            const accordionItem = document.createElement("div");
            accordionItem.className = "faq-accordion-item";
            if (index === activeSection) accordionItem.classList.add("active");

            accordionItem.innerHTML = `
                <div class="faq-accordion-title">
                    <span>${item.title}</span>
                    <div class="faq-accordion-icon"></div>
                </div>
            `;
            accordionNav.appendChild(accordionItem);

            const contentDiv = document.createElement("div");
            contentDiv.className = "faq-accordion-content";
            if (index === activeSection) contentDiv.classList.add("active");
            contentDiv.innerHTML = `
                <h2 class="faq-content-title">${item.contentTitle}</h2>
                <div class="faq-content-text">${item.content}</div>
            `;
            contentContainer.appendChild(contentDiv);

            accordionItem.addEventListener("click", () => switchSection(index));
            accordionItem.addEventListener("mouseenter", () => {
                handleHoverActiveState(index);
                onHover(index, accordionItem);
            });
        });

        // Switch accordion section
        function switchSection(index) {
            if (activeSection === index) return;

            const prevContent = contentContainer.querySelector(".faq-accordion-content.active");
            const newContent = contentContainer.children[index];
            const items = accordionNav.querySelectorAll(".faq-accordion-item");

            gsap.timeline().call(() => {
                prevContent.classList.remove("active");
                newContent.classList.add("active");
                items[activeSection].classList.remove("active");
                items[index].classList.add("active");
                activeSection = index;
            });
        }

        // Hover animation for left nav
        function onHover(index, element) {
            const rect = element.getBoundingClientRect();
            const navRect = accordionNav.getBoundingClientRect();
            const top = rect.top - navRect.top;
            const height = rect.height;
            const totalHeight = navRect.height;
            const svgTop = Math.max(0, Math.min(95, (top / totalHeight) * 100));
            const svgHeight = Math.max(5, Math.min(100 - svgTop, (height / totalHeight) * 100));
            const svgBottom = svgTop + svgHeight;
            const previousIndex = currentHoverIndex;
            const isMovingDown = index > previousIndex;
            const isMovingUp = index < previousIndex;
            const isLargeJump = Math.abs(index - previousIndex) > 1;

            gsap.set(hoverBg, { opacity: 1 });
            gsap.killTweensOf([morphPath, hoverBg]);

            const finalShape = `M0,${svgTop} L100,${svgTop} L100,${svgBottom} L0,${svgBottom} Z`;
            let intermediateShape;

            if (previousIndex !== -1 && previousIndex !== index && !isLargeJump) {
                const bendDepth = Math.min(svgHeight * 1.5, 30);
                const midX = 50;
                if (isMovingDown) {
                    const controlY = svgTop + bendDepth;
                    intermediateShape = `M0,${svgTop} L100,${svgTop} Q100,${controlY} ${midX},${controlY} Q0,${controlY} 0,${svgTop} Z`;
                } else if (isMovingUp) {
                    const controlY = Math.max(0, svgBottom - bendDepth);
                    intermediateShape = `M0,${svgBottom} L100,${svgBottom} Q100,${controlY} ${midX},${controlY} Q0,${controlY} 0,${svgBottom} Z`;
                }
            }

            const tl = gsap.timeline({
                onStart: () => gsap.set(hoverBg, { opacity: 1 }),
                onComplete: () => gsap.set(morphPath, { morphSVG: finalShape }),
            });

            if (intermediateShape && previousIndex !== -1 && !isLargeJump) {
                tl.to(morphPath, { morphSVG: intermediateShape, duration: 0.3, ease: "power2.out" }).to(morphPath, { morphSVG: finalShape, duration: 0.4, ease: "elastic.out(1,0.6)" }, 0.15);
            } else {
                if (isLargeJump && previousIndex !== -1) {
                    tl.to(hoverBg, { opacity: 0, duration: 0.1 }).set(morphPath, { morphSVG: finalShape }).to(hoverBg, { opacity: 1, duration: 0.3 });
                } else {
                    tl.to(morphPath, { morphSVG: finalShape, duration: 0.5, ease: "elastic.out(1,0.6)" });
                }
            }

            setTimeout(() => {
                if (currentHoverIndex === index) gsap.set(hoverBg, { opacity: 1 });
            }, 100);

            currentHoverIndex = index;
        }

        accordionNav.addEventListener("mouseleave", () => {
            currentHoverIndex = -1;
            gsap.to(hoverBg, { opacity: 0, duration: 0.4, ease: "power2.out" });

            // restore active highlight
            document.querySelectorAll(".faq-accordion-item").forEach((item) => {
                item.classList.remove("paused-active");
            });
        });

        // Initial animations
        gsap.fromTo(
            ".faq-accordion-item",
            { opacity: 0, x: -50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
            }
        );
        gsap.fromTo(
            ".faq-accordion-content.active",
            { y: 30, filter: "blur(10px)" },
            {
                y: 0,
                filter: "blur(0px)",
                duration: 0.8,
                delay: 0.4,
                ease: "power2.out",
            }
        );

        function handleHoverActiveState(hoverIndex) {
            const items = accordionNav.querySelectorAll(".faq-accordion-item");

            items.forEach((item, idx) => {
                if (item.classList.contains("active") && idx !== hoverIndex) {
                    item.classList.add("paused-active"); // temporarily disables active background
                } else {
                    item.classList.remove("paused-active");
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();
