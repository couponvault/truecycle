/**
 * Wishlist Service - Handles all data persistence and business logic for the Wishlist.
 * Designed to be future-ready: can be easily swapped for a backend API.
 */

const STORAGE_KEY = 'truecycle_wishlist_items';

const wishlistService = {
  /**
   * Fetches the current wishlist from localStorage.
   * @returns {Array} List of product objects
   */
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading wishlist from storage:', error);
      return [];
    }
  },

  /**
   * Checks if a product is already in the wishlist.
   * @param {string} productId - Unique ID of the product
   * @returns {boolean}
   */
  isInWishlist(productId) {
    const items = this.getWishlist();
    return items.some(item => item.id === productId);
  },

  /**
   * Adds a product to the wishlist.
   * @param {Object} product - Product object containing id, name, price, img
   */
  addToWishlist(product) {
    const items = this.getWishlist();
    if (!this.isInWishlist(product.id)) {
      items.push({
        ...product,
        addedAt: new Date().toISOString() // Track for "Recently Added" feature
      });
      this._save(items);
      return true;
    }
    return false;
  },

  /**
   * Removes a product from the wishlist.
   * @param {string} productId - Unique ID of the product
   */
  removeFromWishlist(productId) {
    const items = this.getWishlist();
    const updated = items.filter(item => item.id !== productId);
    this._save(updated);
  },

  /**
   * Toggles the wishlist state for a product.
   * @param {Object} product - Product object
   * @returns {boolean} New state (true = in wishlist, false = removed)
   */
  toggleWishlist(product) {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
      return false;
    } else {
      this.addToWishlist(product);
      return true;
    }
  },

  /**
   * Persists the wishlist array to storage.
   * @private
   */
  _save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      // Dispatch a custom event so other components can react to wishlist changes
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: items }));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  }
};

// Export the service for use in scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = wishlistService;
} else {
  window.wishlistService = wishlistService;
}
