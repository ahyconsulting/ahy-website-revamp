document.addEventListener("preloaderComplete", function () {    // obtain plugin
    var cc = initCookieConsent();
    document.body.classList.toggle('c_darkmode');
    // run plugin with your configuration
    cc.run({
        current_lang: "en",
        autoclear_cookies: true, // default: false
        page_scripts: true, // default: false

        // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
        // delay: 0,                               // default: 0
        // auto_language: '',                      // default: null; could also be 'browser' or 'document'
        // autorun: true,                          // default: true
        // force_consent: false,                   // default: false
        // hide_from_bots: false,                  // default: false
        // remove_cookie_tables: false             // default: false
        // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
        // cookie_expiration: 182,                 // default: 182 (days)
        // cookie_necessary_only_expiration: 182   // default: disabled
        // cookie_domain: location.hostname,       // default: current domain
        // cookie_path: '/',                       // default: root
        // cookie_same_site: 'Lax',                // default: 'Lax'
        // use_rfc_cookie: false,                  // default: false
        // revision: 0,                            // default: 0

        onFirstAction: function (user_preferences, cookie) {
            // callback triggered only once on the first accept/reject action
            console.log(user_preferences, cookie);
        },

        onAccept: function (cookie) {
            // callback triggered on the first accept/reject action, and after each page load
            console.log(cookie);
        },

        onChange: function (cookie, changed_categories) {
            // callback triggered when user changes preferences after consent has already been given
            console.log('User accept type:', user_preferences.accept_type);
            console.log('User accepted these categories', user_preferences.accepted_categories)
            console.log('User reject these categories:', user_preferences.rejected_categories);
            console.log(cookie, changed_categories);
        },
        gui_options: {
            consent_modal: {
                layout: 'cloud',               // box/cloud/bar
                position: 'bottom center',     // bottom/middle/top + left/right/center
                transition: 'zoom',           // zoom/slide
                swap_buttons: false            // enable to invert buttons
            },
            settings_modal: {
                layout: 'box',                 // box/bar
                // position: 'left',           // left/right
                transition: 'zoom'            // zoom/slide
            }
        },

        languages: {
            en: {
                consent_modal: {
                    title: "AhyConsulting.com Cookies!",
                    description:
                        'Our website by default only uses cookies and similar technology [hereinafter "Cookies"] for basic website functions / settings. If you want to stay with the default settings that we\'ve selected, please click "Manage Preferences" and "Save Settings". You may also change the default settings and allow cookies in the Manage Preferences section as per your choice. By clicking "Accept All" you allow all the cookies. <button type="button" data-cc="c-settings" class="cc-link">Manage Preferences</button>',
                    primary_btn: {
                        text: "Accept all",
                        role: "accept_all", // 'accept_selected' or 'accept_all'
                    },
                    secondary_btn: {
                        text: "Reject all",
                        role: "accept_necessary", // 'settings' or 'accept_necessary'
                    },
                },
                settings_modal: {
                    title: "Cookie preferences",
                    save_settings_btn: "Save settings",
                    accept_all_btn: "Accept all",
                    reject_all_btn: "Reject all",
                    close_btn_label: "Close",
                    cookie_table_headers: [
                        { col1: "Name" },
                        { col2: "Domain" },
                        { col3: "Expiration" },
                        { col4: "Description" },
                    ],
                    blocks: [
                        {
                            title: "Cookie usage",
                            description:
                                'We use different types of cookies to optimize your experience on our website. Click on the categories below to learn more about their purposes. You may choose which types of cookies to allow and can change your preferences at any time. Remember that disabling cookies may affect your experience on the website.',
                        },
                        {
                            title: "Strictly necessary cookies",
                            description:
                                "These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly",
                            toggle: {
                                value: "necessary",
                                enabled: true,
                                readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
                            },
                        },
                        {
                            title: "Performance and Analytics cookies",
                            description:
                                "These cookies allow the website to remember the choices you have made in the past, and used to enhance the performance and functionality of our websites but are nonessential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.",
                            toggle: {
                                value: "analytics", // your cookie category
                                enabled: false,
                                readonly: false,
                            },
                            cookie_table: [
                                // list of all expected cookies
                                {
                                    col1: "^_ga", // match all cookies starting with "_ga"
                                    col2: "google.com",
                                    col3: "180 days",
                                    col4: "Analytics",
                                    is_regex: true,
                                },
                                {
                                    col1: "_gid",
                                    col2: "google.com",
                                    col3: "180 days",
                                    col4: "Event Tracking",
                                },
                            ],
                        },
                        {
                            title: "Advertisement and Targeting cookies",
                            description:
                                "These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you",
                            toggle: {
                                value: "targeting",
                                enabled: false,
                                readonly: false,
                            },
                        },
                        {
                            title: "Unclassified cookies",
                            description:
                                " These cookies are not classified in any other category. You can choose to enable or disable them at any time.",
                            toggle: {
                                value: "unclassified",
                                enabled: false,
                                readonly: false,
                            },
                        },
                        {
                            title: "More information",
                            description:
                                'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="/contact">contact us</a>.',
                        },
                    ],
                },
            },
        },
    });
});