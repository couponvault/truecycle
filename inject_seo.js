const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'product-detail.html');
let content = fs.readFileSync(filePath, 'utf8');

const injection = `
      currentProduct.temp_selection = \`\${memLabel}\${selCond.label} - \${selColor.name}\`;

      // SEO JSON-LD Schema Injection
      let ldScript = document.getElementById('json-ld-product');
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.id = 'json-ld-product';
        ldScript.type = 'application/ld+json';
        document.head.appendChild(ldScript);
      }
      
      const convertedPrice = (typeof CurrencySystem.getConvertedAmount === 'function') 
          ? CurrencySystem.getConvertedAmount(finalPrice, '', currentProduct.baseCurrency || 'INR') 
          : finalPrice;
          
      ldScript.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": currentProduct.name,
        "image": currentProduct.images ? currentProduct.images[0] : currentProduct.img,
        "description": currentProduct.description || "Certified Refurbished Device by TrueCycle",
        "sku": currentProduct.id,
        "brand": { "@type": "Brand", "name": currentProduct.brand },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": typeof CurrencySystem !== 'undefined' ? CurrencySystem.selected : (currentProduct.baseCurrency || 'INR'),
          "price": convertedPrice,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/RefurbishedCondition"
        }
      });

    }
`;

content = content.replace(/currentProduct\.temp_selection = \`\$\{memLabel\}\$\{selCond\.label\} - \$\{selColor\.name\}\`;\s*\}\s*function changeImage/, injection + '\n    function changeImage');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ JSON-LD Schema Logic Injected implicitly into calculateAndDisplay');
