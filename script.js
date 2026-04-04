// ============================================
// TrueCycle - Main JavaScript
// ============================================

/** Global HTML Sanitizer — prevents XSS when injecting user-controlled data into innerHTML */
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Mobile Navigation Toggle ---
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  const toggle = document.getElementById('mobileToggle');
  navLinks.classList.toggle('mobile-open');
  toggle.classList.toggle('active');
}

// Add mobile nav styles dynamically
const mobileNavStyle = document.createElement('style');
mobileNavStyle.textContent = `
  @media (max-width: 768px) {
    .nav-links.mobile-open {
      display: flex !important;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      padding: 20px;
      box-shadow: var(--shadow-lg);
      gap: 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .mobile-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .mobile-toggle.active span:nth-child(2) {
      opacity: 0;
    }
    .mobile-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
`;
document.head.appendChild(mobileNavStyle);

// --- Scroll to Top ---
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Countdown Timer ---
function startCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');

  if (!daysEl) return;

  // Set target date 3 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);

  function updateTimer() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}
startCountdown();

// --- Product Detail - Image Gallery ---
function changeImage(thumbnail, src) {
  const mainImg = document.getElementById('mainImg');
  if (mainImg) {
    mainImg.src = src;
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
  }
}

// --- Quantity Controls ---
function updateQty(delta) {
  const qtyInput = document.getElementById('qty');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  val = Math.max(1, Math.min(5, val + delta));
  qtyInput.value = val;
}

// --- Cart State Management ---
const Cart = {
  items: JSON.parse(localStorage.getItem('truecycle_cart')) || [],
  init: function() {
    if (!localStorage.getItem('truecycle_cart_initialized')) {
      // Seed initial data to match previous hardcoded state
      this.items = [
        { id: 'cartItem1', name: 'Apple iPhone 15 Pro – 256GB', price: 89999, qty: 1, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&h=150&fit=crop', spec: 'Natural Titanium · Excellent Condition' },
        { id: 'cartItem2', name: 'Samsung Galaxy S24 Ultra – 512GB', price: 79999, qty: 1, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=150&h=150&fit=crop', spec: 'Titanium Black · Like New' },
        { id: 'cartItem3', name: 'Sony WH-1000XM5 Headphones', price: 18999, qty: 1, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop', spec: 'Black · Like New' }
      ];
      localStorage.setItem('truecycle_cart_initialized', 'true');
      this.save();
    } else {
      this.updateCounters();
      this.renderCartPage();
    }
  },
  discount: 0,
  couponCode: '',
  applyCoupon: function(code) {
    const feedback = document.getElementById('couponFeedback');
    const offerBox = document.getElementById('first300Box');
    const offerBtn = document.getElementById('first300Btn');
    if (!feedback) return;

    if (code.toUpperCase() === 'FIRST300') {
      this.discount = 300;
      this.couponCode = 'FIRST300';
      feedback.textContent = 'Coupon applied: ₹300 Discount! 🎉';
      feedback.style.color = '#27AE60';
      if (offerBox) { offerBox.style.background = '#EBF9F1'; offerBox.style.borderColor = '#27AE60'; }
      if (offerBtn) { offerBtn.textContent = 'APPLIED'; offerBtn.style.background = '#27AE60'; offerBtn.classList.remove('btn-primary'); offerBtn.style.color = 'white'; }
      showToast('Coupon FIRST300 Applied!', 'success');
    } else {
      this.discount = 0;
      this.couponCode = '';
      feedback.textContent = 'Invalid Coupon Code';
      feedback.style.color = '#E74C3C';
      showToast('Invalid Coupon', 'error');
    }
    this.renderCartPage();
  },
  removeCoupon: function() {
    this.discount = 0;
    this.couponCode = '';
    const feedback = document.getElementById('couponFeedback');
    const offerBox = document.getElementById('first300Box');
    const offerBtn = document.getElementById('first300Btn');
    if (feedback) feedback.textContent = '';
    if (offerBox) { offerBox.style.background = '#F0F9FA'; offerBox.style.borderColor = '#006778'; }
    if (offerBtn) { offerBtn.textContent = 'Apply'; offerBtn.style.background = '#006778'; }
    showToast('Coupon Removed', 'info');
    this.renderCartPage();
  },
  save: function() {
    localStorage.setItem('truecycle_cart', JSON.stringify(this.items));
    this.updateCounters();
    this.renderCartPage();
  },
  add: function(product) {
    const existing = this.items.find(i => i.name === product.name);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({
        ...product, 
        qty: product.qty || 1,
        // Ensure we have a consistent spec field
        spec: product.selection || product.spec || 'Certified Refurbished'
      });
    }
    this.save();
  },
  remove: function(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },
  updateQty: function(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, Math.min(5, item.qty + delta));
      this.save();
    }
  },
  updateCounters: function() {
    const counts = document.querySelectorAll('.cart-count');
    const totalQty = this.items.reduce((sum, item) => sum + item.qty, 0);
    counts.forEach(c => c.textContent = totalQty);
  },
  renderCartPage: function() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    
    if (this.items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 0; grid-column: 1 / -1;">
          <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #ccc; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.5rem; margin-bottom: 8px;">Your cart is empty</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">Looks like you haven't added anything yet.</p>
          <a href="products.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      document.getElementById('cartSummary').style.display = 'none';
      return;
    }

    document.getElementById('cartSummary').style.display = 'block';

    let html = `
      <div class="cart-header">
        <span>Product</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Total</span>
        <span></span>
      </div>
    `;

    let subtotal = 0;

    this.items.forEach(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      html += `
        <div class="cart-item" id="cartItem-${item.id}">
          <div class="cart-product">
            <div class="cart-product-image">
              <img src="${item.img}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="cart-product-info">
              <h4>${item.name}</h4>
              <p>${item.selection || item.spec || 'Certified Refurbished'}</p>
            </div>
          </div>
          <div class="cart-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div>
            <div class="qty-control">
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
              <input type="number" class="qty-input" value="${item.qty}" readonly>
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <div class="cart-total-price">₹${itemTotal.toLocaleString('en-IN')}</div>
          <button class="cart-remove" onclick="Cart.remove('${item.id}')"><i class="fas fa-times"></i></button>
        </div>
      `;
    });

    container.innerHTML = html;

    const total = Math.max(0, subtotal - this.discount);

    document.getElementById('summaryItemCount').textContent = `Subtotal (${this.items.length} items)`;
    document.getElementById('summarySubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    
    // Update Discount UI if element exists
    const discountRow = document.getElementById('summaryDiscountRow');
    const discountEl = document.getElementById('summaryDiscount');
    if (discountRow && discountEl) {
      if (this.discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.innerHTML = `<span>-₹${this.discount.toLocaleString('en-IN')}</span> <a href="javascript:void(0)" onclick="Cart.removeCoupon()" style="color:#E74C3C; font-size:0.7rem; margin-left:8px; text-decoration:underline;">Remove</a>`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  WishlistUI.init();
});

// --- Add to Cart ---
function addToCart(e) {
  const target = e && e.target ? e.target : event.target;
  const btn = target.closest('.btn') || target.closest('.quick-action-btn');
  if(!btn) return;

  // Visual feedback
  if (btn.classList.contains('btn')) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.style.backgroundColor = 'var(--success)';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
    }, 2000);
  } else {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-check';
      icon.style.color = 'var(--success)';
      setTimeout(() => {
        icon.className = 'fas fa-shopping-cart';
        icon.style.color = '';
      }, 2000);
    }
  }

  // Auto-detect product
  let product = {
    id: 'p_' + Math.random().toString(36).substr(2, 9),
    name: 'TrueCycle Device',
    price: 49999,
    img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=150&h=150',
    spec: 'Certified Refurbished',
    qty: 1
  };

  const productCard = btn.closest('.product-card');
  if (productCard) {
    const nameEl = productCard.querySelector('h3');
    if (nameEl) product.name = nameEl.textContent;
    const priceEl = productCard.querySelector('.current-price');
    if (priceEl) product.price = parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 49999;
    const imgEl = productCard.querySelector('img');
    if (imgEl) product.img = imgEl.src;
  } else {
    // Maybe on product detail page
    const detailTitle = document.querySelector('h1');
    if (detailTitle) product.name = detailTitle.textContent;
    const detailPrice = document.querySelector('.current-price');
    if (detailPrice) product.price = parseInt(detailPrice.textContent.replace(/[^0-9]/g, '')) || 49999;
    const mainImg = document.getElementById('mainImg');
    if (mainImg) product.img = mainImg.src;
    const qtyInput = document.getElementById('qty');
    if (qtyInput) product.qty = parseInt(qtyInput.value) || 1;
  }

  Cart.add(product);
  showToast('Product added to cart!');
}

