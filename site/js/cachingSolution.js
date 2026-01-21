class ComponentLoader {
    constructor() {
        this.componentsPath = './components/';
        this.cssPath = './css/components/';
        this.jsPath = './js/components/';
        this.loadedComponents = new Set();
        this.version =  Date.now();
    }

    async loadComponent(name) {
        if (this.loadedComponents.has(name)) return;

        try {
            // Load HTML (VERSIONED)
            const htmlResponse = await fetch(
                `${this.componentsPath}${name}.html?v=${this.version}`,
                { cache: 'no-store' } // ensures latest HTML
            );
            const html = await htmlResponse.text();
            await this.loadCSS(name);

            // Insert HTML
            const placeholders = document.querySelectorAll(`[data-component="${name}"]`);
            placeholders.forEach(placeholder => {
                placeholder.innerHTML = html;
                placeholder.removeAttribute('data-component');
            });

            //Load JS (VERSIONED)
            await this.loadJS(name);

            this.loadedComponents.add(name);
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
        }
    }

    loadCSS(name) {
        return new Promise((resolve) => {
            // prevent duplicate CSS
            if (document.querySelector(`link[data-css="${name}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.cssPath}${name}.css?v=${this.version}`;
            link.dataset.css = name;
            link.onload = resolve;
            link.onerror = resolve;
            document.head.appendChild(link);
        });
    }

    loadJS(name) {
        return new Promise((resolve) => {
            // prevent duplicate JS
            if (document.querySelector(`script[data-js="${name}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `${this.jsPath}${name}.js?v=${this.version}`;
            script.dataset.js = name;
            script.defer = true;
            script.onload = resolve;
            script.onerror = resolve;
            document.body.appendChild(script);
        });
    }

    async loadAll() {
        const components = document.querySelectorAll('[data-component]');
        const componentNames = [...components].map(el => el.getAttribute('data-component'));
        const uniqueNames = [...new Set(componentNames)];

        for (const name of uniqueNames) {
            await this.loadComponent(name);
        }

        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAll();
});