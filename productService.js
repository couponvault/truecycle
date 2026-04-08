const productService = {
    key: 'mintmobi_products',
    cache: [],
    isLoaded: false,

    /** Strip dangerous keys (__proto__, constructor) to prevent prototype pollution */
    sanitize(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        const dangerous = ['__proto__', 'constructor', 'prototype'];
        if (Array.isArray(obj)) return obj.map(item => this.sanitize(item));
        const clean = {};
        for (const key of Object.keys(obj)) {
            if (dangerous.includes(key)) continue;
            clean[key] = (typeof obj[key] === 'object') ? this.sanitize(obj[key]) : obj[key];
        }
        return clean;
    },

    // Seed data (used only if Cloud is empty)
    seedData: [
        { 
            id: 'p1', 
            name: 'Apple iPhone 15 Pro', 
            category: 'phones', 
            brand: 'apple', 
            basePrice: 85000,
            originalPrice: 129900,
            images: [
                'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&fit=crop',
                'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&fit=crop'
            ],
            rating: 5, reviews: 142,
            description: 'The iPhone 15 Pro features a gorgeous Titanium design and the A17 Pro chip.',
            variants: [
                { ram: '8GB', storage: '128GB', prices: { fair: 72000, good: 85000, superb: 98000 }, stock: 12 },
                { ram: '8GB', storage: '256GB', prices: { fair: 81000, good: 95000, superb: 110000 }, stock: 8 }
            ],
            conditions: [{ label: 'Fair', adjustment: -0.15 }, { label: 'Good', adjustment: 0 }, { label: 'Superb', adjustment: 0.15 }],
            colors: [{ name: 'Natural Titanium', hex: '#BEBAA7', stock: 10, priceAdd: 0 }, { name: 'Blue Titanium', hex: '#2F3641', stock: 5, priceAdd: 1000 }]
        },
        { 
            id: 'p2', 
            name: 'Samsung Galaxy S24 Ultra', 
            category: 'phones', 
            brand: 'samsung', 
            basePrice: 95000,
            originalPrice: 139900,
            images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&fit=crop'],
            rating: 5, reviews: 89,
            description: 'The ultimate Galaxy AI experience with a 200MP camera and Titanium frame.',
            variants: [
                { ram: '12GB', storage: '256GB', prices: { fair: 85000, good: 95000, superb: 112000 }, stock: 5 },
                { ram: '12GB', storage: '512GB', prices: { fair: 98000, good: 110000, superb: 128000 }, stock: 3 }
            ],
            conditions: [{ label: 'Fair', adjustment: -0.15 }, { label: 'Good', adjustment: 0 }, { label: 'Superb', adjustment: 0.15 }],
            colors: [{ name: 'Titanium Gray', hex: '#8E8E93', stock: 10, priceAdd: 0 }]
        }
    ],

    async init() {
        if (typeof tcCloud === 'undefined' || !tcCloud) {
            console.warn("Cloud connection not ready, falling back to LocalStorage.");
            this.cache = JSON.parse(localStorage.getItem(this.key) || JSON.stringify(this.seedData));
            this.isLoaded = true;
            return;
        }

        try {
            // 1. Fetch from Cloud
            const { data, error } = await tcCloud.from('products').select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                // Map DB snake_case to Frontend camelCase
                this.cache = data.map(p => ({
                    ...p,
                    basePrice: p.base_price,
                    originalPrice: p.original_price,
                    baseCurrency: p.base_currency || "INR"
                }));
                console.log("TrueCycle Cloud: Products synced from database.");
            } else {
                // 2. Initial Migration: Sync Seed/Local data to Cloud
                console.log("TrueCycle Cloud: Empty database detected. Migrating local data...");
                const localData = JSON.parse(localStorage.getItem(this.key) || JSON.stringify(this.seedData));
                
                const toInsert = localData.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    brand: p.brand,
                    base_price: p.basePrice || 0,
                    original_price: p.originalPrice || 0,
                    base_currency: p.baseCurrency || "INR",
                    images: p.images,
                    rating: p.rating,
                    reviews: p.reviews,
                    description: p.description,
                    variants: p.variants,
                    conditions: p.conditions,
                    colors: p.colors,
                    pricing_grid: p.pricingGrid || {}
                }));

                const { insertError } = await tcCloud.from('products').insert(toInsert);
                if (insertError) console.error("Cloud Migration Error:", insertError);
                this.cache = localData;
            }
            this.isLoaded = true;
            // Notify UI components that data is ready
            window.dispatchEvent(new CustomEvent('productsReady'));
            if (window.ProductUI && window.ProductUI.init && document.getElementById('productsGrid')) window.ProductUI.init();
            if (window.HomeUI && window.HomeUI.init && document.querySelector('[id$="-grid"]')) window.HomeUI.init();

        } catch (err) {
            console.error("Supabase Initialization Error:", err);
            this.cache = JSON.parse(localStorage.getItem(this.key) || JSON.stringify(this.seedData));
            this.isLoaded = true;
            window.dispatchEvent(new CustomEvent('productsReady'));
        }
    },

    getProducts() {
        // Returns the cached cloud data (synchronous for legacy support)
        return this.cache.map(p => this.sanitize(p));
    },

    getPrice(product, variantIdx, colorIdx, condition) {
        if (!product) return 0;
        if (product.pricingGrid) {
            const key = `${variantIdx}-${colorIdx}-${condition.toLowerCase()}`;
            if (product.pricingGrid[key]) return product.pricingGrid[key];
        }
        if (product.variants && product.variants[variantIdx]) {
            const v = product.variants[variantIdx];
            const condKey = condition.toLowerCase();
            const base = (v.prices && v.prices[condKey]) ? v.prices[condKey] : (product.basePrice || 0);
            const colorAdj = (product.colors && product.colors[colorIdx]) ? (product.colors[colorIdx].priceAdd || 0) : 0;
            return base + colorAdj;
        }
        return product.basePrice || 0;
    },

    async addProduct(product) {
        const newProduct = {
            id: 'p_' + Date.now(),
            ...product,
            basePrice: parseInt(product.basePrice) || 0,
            originalPrice: parseInt(product.originalPrice) || 0
        };

        if (typeof tcCloud !== 'undefined' && tcCloud) {
            const { error } = await tcCloud.from('products').insert([{
                id: newProduct.id,
                name: newProduct.name,
                category: newProduct.category,
                brand: newProduct.brand,
                base_price: newProduct.basePrice,
                original_price: newProduct.originalPrice,
                base_currency: newProduct.baseCurrency || "INR",
                images: newProduct.images,
                rating: newProduct.rating,
                reviews: newProduct.reviews,
                description: newProduct.description,
                variants: newProduct.variants,
                conditions: newProduct.conditions,
                colors: newProduct.colors,
                pricing_grid: newProduct.pricingGrid
            }]);
            if (error) console.error("Supabase Add Error:", error);
        }

        this.cache.push(newProduct);
        localStorage.setItem(this.key, JSON.stringify(this.cache));
        return newProduct;
    },

    async updateProduct(id, product) {
        const updated = {
            ...product,
            id: id,
            basePrice: parseInt(product.basePrice) || 0,
            originalPrice: parseInt(product.originalPrice) || 0
        };

        if (typeof tcCloud !== 'undefined' && tcCloud) {
            const { error } = await tcCloud.from('products').update({
                name: updated.name,
                category: updated.category,
                brand: updated.brand,
                base_price: updated.basePrice,
                original_price: updated.originalPrice,
                base_currency: updated.baseCurrency,
                images: updated.images,
                description: updated.description,
                variants: updated.variants,
                conditions: updated.conditions,
                colors: updated.colors,
                pricing_grid: updated.pricingGrid
            }).eq('id', id);
            if (error) console.error('Supabase Update Error:', error);
        }

        const idx = this.cache.findIndex(p => p.id === id);
        if (idx > -1) this.cache[idx] = updated;
        localStorage.setItem(this.key, JSON.stringify(this.cache));
        return updated;
    },

    async deleteProduct(id) {
        if (typeof tcCloud !== 'undefined' && tcCloud) {
            const { error } = await tcCloud.from('products').delete().eq('id', id);
            if (error) console.error("Supabase Delete Error:", error);
        }
        this.cache = this.cache.filter(p => p.id !== id);
        localStorage.setItem(this.key, JSON.stringify(this.cache));
    },

    getProductById(id) {
        return this.cache.find(p => p.id === id) || null;
    }
};

// Start the cloud engine
productService.init();