// (Toast function defined once at end of file — see Global Toast Notification System)

// --- Wishlist UI Management ---
const WishlistUI = {
  /**
   * Initializes the Wishlist UI on page load.
   */
  init() {
    this.updateNavbar();
    this.bindEvents();
    
    // Listen for custom wishlistUpdated event from wishlistService
    window.addEventListener('wishlistUpdated', () => {
      this.updateNavbar();
      if (window.location.pathname.includes('wishlist.html')) {
        this.renderWishlistPage();
      }
    });

    if (window.location.pathname.includes('wishlist.html')) {
      this.renderWishlistPage();
    }
  },

  /**
   * Binds the wishlist toggle functionality to heart buttons.
   */
  bindEvents() {
    document.addEventListener('click', (e) => {
      const wishlistBtn = e.target.closest('.product-wishlist');
      if (wishlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.handleToggle(wishlistBtn);
      }
    });
  },

  /**
   * Handles the UI toggle and calls the service.
   * @param {HTMLElement} btn - The heart button
   */
  handleToggle(btn) {
    const productCard = btn.closest('.product-card');
    let product;

    if (productCard) {
      product = {
        id: productCard.dataset.id || 'p_' + Math.random().toString(36).substr(2, 9),
        name: productCard.querySelector('h3') ? productCard.querySelector('h3').textContent : 'TrueCycle Product',
        price: productCard.querySelector('.current-price') ? parseInt(productCard.querySelector('.current-price').textContent.replace(/[^0-9]/g, '')) : 0,
        img: productCard.querySelector('img') ? productCard.querySelector('img').src : ''
      };
    } else {
      // Handle Product Detail Page
      const detailTitle = document.querySelector('h1');
      const detailPrice = document.querySelector('.current-price');
      const mainImg = document.getElementById('mainImg') || document.querySelector('.main-image img');
      if (!detailTitle) return;
      
      product = {
        id: 'detail_' + detailTitle.textContent.substring(0, 10).replace(/\s/g, '_'),
        name: detailTitle.textContent,
        price: detailPrice ? parseInt(detailPrice.textContent.replace(/[^0-9]/g, '')) : 0,
        img: mainImg ? mainImg.src : ''
      };
    }

    // Toggle backend logic
    const isAdded = wishlistService.toggleWishlist(product);

    // Micro-interaction Feedback
    btn.classList.add('heart-pop');
    setTimeout(() => btn.classList.remove('heart-pop'), 400);

    if (isAdded) {
      showToast('Added to Wishlist! ❤️');
    } else {
      showToast('Removed from Wishlist', 'info');
    }
  },

  /**
   * Updates global wishlist badges and icon states.
   */
  updateNavbar() {
    const items = wishlistService.getWishlist();
    const badges = document.querySelectorAll('#wishlistCount');
    
    badges.forEach(badge => {
      badge.textContent = items.length;
      badge.style.display = items.length > 0 ? 'flex' : 'none';
      
      const parentLink = badge.closest('.action-btn');
      if (parentLink) {
        const icon = parentLink.querySelector('i');
        if (icon) {
          if (items.length > 0) {
            icon.className = 'fas fa-heart'; // Solid heart
            icon.style.color = '#E74C3C';
          } else {
            icon.className = 'far fa-heart'; // Outline heart
            icon.style.color = '';
          }
        }
      }
    });
    
    // Sync all product heart icons on the page
    document.querySelectorAll('.product-wishlist i, button.product-wishlist i').forEach(icon => {
      const card = icon.closest('.product-card');
      const detailTitle = document.querySelector('h1');
      
      let id;
      if (card) {
        id = card.dataset.id;
      } else if (detailTitle) {
        id = 'detail_' + detailTitle.textContent.substring(0, 10).replace(/\s/g, '_');
      }

      if (wishlistService.isInWishlist(id)) {
        icon.className = 'fas fa-heart';
        icon.style.color = '#E74C3C';
      } else {
        icon.className = 'far fa-heart';
        icon.style.color = '';
      }
    });
  },

  /**
   * Renders the dedicated My Wishlist page.
   */
  renderWishlistPage() {
    const container = document.getElementById('wishlistContainer');
    const emptyMsg = document.getElementById('wishlistEmpty');
    if (!container || !emptyMsg) return;

    const items = wishlistService.getWishlist();

    if (items.length === 0) {
      container.innerHTML = '';
      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none';
    let html = '';
    items.forEach(item => {
      html += `
        <div class="product-card" data-id="${item.id}">
          <button class="product-wishlist" style="opacity:1"><i class="fas fa-heart" style="color: #E74C3C"></i></button>
          <div class="product-image" style="height: 200px; padding: 20px;">
            <img src="${item.img}" style="object-fit: contain; max-height: 100%;" alt="${item.name}">
          </div>
          <div class="product-info" style="padding: 15px;">
            <h3 style="font-size: 0.95rem; margin-bottom: 8px;"><a href="#">${item.name}</a></h3>
            <div class="product-price">
              <span class="current-price" style="font-size: 1.1rem;">₹${item.price.toLocaleString('en-IN')}</span>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 8px;">
               <button class="btn btn-primary btn-sm" style="flex:1" onclick="handleWishlistToCart('${item.id}')">Add to Cart</button>
               <button class="btn btn-ghost btn-sm" onclick="wishlistService.removeFromWishlist('${item.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
};

// Global helper for wishlist transfer (UI Bridge)
function handleWishlistToCart(id) {
    const items = wishlistService.getWishlist();
    const product = items.find(item => item.id === id);
    if (!product) return;
    
    // Simulate cart add
    Cart.add({
      ...product,
      qty: 1,
      spec: 'Verified Refurbished'
    });
    
    wishlistService.removeFromWishlist(id);
    showToast('Product shifted to cart! 🛒');
}

// --- Profile / Account Modal ---
function toggleProfileModal() {
  let modal = document.getElementById('profileModal');
  if (!modal) {
    createProfileModal();
    modal = document.getElementById('profileModal');
  }
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function createProfileModal() {
  const modalHTML = `
    <div id="profileModal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; justify-content:center; align-items:center;">
      <div class="modal-content" style="background:white; padding:0; border-radius:16px; width:100%; max-width:480px; box-shadow:var(--shadow-xl); position:relative; overflow:hidden;">
        <button onclick="toggleProfileModal()" style="position:absolute; top:20px; right:20px; font-size:1.2rem; color:var(--text-muted); background:none; border:none; z-index:10; cursor:pointer;"><i class="fas fa-times"></i></button>
        
        <!-- Tabs -->
        <div style="display:flex; border-bottom:1px solid var(--border-light); background:#fcfcfc;">
          <button id="tabAccount" onclick="switchProfileTab('account')" style="flex:1; padding:16px; border:none; background:none; font-weight:600; cursor:pointer; color:var(--primary); border-bottom:2px solid var(--primary);">Account Info</button>
          <button id="tabAddresses" onclick="switchProfileTab('addresses')" style="flex:1; padding:16px; border:none; background:none; font-weight:600; cursor:pointer; color:var(--text-muted);">Saved Addresses</button>
        </div>

        <div id="profileTabsContainer" style="padding:32px;">
          <!-- Account View -->
          <div id="viewAccount">
            <div id="authViewContainer">
              <div id="signInView">
                <div style="text-align:center; margin-bottom:24px;">
                  <div style="width:70px; height:70px; border-radius:50%; background:var(--bg-secondary); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; color:var(--primary);">
                    <i class="far fa-user"></i>
                  </div>
                  <h2 style="margin-bottom:4px;">Welcome Back!</h2>
                  <p style="font-size:0.85rem; color:var(--text-muted);">Access your TrueCycle account</p>
                </div>
                <form onsubmit="event.preventDefault(); showToast('Signing in...')">
                  <div style="display:flex; flex-direction:column; gap:16px;">
                    <input type="email" required placeholder="Email Address" style="padding:12px; border:1px solid var(--border); border-radius:8px;">
                    <input type="password" required placeholder="Password" style="padding:12px; border:1px solid var(--border); border-radius:8px;">
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:14px;">Sign In</button>
                    <p style="text-align:center; font-size:0.85rem;">Don't have an account? <a href="javascript:void(0)" onclick="switchAuthView('signup')" style="color:var(--primary); font-weight:600;">Sign up</a></p>
                  </div>
                </form>
              </div>
              <div id="signUpView" style="display:none;">
                <div style="text-align:center; margin-bottom:24px;">
                  <h2 style="margin-bottom:8px;">Join TrueCycle</h2>
                  <p style="font-size:0.85rem; color:var(--text-muted);">Create your account for better shopping</p>
                </div>
                <form onsubmit="event.preventDefault(); showToast('Account created successfully!')">
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <input type="text" required placeholder="Full Name" style="padding:12px; border:1px solid var(--border); border-radius:8px;">
                    <input type="email" required placeholder="Email Address" style="padding:12px; border:1px solid var(--border); border-radius:8px;">
                    <input type="password" required placeholder="Create Password" style="padding:12px; border:1px solid var(--border); border-radius:8px;">
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:14px;">Create Account</button>
                    <p style="text-align:center; font-size:0.85rem;">Already have an account? <a href="javascript:void(0)" onclick="switchAuthView('signin')" style="color:var(--primary); font-weight:600;">Sign in</a></p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Addresses View -->
          <div id="viewAddresses" style="display:none;">
            <div id="profileAddressList" style="max-height:300px; overflow-y:auto; margin-bottom:20px;">
              <!-- Loaded dynamically -->
            </div>
            <button onclick="openNewAddressPrompt()" class="btn btn-outline" style="width:100%; border-style:dashed;">+ Add New Address</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('profileModal').addEventListener('click', (e) => { if (e.target.id === 'profileModal') toggleProfileModal(); });
}

function switchProfileTab(tab) {
  const acc = document.getElementById('viewAccount');
  const add = document.getElementById('viewAddresses');
  const tAcc = document.getElementById('tabAccount');
  const tAdd = document.getElementById('tabAddresses');

  if (tab === 'account') {
    acc.style.display = 'block'; add.style.display = 'none';
    tAcc.style.color = 'var(--primary)'; tAcc.style.borderBottom = '2px solid var(--primary)';
    tAdd.style.color = 'var(--text-muted)'; tAdd.style.borderBottom = 'none';
  } else {
    acc.style.display = 'none'; add.style.display = 'block';
    tAdd.style.color = 'var(--primary)'; tAdd.style.borderBottom = '2px solid var(--primary)';
    tAcc.style.color = 'var(--text-muted)'; tAcc.style.borderBottom = 'none';
    renderProfileAddresses();
  }
}

function renderProfileAddresses() {
  const container = document.getElementById('profileAddressList');
  if (!container) return;
  const addresses = typeof addressService !== 'undefined' ? addressService.getAddresses() : [];
  
  if (addresses.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">No addresses saved.</p>';
    return;
  }

  container.innerHTML = addresses.map(addr => `
    <div style="border:1px solid var(--border-light); padding:16px; border-radius:8px; margin-bottom:12px; position:relative;">
      <div style="font-weight:600; margin-bottom:4px;">${addr.name}</div>
      <div style="font-size:0.85rem; color:#666;">${addr.area}, ${addr.city}, ${addr.state}</div>
      <div style="font-size:0.85rem; color:#888; margin-top:4px;">${addr.phone}</div>
      <button onclick="deleteProfileAddress('${addr.id}')" style="position:absolute; top:16px; right:16px; background:none; border:none; color:#ff4d4d; cursor:pointer;"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function deleteProfileAddress(id) {
  if (confirm('Delete this address?')) {
    addressService.deleteAddress(id);
    renderProfileAddresses();
  }
}

function openNewAddressPrompt() {
  const name = prompt('Full Name');
  if (!name) return;
  const phone = prompt('Phone Number');
  const area = prompt('Area / Locality');
  const city = prompt('City');
  const state = prompt('State');
  
  addressService.saveAddress({ name, phone, area, city, state });
  renderProfileAddresses();
}

function switchAuthView(view) {
  const signInView = document.getElementById('signInView');
  const signUpView = document.getElementById('signUpView');
  if (view === 'signup') {
    signInView.style.display = 'none'; signUpView.style.display = 'block';
  } else {
    signInView.style.display = 'block'; signUpView.style.display = 'none';
  }
}

// --- Newsletter Form ---
function handleNewsletter(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input');
  const email = input.value;

  if (email) {
    showToast('Thanks for subscribing! 🎉');
    input.value = '';
  }
}

// --- Contact Form ---
function handleContactForm(e) {
  e.preventDefault();
  showToast('Message sent successfully! We\'ll get back to you within 24 hours.');
  e.target.reset();
}

// --- Smooth Scroll For Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Intersection Observer for Scroll Animations ---
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply scroll animations to cards
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll(
    '.product-card, .category-card, .feature-card, .testimonial-card, .about-stat'
  );

  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`;
    observer.observe(el);
  });
});

// --- Quick Action - Add to Cart from Product Grid ---
document.addEventListener('click', (e) => {
  const quickCartBtn = e.target.closest('.quick-action-btn');
  if (quickCartBtn && quickCartBtn.querySelector('.fa-shopping-cart')) {
    e.preventDefault();
    e.stopPropagation();
    // Use the global addToCart function
    addToCart({ target: quickCartBtn });
  }
});

// (Search function defined once below — see Search Logic section)

// --- Quick Price Filtering ---
function setPriceFilter(max) {
    if (typeof ProductUI !== 'undefined') {
        const minP = document.getElementById('minPrice');
        const maxP = document.getElementById('maxPrice');
        
        if (max === 30000) {
            // Range 15k-30k
            ProductUI.filters.minPrice = 15000;
            ProductUI.filters.maxPrice = 30000;
            if (minP) minP.value = 15000;
            if (maxP) maxP.value = 30000;
        } else if (max === Infinity) {
            ProductUI.filters.minPrice = 0;
            ProductUI.filters.maxPrice = Infinity;
            if (minP) minP.value = '';
            if (maxP) maxP.value = '';
        } else {
            ProductUI.filters.minPrice = 0;
            ProductUI.filters.maxPrice = max;
            if (minP) minP.value = 0;
            if (maxP) maxP.value = max;
        }
        
        ProductUI.pagination.currentPage = 1;
        ProductUI.render();
        showToast(`Budget Filter: ${max === Infinity ? 'All Prices' : 'Under ₹' + max.toLocaleString()}`);
        scrollToTop();
    }
}

console.log('🔧 TrueCycle loaded successfully!');

// Helper to get total price from different pages (Cart or Checkout)
function getCheckoutAmount() {
  const el = document.getElementById('summaryFinalPrice') || document.getElementById('summaryTotal');
  return el ? el.textContent : '₹0';
}

// --- Mock Payment Gateway (Always Fails) ---
function triggerMockPayment() {
  const totalAmount = getCheckoutAmount();
  
  // Create Modal if it doesn't exist
  let paymentModal = document.getElementById('paymentModal');
  if (!paymentModal) {
    paymentModal = document.createElement('div');
    paymentModal.id = 'paymentModal';
    paymentModal.className = 'modal-overlay';
    paymentModal.style = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center;";
    document.body.appendChild(paymentModal);
  }

  paymentModal.innerHTML = `
    <div style="background:white; padding:0; border-radius:12px; width:100%; max-width:450px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.2); animation: modalIn 0.3s ease-out;">
      <!-- Header -->
      <div style="background:#f8f9fa; padding:16px 20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="logo.png" style="height:24px; opacity:0.8;">
          <span style="font-weight:600; color:#333; font-size:0.95rem;">Payment Gateway</span>
        </div>
        <button onclick="closePaymentModal()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#ccc;">&times;</button>
      </div>

      <!-- Main Body -->
      <div id="paymentContent" style="padding:24px;">
        <div style="margin-bottom:24px;">
          <span style="color:#666; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">Total Amount</span>
          <h2 style="margin:4px 0; font-size:1.8rem; color:#006778;">${totalAmount}</h2>
        </div>

        <div style="display:grid; gap:12px;">
          <div onclick="startMockPayment('UPI')" style="border:1px solid #ddd; padding:14px; border-radius:8px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.2s;">
             <i class="fas fa-university" style="color:#006778; width:20px;"></i>
             <div style="flex:1">
               <div style="font-weight:600; font-size:0.95rem;">UPI / QR</div>
               <div style="font-size:0.75rem; color:#888;">Google Pay, PhonePe, Paytm</div>
             </div>
             <i class="fas fa-chevron-right" style="color:#eee;"></i>
          </div>

          <div onclick="startMockPayment('Card')" style="border:1px solid #ddd; padding:14px; border-radius:8px; display:flex; align-items:center; gap:12px; cursor:pointer;">
             <i class="fas fa-credit-card" style="color:#006778; width:20px;"></i>
             <div style="flex:1">
               <div style="font-weight:600; font-size:0.95rem;">Debit / Credit Card</div>
               <div style="font-size:0.75rem; color:#888;">Visa, MasterCard, RuPay</div>
             </div>
             <i class="fas fa-chevron-right" style="color:#eee;"></i>
          </div>

          <div onclick="startMockPayment('COD')" style="border:1px solid #006778; background:#F0F9FA; padding:14px; border-radius:8px; display:flex; align-items:center; gap:12px; cursor:pointer;">
             <i class="fas fa-truck" style="color:#006778; width:20px;"></i>
             <div style="flex:1">
               <div style="font-weight:600; font-size:0.95rem;">Cash On Delivery (COD)</div>
               <div style="font-size:0.75rem; color:#006778; font-weight:500;">Pay at the time of delivery</div>
             </div>
             <div style="background:#006778; color:white; font-size:0.6rem; padding:2px 6px; border-radius:10px; font-weight:700;">FAST</div>
          </div>

          <div onclick="startMockPayment('Net Banking')" style="border:1px solid #ddd; padding:14px; border-radius:8px; display:flex; align-items:center; gap:12px; cursor:pointer;">
             <i class="fas fa-wallet" style="color:#006778; width:20px;"></i>
             <div style="flex:1">
               <div style="font-weight:600; font-size:0.95rem;">Net Banking</div>
               <div style="font-size:0.75rem; color:#888;">All Indian Banks Available</div>
             </div>
             <i class="fas fa-chevron-right" style="color:#eee;"></i>
          </div>
        </div>

        <div style="text-align:center; margin-top:24px;">
          <img src="https://cdn.razorpay.com/static/assets/badge/badge-dark.png" style="height:22px; opacity:0.6;">
          <div style="font-size:0.65rem; color:#bbb; margin-top:4px;">Secure connection via SSL</div>
        </div>
      </div>
    </div>
  `;

  paymentModal.style.display = 'flex';
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.style.display = 'none';
}

function startMockPayment(method) {
  const content = document.getElementById('paymentContent');
  const amount = getCheckoutAmount();
  
  content.innerHTML = `
    <div style="text-align:center; padding:40px 0;">
      <div class="loader" style="width:50px; height:50px; border:4px solid #f3f3f3; border-top:4px solid #006778; border-radius:50%; margin:0 auto 20px; animation: spin 1s linear infinite;"></div>
      <h3 style="margin-bottom:8px;">${method === 'COD' ? 'Confirming Order...' : 'Processing ' + method + ' Payment...'}</h3>
      <p style="color:#888; font-size:0.9rem;">Please do not close this window.</p>
    </div>
  `;

  // Simulate server call
  setTimeout(() => {
    if (method === 'COD') {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const items = [...Cart.items];
      const address = typeof addressService !== 'undefined' ? addressService.getSelectedAddress() : null;
      const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));

      content.innerHTML = `
        <div style="text-align:center; padding:20px 0;">
          <div style="width:70px; height:70px; background:#EBF9F1; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
            <i class="fas fa-check" style="font-size:2rem; color:#27AE60;"></i>
          </div>
          <h2 style="color:#27AE60; margin-bottom:12px;">Order Placed!</h2>
          <p style="color:#666; font-size:0.95rem; line-height:1.6; margin-bottom:24px;">
            Thank you! Your order <strong>${orderId}</strong> has been successfully placed via Cash on Delivery.<br>
            <span style="font-size:0.85rem; color:#888;">Amount to pay at delivery: <strong>${amount}</strong></span>
          </p>
          <button onclick="window.location.href='index.html'" style="background:#006778; color:white; border:none; padding:12px 30px; border-radius:6px; font-weight:600; cursor:pointer;">Continue Shopping</button>
        </div>
      `;
      
      // 1. Save to Supabase Cloud
      if (typeof tcCloud !== 'undefined' && tcCloud) {
          tcCloud.from('orders').insert([{
              items: items,
              total_amount: numAmount,
              status: 'Confirmed',
              address: address,
              payment_method: method
          }]).then(({ error }) => {
              if (error) console.error("Cloud Order Sync Error:", error);
              else console.log("TrueCycle Cloud: Order stored in database.");
          });
      }

      // 2. Local fallback
      const orders = JSON.parse(localStorage.getItem('truecycle_orders')) || [];
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: amount,
        items: items,
        status: 'Confirmed',
        statusStep: 1,
        address: address
      };
      orders.unshift(newOrder);
      localStorage.setItem('truecycle_orders', JSON.stringify(orders));

      // Clear Cart
      Cart.items = [];
      Cart.save();
      showToast('Order Successful! 🎉', 'success');

    } else {
      content.innerHTML = `
        <div style="text-align:center; padding:20px 0;">
          <div style="width:70px; height:70px; background:#FFEBEB; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
            <i class="fas fa-times" style="font-size:2rem; color:#E74C3C;"></i>
          </div>
          <h2 style="color:#E74C3C; margin-bottom:12px;">Payment Failed</h2>
          <p style="color:#666; font-size:0.95rem; line-height:1.6; margin-bottom:24px;">
            We were unable to process your payment for <strong>${amount}</strong>.<br>
            <span style="font-size:0.85rem; color:#888;">Reason: <strong>Authentication Failed (Error: P004)</strong></span>
          </p>
          <button onclick="triggerMockPayment()" style="background:#006778; color:white; border:none; padding:12px 30px; border-radius:6px; font-weight:600; cursor:pointer;">Try Again</button>
          <div onclick="closePaymentModal()" style="margin-top:16px; font-size:0.9rem; color:#888; cursor:pointer; text-decoration:underline;">Return to Cart</div>
        </div>
      `;
      showToast('Payment Processing Failed', 'error');
    }
  }, 2000);
}


