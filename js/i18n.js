document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Language
    const langToggleBtn = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('siteLang') || 'en';
    
    // Apply initial language
    applyTranslations(currentLang);
    updateLangToggleButton(currentLang);

    // 2. Language Toggle Event Listener
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'bn' : 'en';
            localStorage.setItem('siteLang', currentLang);
            applyTranslations(currentLang);
            updateLangToggleButton(currentLang);
        });
    }

    // 3. Apply Translations Function
    function applyTranslations(lang) {
        // Ensure translations object exists (loaded from translations.js)
        if (typeof translations === 'undefined' || !translations[lang]) return;

        const dictionary = translations[lang];
        
        // Find all elements with a data-i18n attribute
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (dictionary[key]) {
                // If it's an input with placeholder, translate placeholder
                if (element.tagName.toLowerCase() === 'input' && element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', dictionary[key]);
                } else {
                    // Otherwise translate innerHTML to support span tags in translations
                    element.innerHTML = dictionary[key];
                }
            }
        });

        // Set HTML lang attribute
        document.documentElement.setAttribute('lang', lang);
        
        // Optional: Toggle a CSS class on body to apply specific font families for Bangla if needed
        if (lang === 'bn') {
            document.body.classList.add('lang-bn');
        } else {
            document.body.classList.remove('lang-bn');
        }
    }

    // 4. Update Button Appearance
    function updateLangToggleButton(lang) {
        if (!langToggleBtn) return;
        if (lang === 'en') {
            langToggleBtn.innerHTML = 'বাং'; // Switch to Bangla
            langToggleBtn.setAttribute('aria-label', 'Switch to Bangla');
        } else {
            langToggleBtn.innerHTML = 'EN';  // Switch to English
            langToggleBtn.setAttribute('aria-label', 'Switch to English');
        }
    }
});
