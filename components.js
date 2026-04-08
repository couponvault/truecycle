/**
 * Prime Device Shared Components Manager (Premium UI)
 * Manages consistent UI elements like the Global Header and Currency Dropdown.
 */

const Prime DeviceUI = {
  currencies: [
    { code: 'INR', symbol: 'â‚¹', flag: 'ðŸ‡®ðŸ‡³' },
    { code: 'USD', symbol: '$', flag: 'ðŸ‡ºðŸ‡¸' },
    { code: 'GBP', symbol: 'Â£', flag: 'ðŸ‡¬ðŸ‡§' },
    { code: 'EUR', symbol: 'â‚¬', flag: 'ðŸ‡ªðŸ‡º' },
    { code: 'AED', symbol: 'Ø¯.Ø¥', flag: 'ðŸ‡¦ðŸ‡ª' },
    { code: 'JPY', symbol: 'Â¥', flag: 'ðŸ‡¯ðŸ‡µ' },
    { code: 'AUD', symbol: 'A$', flag: 'ðŸ‡¦ðŸ‡º' },
    { code: 'CAD', symbol: 'C$', flag: 'ðŸ‡¨ðŸ‡¦' }
  ],

  init() {
    this.injectStyles();
    this.hydrateCurrencyDropdown();
    this.setupClickOutside();
    console.log("Prime Device UI: Components hydrated.");
  },

  injectStyles() {
    if (document.getElementById('tc-component-styles')) return;
    const style = document.createElement('style');
    style.id = 'tc-component-styles';
    style.innerHTML = `
      /* Premium Dropdown Styles */
      .tc-currency-container {
        position: relative;
        display: inline-block;
        user-select: none;
        z-index: 9999;
      }

      .tc-dropdown-trigger {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .tc-dropdown-trigger:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-1px);
      }

      .tc-dropdown-trigger i {
        font-size: 0.6rem;
        transition: transform 0.3s ease;
      }

      .tc-currency-container.open .tc-dropdown-trigger i {
        transform: rotate(180deg);
      }

      .tc-dropdown-list {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 103, 120, 0.1);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        min-width: 180px;
        padding: 8px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tc-currency-container.open .tc-dropdown-list {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .tc-currency-item {
        padding: 10px 14px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #1e293b;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .tc-currency-item:hover {
        background: rgba(0, 103, 120, 0.05);
        color: #006778;
      }

      .tc-currency-item.active {
        background: #006778;
        color: white;
      }

      .tc-currency-item .flag {
        font-size: 1.1rem;
      }

      .tc-currency-item .code {
        flex-grow: 1;
      }

      .tc-currency-item .symbol {
        opacity: 0.5;
        font-weight: 500;
        font-size: 0.75rem;
      }

      .tc-currency-item.active .symbol {
        opacity: 0.8;
      }

      /* Mobile Adjustment */
      @media (max-width: 768px) {
        .tc-dropdown-list {
          position: fixed;
          top: auto;
          bottom: 20px;
          left: 20px;
          right: 20px;
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  },

  hydrateCurrencyDropdown() {
    const legacySelector = document.getElementById('currencySelector');
    if (!legacySelector) return;

    const currentCurrency = localStorage.getItem('tc_currency') || 'INR';
    const activeData = this.currencies.find(c => c.code === currentCurrency) || this.currencies[0];

    // Create the premium container
    const container = document.createElement('div');
    container.className = 'tc-currency-container';
    container.id = 'tcCurrencyRoot';

    container.innerHTML = `
      <div class="tc-dropdown-trigger" onclick="Prime DeviceUI.toggleDropdown()">
        <span class="flag">${activeData.flag}</span>
        <span class="code">${activeData.code}</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="tc-dropdown-list">
        ${this.currencies.map(c => `
          <div class="tc-currency-item ${c.code === currentCurrency ? 'active' : ''}" 
               onclick="Prime DeviceUI.selectCurrency('${c.code}')">
            <span class="flag">${c.flag}</span>
            <span class="code">${c.code}</span>
            <span class="symbol">${c.symbol}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Replace the legacy selector (keeping its container)
    legacySelector.parentElement.replaceChild(container, legacySelector);
  },

  toggleDropdown() {
    document.getElementById('tcCurrencyRoot').classList.toggle('open');
  },

  selectCurrency(code) {
    if (window.CurrencySystem) {
      CurrencySystem.setCurrency(code);
      // Wait for refresh or UI update
      this.toggleDropdown();
      // Re-hydrate trigger to show new selection immediately
      this.hydrateCurrencyDropdown();
    }
  },

  setupClickOutside() {
    document.addEventListener('click', (e) => {
      const container = document.getElementById('tcCurrencyRoot');
      if (container && container.classList.contains('open')) {
        if (!container.contains(e.target)) {
          container.classList.remove('open');
        }
      }
    });
  }
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Prime DeviceUI.init());
} else {
  Prime DeviceUI.init();
}

