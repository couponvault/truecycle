/**
 * TrueCycle - Universal Global Currency System
 * Automatically detects ANY country and converts prices using Intl API.
 */

const CurrencySystem = {
    selected: localStorage.getItem('tc_currency') || 'INR',
    rates: JSON.parse(localStorage.getItem('tc_rates')) || { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.009 },
    lastFetch: localStorage.getItem('tc_rates_ts') || 0,

    async init() {
        console.log("TrueCycle: Initializing Global Currency System...");
        
        // 1. Auto-detect currency via IP if no preference saved
        if (!localStorage.getItem('tc_currency')) {
            await this.detectLocation();
        }

        // 2. Refresh rates once every 24 hours
        const now = Date.now();
        if (now - this.lastFetch > 24 * 60 * 60 * 1000) {
            await this.fetchRates();
        }

        this.applyToUI();
    },

    async detectLocation() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            
            if (data && data.currency) {
                console.log("TrueCycle: Detected Currency -", data.currency);
                this.selected = data.currency;
                localStorage.setItem('tc_currency', this.selected);
            }
        } catch (e) {
            console.warn("TrueCycle: GeoIP detection failed, defaulting to INR.");
            this.selected = 'INR';
        }
        
        // Final sanity check for currency support
        if (!this.selected) this.selected = 'INR';
        localStorage.setItem('tc_currency', this.selected);
    },

    async fetchRates() {
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/INR');
            const data = await res.json();
            
            if (data && data.rates) {
                this.rates = data.rates;
                this.lastFetch = Date.now();
                localStorage.setItem('tc_rates', JSON.stringify(this.rates));
                localStorage.setItem('tc_rates_ts', this.lastFetch);
                console.log("TrueCycle: Exchange rates updated.");
            }
        } catch (e) {
            console.warn("TrueCycle: Rates update failed.", e);
        }
    },

    getConvertedAmount(amount, targetCode = '', basePriceCurrency = 'INR') {
        const target = targetCode || this.selected;
        if (target === basePriceCurrency) return amount;
        const baseRate = this.rates[basePriceCurrency] || 1;
        const targetRate = this.rates[target] || 1;
        return (amount / baseRate) * targetRate;
    },

    format(amount, label = '', basePriceCurrency = 'INR') {
        const userCurrency = this.selected;
        let converted = amount;

        // Formula: (Amount / Rate of Base relative to INR) * Rate of Target relative to INR
        if (basePriceCurrency !== userCurrency) {
            const baseRate = this.rates[basePriceCurrency] || 1;
            const targetRate = this.rates[userCurrency] || 1;
            converted = (amount / baseRate) * targetRate;
        }
        
        try {
            // Use Intl for perfect formatting and symbols for ANY currency
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: userCurrency,
                minimumFractionDigits: (userCurrency === 'INR') ? 0 : 2,
                maximumFractionDigits: (userCurrency === 'INR') ? 0 : 2
            }).format(converted) + (label ? ' ' + label : '');
        } catch (e) {
            // Fallback for invalid currency codes
            return `${userCurrency} ${converted.toFixed(2)}${label}`;
        }
    },

    setCurrency(code) {
        if (this.rates[code]) {
            this.selected = code;
            localStorage.setItem('tc_currency', code);
            this.applyToUI();
            
            // Dispatch event for components to re-render
            window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
            if (typeof showToast !== 'undefined') showToast(`Switched to ${code}`);
        }
    },

    applyToUI() {
        // 1. Sync Selectors & Inject detected currency
        const selectors = document.querySelectorAll('#currencySelector');
        selectors.forEach(sel => {
            let exists = false;
            for (let i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === this.selected) exists = true;
            }
            if (!exists) {
                const newOpt = document.createElement('option');
                newOpt.value = this.selected;
                newOpt.textContent = `${this.selected} (Detected)`;
                newOpt.style.color = "#333";
                sel.appendChild(newOpt);
            }
            sel.value = this.selected;
        });

        // 2. Update ALL elements with data-price attribute
        // Supports data-base-currency for multi-currency products
        document.querySelectorAll('[data-price]').forEach(el => {
            const amount = parseFloat(el.getAttribute('data-price'));
            if (!isNaN(amount)) {
                const prefix = el.getAttribute('data-price-prefix') || '';
                const suffix = el.getAttribute('data-price-suffix') || '';
                const baseCurrency = el.getAttribute('data-base-currency') || 'INR';
                
                if (el.tagName === 'INPUT') {
                    el.placeholder = prefix + this.format(amount, '', baseCurrency) + suffix;
                } else {
                    el.textContent = prefix + this.format(amount, '', baseCurrency) + suffix;
                }
            }
        });

        // 3. Trigger re-renders for core components
        if (typeof ProductUI !== 'undefined' && ProductUI.init) ProductUI.init(); 
        if (typeof HomeUI !== 'undefined' && HomeUI.init) HomeUI.init();
        if (window.location.href.includes('product-detail.html') && typeof calculateAndDisplay === 'function') calculateAndDisplay();
        if (window.location.href.includes('cart.html') && typeof Cart !== 'undefined') Cart.renderCartPage();
        if (window.location.href.includes('checkout.html') && typeof renderSummary === 'function') renderSummary();
    }
};

// AUTO-INIT as soon as file is loaded
CurrencySystem.init();