// --- Device Comparison System ---
const CompareManager = {
  list: JSON.parse(localStorage.getItem('truecycle_compare')) || [],
  
  toggle(product) {
    const idx = this.list.findIndex(p => p.id === product.id);
    if (idx > -1) {
      this.list.splice(idx, 1);
      showToast('Removed from comparison');
    } else {
      if (this.list.length >= 3) {
        showToast('You can compare up to 3 devices', 'error');
        return false;
      }
      this.list.push(product);
      showToast('Added to comparison');
    }
    this.save();
    this.updateUI();
    return true;
  },

  save() {
    localStorage.setItem('truecycle_compare', JSON.stringify(this.list));
  },

  updateUI() {
    const drawer = document.getElementById('compareDrawer');
    if (!drawer) return;
    
    if (this.list.length > 0) {
      drawer.style.display = 'flex';
      const itemsContainer = drawer.querySelector('.compare-items');
      itemsContainer.innerHTML = this.list.map(p => `
        <div class="compare-item-thumb">
          <img src="${p.img}" alt="${p.name}">
          <button onclick="CompareManager.remove('${p.id}')">&times;</button>
        </div>
      `).join('');
      drawer.querySelector('.compare-count').textContent = `${this.list.length}/3`;
    } else {
      drawer.style.display = 'none';
    }

    document.querySelectorAll('.btn-compare').forEach(btn => {
      const id = btn.dataset.id;
      if (this.list.some(p => p.id === id)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-check"></i> Compared';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-exchange-alt"></i> Compare';
      }
    });
  },

  remove(id) {
    this.list = this.list.filter(p => p.id !== id);
    this.save();
    this.updateUI();
  }
};

