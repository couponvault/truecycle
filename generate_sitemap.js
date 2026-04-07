const fs = require('fs');
const path = require('path');

// 1. Read Product Service
const productFile = path.join(process.cwd(), 'productService.js');
let jsContent = fs.readFileSync(productFile, 'utf8');

// 2. Mock environment for evaluating
jsContent = jsContent.replace('const productService =', 'module.exports =');
jsContent = jsContent.replace(/window\.dispatchEvent|console\.warn|console\.log|console\.error|localStorage\.getItem|tcCloud\.from/g, '(() => {})');

// Save a temporary module
const tempFile = path.join(process.cwd(), 'tempProdService.js');
fs.writeFileSync(tempFile, jsContent);

// 3. Import and extract seedData
const productService = require('./tempProdService');
const products = productService.seedData || [];

// 4. Generate Sitemap URL Nodes
let urlNodes = products.map(p => {
    return `
  <url>
    <loc>https://truecycle.vercel.app/product-detail.html?id=${p.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
}).join('');

// 5. Build Complete Sitemap XML
const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://truecycle.vercel.app/</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://truecycle.vercel.app/products.html</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://truecycle.vercel.app/about.html</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://truecycle.vercel.app/contact.html</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://truecycle.vercel.app/privacy.html</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://truecycle.vercel.app/terms.html</loc>
    <lastmod>2026-04-04</lastmod>
    <priority>0.3</priority>
  </url>${urlNodes}
</urlset>`;

// 6. Output to sitemap.xml
fs.writeFileSync(path.join(process.cwd(), 'sitemap.xml'), sitemapXML, 'utf8');

// Cleanup
fs.unlinkSync(tempFile);
console.log('✅ Generated Dynamic Sitemap.xml with', products.length, 'products mapped.');
