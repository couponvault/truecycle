const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const navMatch = indexHtml.match(/<!-- Top Bar -->[\s\S]*?<\/nav>/);

if (navMatch) {
    const freshNav = navMatch[0];
    const files = ['about.html', 'contact.html', 'sell.html'];

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        // Simple replace for any existing navbar
        content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/, freshNav);
        fs.writeFileSync(file, content);
        console.log(`Updated navbar in ${file}`);
    });
} else {
    console.error("Could not find Top Bar in index.html");
}