// Initialize Compare Drawer UI
function initCompareDrawer() {
  if (document.getElementById('compareDrawer')) return;
  const drawerHTML = `
    <div id="compareDrawer" style="display:none; position:fixed; bottom:0; left:0; right:0; background:white; box-shadow:0 -5px 20px rgba(0,0,0,0.1); z-index:9000; padding:15px 20px; align-items:center; justify-content:space-between; border-top:3px solid var(--primary); animation: slideUp 0.3s ease;">
      <div style="display:flex; align-items:center; gap:20px;">
        <div style="font-weight:700; color:var(--text-dark);">Comparison <span class="compare-count" style="background:var(--primary); color:white; padding:2px 8px; border-radius:10px; font-size:0.7rem; margin-left:5px;">0/3</span></div>
        <div class="compare-items" style="display:flex; gap:10px;"></div>
      </div>
      <div style="display:flex; gap:12px;">
        <button onclick="CompareManager.list = []; CompareManager.save(); CompareManager.updateUI();" class="btn btn-ghost btn-sm">Clear All</button>
        <a href="compare.html" class="btn btn-primary btn-sm">Compare Now</a>
      </div>
    </div>
    <style>
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .compare-item-thumb { position:relative; width:40px; height:50px; border:1px solid #eee; border-radius:4px; padding:2px; }
      .compare-item-thumb img { width:100%; height:100%; object-fit:contain; }
      .compare-item-thumb button { position:absolute; top:-5px; right:-5px; background:#ff4d4d; color:white; border:none; width:15px; height:15px; border-radius:50%; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
      .btn-compare.active { background: #e0f2f1; color: var(--primary); border-color: var(--primary); }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);
  CompareManager.updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
  initCompareDrawer();
});


// Smart compare toggle for buttons
function toggleCompare(e, id, name, price, img) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const btn = e && e.currentTarget ? e.currentTarget : (e ? e.target : null);
  const card = btn ? btn.closest('.product-card') : null;

  // Fallback for placeholder data (fix zero value/placeholder issues)
  if ((!name || name.includes('TrueCycle Device')) && card) {
    const nameEl = card.querySelector('h3');
    if (nameEl) name = nameEl.textContent.trim();
  }
  
  if ((!price || price === 0) && card) {
    const priceEl = card.querySelector('.current-price');
    if (priceEl) price = parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
  }

  CompareManager.toggle({ id, name, price, img });
}

// --- Product Filtering & Sorting Engine ---
function applyFilters() {
  const selectedCategories = Array.from(document.querySelectorAll('[data-filter="category"] input:checked')).map(el => el.value);
  const selectedBrands = Array.from(document.querySelectorAll('[data-filter="brand"] input:checked')).map(el => el.value);
  const selectedConditions = Array.from(document.querySelectorAll('[data-filter="condition"] input:checked')).map(el => el.value);
  const sortByEl = document.getElementById('productSort');
  const sortBy = sortByEl ? sortByEl.value : 'featured';
  
  const products = Array.from(document.querySelectorAll('.products-grid > .product-card'));
  if (products.length === 0) return;

  // 1. Filtering
  let visibleCount = 0;
  products.forEach(card => {
    const cat = card.dataset.category || '';
    const brand = card.dataset.brand || '';
    const cond = card.dataset.condition || '';
    
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(cat);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
    const matchesCond = selectedConditions.length === 0 || selectedConditions.includes(cond);
    
    if (matchesCat && matchesBrand && matchesCond) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update count if element exists
  const countEl = document.querySelector('.results-count strong');
  if (countEl) countEl.textContent = visibleCount;

  // 2. Sorting
  const grid = document.querySelector('.products-grid');
  if (grid && sortBy !== 'featured') {
    const sorted = products.filter(p => p.style.display !== 'none').sort((a, b) => {
      const priceA = parseInt(a.dataset.price) || 0;
      const priceB = parseInt(b.dataset.price) || 0;
      if (sortBy === 'low-high') return priceA - priceB;
      if (sortBy === 'high-low') return priceB - priceA;
      return 0;
    });
    // Append in sorted order
    sorted.forEach(p => grid.appendChild(p));
  }
}


// Handle search from URL params
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search');
  const catParam = params.get('cat');
  const brandParam = params.get('brand');

  if (searchQuery) {
    const searchInput = document.getElementById('navSearchInput');
    if (searchInput) searchInput.value = searchQuery;
    doSearch(searchQuery);
  }

  if (catParam) {
    const cb = document.querySelector(`[data-filter="category"] input[value="${catParam}"]`);
    if (cb) { cb.checked = true; applyFilters(); }
  }

  if (brandParam) {
    const cb = document.querySelector(`[data-filter="brand"] input[value="${brandParam}"]`);
    if (cb) { cb.checked = true; applyFilters(); }
  }
}

// --- Condition Guide Modal ---
function openConditionGuide(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  
  const modalHTML = `
    <div class="modal-overlay" id="conditionModal" onclick="closeConditionModal()">
      <div class="modal-content condition-modal" onclick="event.stopPropagation()" style="max-width: 800px;">
        <button class="modal-close" onclick="closeConditionModal()">&times;</button>
        <div style="text-align:center; margin-bottom: 30px;">
          <h2 style="font-family:'Playfair Display', serif; color:var(--primary); font-size:2rem;">Quality Grading Standards</h2>
          <p style="color:var(--text-secondary);">Every TrueCycle device undergoes a 72-point rigorous inspection.</p>
        </div>
        
        <div class="condition-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
          <div class="condition-item" style="padding:20px; border-radius:12px; border:1px solid #76C043; background:rgba(118,192,67,0.05);">
            <div style="background:#76C043; color:white; display:inline-block; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:700; margin-bottom:12px;">LIKE NEW</div>
            <p style="font-size:0.9rem; line-height:1.6;">Flawless screen and body. No visible scratches or dents. Completely indistinguishable from a brand-new device. Battery health 95% or higher.</p>
          </div>
          <div class="condition-item" style="padding:20px; border-radius:12px; border:1px solid #006778; background:rgba(0,103,120,0.05);">
            <div style="background:#006778; color:white; display:inline-block; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:700; margin-bottom:12px;">EXCELLENT</div>
            <p style="font-size:0.9rem; line-height:1.6;">Minimal signs of wear. May have 1-2 micro-scratches barely visible to the eye. Frame is clean. Battery health 85% or higher.</p>
          </div>
          <div class="condition-item" style="padding:20px; border-radius:12px; border:1px solid #F39C12; background:rgba(243,156,18,0.05);">
            <div style="background:#F39C12; color:white; display:inline-block; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:700; margin-bottom:12px;">GOOD</div>
            <p style="font-size:0.9rem; line-height:1.6;">Visible signs of use. May have light scratches on screen and minor scuffing on the frame. 100% functional. Best value for money. Battery health 80% or higher.</p>
          </div>
        </div>

        <div style="margin-top:30px; padding:15px; background:var(--bg-secondary); border-radius:8px; display:flex; gap:15px; align-items:center;">
          <i class="fas fa-shield-alt" style="font-size:1.5rem; color:var(--primary);"></i>
          <p style="font-size:0.85rem; margin:0;"><strong>12-Month TrueCycle Warranty:</strong> Regardless of condition, all devices are covered for any hardware or performance issues.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeConditionModal() {
  const modal = document.getElementById('conditionModal');
  if (modal) modal.remove();
}

// --- Toast Notification Utility ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  
  // Show animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Search Logic ---
function doSearch(query) {
  if (!query || query.trim() === '') return;
  
  const searchStr = query.toLowerCase().trim();
  const currentPath = window.location.pathname;
  
  // Update Navbar inputs to match
  document.querySelectorAll('#navSearchInput').forEach(inp => inp.value = query);

  // If on products.html, use the powerful ProductUI engine
  if (currentPath.includes('products.html')) {
    if (typeof ProductUI !== 'undefined') {
      ProductUI.filters.search = searchStr;
      ProductUI.pagination.currentPage = 1;
      ProductUI.render();
      showToast(`Searching for "${query}"...`);
    }
  } else {
    // Redirect to products page with search param
    window.location.href = `products.html?search=${encodeURIComponent(searchStr)}`;
  }
}

// --- Products Rendering & Filtering Engine ---
const ProductUI = {
  container: null,
  products: [],
  filters: {
    categories: [],
    brands: [],
    conditions: [],
    minPrice: 0,
    maxPrice: Infinity,
    search: '',
    sort: 'featured'
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 6
  },

  init() {
    this.container = document.getElementById('productsGrid');
    if (!this.container) return;

    this.products = typeof productService !== 'undefined' ? productService.getProducts() : [];
    this.setupListeners();
    this.loadFromUrl();
    this.render();
  },

  setupListeners() {
    // Category Checkboxes
    document.querySelectorAll('[data-filter="category"] input, .filter-category input').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.updateFilter('categories', e.target.value, e.target.checked);
      });
    });

    // Brand Checkboxes
    document.querySelectorAll('[data-filter="brand"] input, .filter-brand input').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.updateFilter('brands', e.target.value, e.target.checked);
      });
    });

    // Condition Checkboxes
    document.querySelectorAll('[data-filter="condition"] input, .filter-condition input').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.updateFilter('conditions', e.target.value, e.target.checked);
      });
    });

    // Price Inputs
    const minPriceInp = document.getElementById('minPrice');
    const maxPriceInp = document.getElementById('maxPrice');
    const applyBtn = document.getElementById('applyFiltersBtn');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (minPriceInp) this.filters.minPrice = parseInt(minPriceInp.value) || 0;
        if (maxPriceInp) this.filters.maxPrice = parseInt(maxPriceInp.value) || Infinity;
        this.pagination.currentPage = 1;
        this.render();
        showToast('Filters applied!');
        window.scrollTo({ top: 300, behavior: 'smooth' });
      });
    }

    // Sort Dropdown
    const sortEl = document.getElementById('productSort');
    if (sortEl) {
      sortEl.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.render();
      });
    }

    // Pagination
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('page-btn')) {
        const page = parseInt(e.target.textContent);
        if (!isNaN(page)) {
          this.pagination.currentPage = page;
          this.render();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      }
    });

    // Handle Navbar and Search integration
    window.addEventListener('popstate', () => this.loadFromUrl());
  },

  updateFilter(key, value, isChecked) {
    if (isChecked) {
      if (!this.filters[key].includes(value)) this.filters[key].push(value);
    } else {
      this.filters[key] = this.filters[key].filter(v => v !== value);
    }
    this.pagination.currentPage = 1;
    this.render();
  },

  loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const brand = params.get('brand');
    const q = params.get('q') || params.get('search');
    const maxP = params.get('maxPrice');

    if (cat) {
      const lowerCat = cat.toLowerCase();
      this.filters.categories = [lowerCat];
      const cb = document.querySelector(`.filter-category input[value="${lowerCat}"], [data-filter="category"] input[value="${lowerCat}"]`);
      if (cb) cb.checked = true;
    }
    if (brand) {
        const lowerBrand = brand.toLowerCase();
        this.filters.brands = [lowerBrand];
        const cb = document.querySelector(`.filter-brand input[value="${lowerBrand}"], [data-filter="brand"] input[value="${lowerBrand}"]`);
        if (cb) cb.checked = true;
    }
    if (q) {
      this.filters.search = q.toLowerCase();
      const inps = document.querySelectorAll('#navSearchInput');
      inps.forEach(i => i.value = q);
    }
    if (maxP) {
      this.filters.maxPrice = parseInt(maxP);
      const inp = document.getElementById('maxPrice');
      if (inp) inp.value = maxP;
    }
    this.render();
  },

  render() {
    if (!this.container) return;

    // 1. Filter
    let filtered = this.products.filter(p => {
      const price = p.basePrice || p.price || 0;
      const matchCat = this.filters.categories.length === 0 || this.filters.categories.includes(p.category);
      const matchBrand = this.filters.brands.length === 0 || this.filters.brands.includes(p.brand);
      
      // Update Condition Matching (Array support)
      let matchCond = true;
      if (this.filters.conditions.length > 0) {
          if (p.conditions && Array.isArray(p.conditions)) {
              // Master Product format
              matchCond = this.filters.conditions.some(cf => p.conditions.some(pc => pc.label.toLowerCase() === cf.toLowerCase()));
          } else {
              // Legacy format
              matchCond = this.filters.conditions.includes(p.condition);
          }
      }

      const matchPrice = price >= this.filters.minPrice && price <= this.filters.maxPrice;
      
      // Smart Search 
      let matchSearch = true;
      if (this.filters.search) {
          const q = this.filters.search.toLowerCase();
          const underMatch = q.match(/(?:under|below|less than|within|prices?|rs|₹)\s?(\d+)/i);
          const aboveMatch = q.match(/(?:above|over|more than)\s?(\d+)/i);
          
          let priceLimit = null;
          let priceType = null; 

          if (underMatch) { priceLimit = parseInt(underMatch[1]); priceType = 'under'; } 
          else if (aboveMatch) { priceLimit = parseInt(aboveMatch[1]); priceType = 'above'; }

          const cleanQ = q.replace(/(?:under|below|less than|within|above|over|more than|prices?|rs|₹)\s?(\d+)/ig, '').trim();

          if (cleanQ) {
              matchSearch = p.name.toLowerCase().includes(cleanQ) || 
                            p.category.toLowerCase().includes(cleanQ) ||
                            p.brand.toLowerCase().includes(cleanQ);
          }
          
          if (matchSearch && priceLimit) {
              if (priceType === 'under') matchSearch = price <= priceLimit;
              if (priceType === 'above') matchSearch = price >= priceLimit;
          }
      }
      
      return matchCat && matchBrand && matchCond && matchPrice && matchSearch;
    });

    // 2. Sort
    if (this.filters.sort === 'low-high') {
      filtered.sort((a, b) => (a.basePrice || a.price || 0) - (b.basePrice || b.price || 0));
    } else if (this.filters.sort === 'high-low') {
      filtered.sort((a, b) => (b.basePrice || b.price || 0) - (a.basePrice || a.price || 0));
    }

    // 3. Paginate
    const total = filtered.length;
    const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const end = start + this.pagination.itemsPerPage;
    const paginated = filtered.slice(start, end);

    // 4. Render Grid HTML
    if (paginated.length === 0) {
      this.container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px 0;">
        <i class="fas fa-search" style="font-size:3rem; color:#eee; margin-bottom:15px;"></i>
        <h3>No products found</h3>
        <p style="color:#888;">Try adjusting your filters or search query.</p>
      </div>`;
    } else {
      this.container.innerHTML = paginated.map(p => {
        const price = p.basePrice || p.price || 0;
        const origPrice = p.originalPrice || 0;
        return `
        <div class="product-card" data-id="${p.id}" data-category="${p.category}" data-brand="${p.brand}" data-price="${price}">
          ${p.badgeText ? `<span class="product-badge ${p.badge}">${p.badgeText}</span>` : ''}
          <button class="product-wishlist" onclick="WishlistUI.handleToggle(this)"><i class="${wishlistService.isInWishlist(p.id) ? 'fas' : 'far'} fa-heart" ${wishlistService.isInWishlist(p.id) ? 'style="color:#E74C3C"' : ''}></i></button>
          <a href="product-detail?id=${p.id}" class="product-image">
            <img src="${p.images ? p.images[0] : p.img}" alt="${p.name}">
            <div class="product-quick-actions">
              <button class="quick-action-btn" title="View Detail"><i class="fas fa-eye"></i></button>
              <button class="quick-action-btn" onclick="addToCart(event)" title="Add to Cart"><i class="fas fa-shopping-cart"></i></button>
              <button class="quick-action-btn btn-compare" data-id="${p.id}" onclick="toggleCompare(event, '${p.id}', '${p.name}', ${price}, '${p.images ? p.images[0] : p.img}')" title="Compare"><i class="fas fa-exchange-alt"></i></button>
            </div>
          </a>
          <div class="product-info">
            <div class="product-condition">✓ Certified Refurbished</div>
            <h3><a href="product-detail?id=${p.id}">${p.name}</a></h3>
            <div class="product-rating"><span class="stars">${'★'.repeat(p.rating || 5)}${'☆'.repeat(5 - (p.rating || 5))}</span><span class="rating-count">(${p.reviews || 0})</span></div>
            <div class="product-price">
              <span class="current-price">₹${price.toLocaleString('en-IN')}${p.images ? ' onwards' : ''}</span>
              ${origPrice > price ? `<span class="original-price">₹${origPrice.toLocaleString('en-IN')}</span>` : ''}
            </div>
          </div>
        </div>
      `}).join('');
    }

    // 5. Update Results Count
    const countEl = document.querySelector('.results-count');
    if (countEl) {
        const showingEnd = Math.min(start + paginated.length, total);
        countEl.innerHTML = total > 0 ? `Showing <strong>${start + 1}-${showingEnd}</strong> of <strong>${total}</strong> products` : `Showing <strong>0</strong> products`;
    }

    // 6. Update Pagination UI
    this.updatePaginationUI(total);
    
    // Sync with other managers
    if (typeof CompareManager !== 'undefined') CompareManager.updateUI();
  },

  updatePaginationUI(total) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(total / this.pagination.itemsPerPage);
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === this.pagination.currentPage ? 'active' : ''}">${i}</button>`;
    }
    if (this.pagination.currentPage < totalPages) {
       html += `<button class="page-btn" onclick="ProductUI.nextPage()"><i class="fas fa-chevron-right"></i></button>`;
    }
    paginationContainer.innerHTML = html;
  },

  nextPage() {
    this.pagination.currentPage++;
    this.render();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
};

