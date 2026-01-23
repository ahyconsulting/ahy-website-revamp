class ComponentLoader {
    constructor() {
        this.componentsPath = './components/';
        this.cssPath = './css/components/';
        this.jsPath = './js/components/';
        this.loadedComponents = new Set();
    }

    async loadComponent(name) {
        if (this.loadedComponents.has(name)) return;

        try {
            // Load HTML
            const htmlResponse = await fetch(`${this.componentsPath}${name}.html`);
            const html = await htmlResponse.text();

            // Load CSS
            await this.loadCSS(name);

            // Insert HTML into all placeholders
            const placeholders = document.querySelectorAll(`[data-component="${name}"]`);
            placeholders.forEach(placeholder => {
                placeholder.innerHTML = html;
                placeholder.removeAttribute('data-component');
            });

            // Load and execute JS
            await this.loadJS(name);

            this.loadedComponents.add(name);
        } catch (error) {
            // console.error(`Error loading component ${name}:`, error);
        }
    }

    loadCSS(name) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.cssPath}${name}.css`;
            link.onload = resolve;
            link.onerror = () => resolve();
            document.head.appendChild(link);
        });
    }

    loadJS(name) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `${this.jsPath}${name}.js`;
            script.onload = resolve;
            script.onerror = () => resolve();
            document.body.appendChild(script);
        });
    }

    async loadAll() {
        const components = document.querySelectorAll('[data-component]');
        const componentNames = [...components].map(el => el.getAttribute('data-component'));
        const uniqueNames = [...new Set(componentNames)];

        // Load critical components first so the page can show/hide loaders sooner.
        const critical = ['heroSection', 'header', 'rotatingBadge'];
        const criticalToLoad = uniqueNames.filter(n => critical.includes(n));
        const remaining = uniqueNames.filter(n => !critical.includes(n));

        // Load critical components sequentially
        for (const name of criticalToLoad) {
            await this.loadComponent(name);
        }

        // Notify listeners that critical components are available
        document.dispatchEvent(new CustomEvent('criticalComponentsLoaded', { detail: { components: criticalToLoad } }));

        // Load remaining components sequentially
        for (const name of remaining) {
            await this.loadComponent(name);
        }

        // Final event when all components finished loading
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAll();
});