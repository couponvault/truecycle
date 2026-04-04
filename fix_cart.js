const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('id="cartCount">3</span>')) {
    content = content.replace(/id="cartCount">3<\/span>/g, 'id="cartCount">0</span>');
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