// --- Home Page Rendering (Dynamic Section Integration) ---
const HomeUI = {
    init() {
        this.products = typeof productService !== 'undefined' ? productService.getProducts() : [];
        if (this.products.length === 0) return;
        this.renderSections();
    },

    renderSections() {
        // 1. Deal of the Day (Random subset of 4 with assured badge)
        this.renderToGrid('deal-of-the-day-grid', this.products.slice(0, 4), true);

        // 2. iPhones
        const iphones = this.products.filter(p => p.brand === 'apple' && p.category === 'phones');
        this.renderToGrid('iphone-grid', iphones.slice(0, 5));

        // 3. Androids
        const androids = this.products.filter(p => p.brand !== 'apple' && p.category === 'phones');
        this.renderToGrid('android-grid', androids.slice(0, 5));

        // 4. Budget (Under 15k)
        const budget = this.products.filter(p => p.price <= 15000);
        this.renderToGrid('budget-grid', budget.slice(0, 5));

        // 5. Featured
        const featuredGrid = document.getElementById('featuredProducts');
        if (featuredGrid) this.renderToGrid('featuredProducts', this.products.slice(0, 4));
    },

    renderToGrid(elementId, items, showAssured = false) {
        const grid = document.getElementById(elementId);
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <div class="product-card" data-id="${p.id}">
              <button class="product-wishlist" onclick="WishlistUI.handleToggle(this)"><i class="${wishlistService.isInWishlist(p.id) ? 'fas' : 'far'} fa-heart" ${wishlistService.isInWishlist(p.id) ? 'style="color:#E74C3C"' : ''}></i></button>
              ${p.badgeText ? `<span class="product-badge ${p.badge}">${p.badgeText}</span>` : ''}
              <a href="product-detail?id=${p.id}" class="product-image" style="height: 200px; padding: 20px;">
                <img src="${p.images ? p.images[0] : p.img}" style="object-fit: contain; max-height: 100%;" alt="${p.name}">
                <div class="product-quick-actions">
                  <button class="quick-action-btn" onclick="addToCart(event)" title="Add to Cart"><i class="fas fa-shopping-cart"></i></button>
                  <button class="quick-action-btn btn-compare" data-id="${p.id}" onclick="toggleCompare(event, '${p.id}', '${p.name}', ${p.basePrice || p.price}, '${p.images ? p.images[0] : p.img}')" title="Compare"><i class="fas fa-exchange-alt"></i></button>
                </div>
              </a>
              <div class="product-info" style="padding: 15px;">
                <h3 style="font-size: 0.95rem; margin-bottom: 8px;"><a href="product-detail?id=${p.id}">${p.name}</a></h3>
                ${showAssured ? `
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                  <span style="background: var(--primary); color: white; font-size: 0.65rem; font-weight: 700; font-style: italic; padding: 2px 6px; border-radius: 2px;"><i class="fas fa-check-circle" style="font-size:0.6rem;"></i> TC-Assured</span>
                </div>` : ''}
                <div class="product-price">
                  <span class="current-price" style="font-size: 1.1rem;">₹${(p.basePrice || p.price).toLocaleString('en-IN')}${p.images ? ' onwards' : ''}</span>
                  ${(p.originalPrice > (p.basePrice || p.price)) ? `<span class="original-price" style="font-size: 0.85rem;">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
              </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProductUI.init();
    HomeUI.init();
});

// Global Toast Notification System (XSS-safe: uses textContent for message)
function showToast(message, type = 'success') {
    const existing = document.getElementById('tc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tc-toast';
    toast.style = `
        position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
        padding: 16px 32px; border-radius: 100px; color: white; font-weight: 800;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 10000; display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', sans-serif; animation: toastIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
        background: ${type === 'success' ? '#006778' : '#e74c3c'};
    `;

    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message; // textContent prevents XSS
    toast.appendChild(icon);
    toast.appendChild(msgSpan);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Add Toast Animations to head
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
    @keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 30px; opacity: 1; } }
    @keyframes toastOut { from { top: 30px; opacity: 1; } to { top: -50px; opacity: 0; } }
`;
document.head.appendChild(styleSheet);
