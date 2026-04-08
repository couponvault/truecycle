const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// The block to extract
const conditionGuideRegex = /(?:  )?<!-- Condition Guide Section -->[\s\S]*?<\/section>\n/;
const conditionGuideMatch = indexHtml.match(conditionGuideRegex);

if (conditionGuideMatch) {
    const conditionGuideHtml = conditionGuideMatch[0];
    
    // Remove it from its current position
    indexHtml = indexHtml.replace(conditionGuideRegex, '');
    
    // Insert it right before <!-- Testimonials -->
    indexHtml = indexHtml.replace('  <!-- Testimonials -->', conditionGuideHtml + '\n  <!-- Testimonials -->');
    
    fs.writeFileSync('index.html', indexHtml);
    console.log('Successfully moved Condition Guide before Testimonials.');
} else {
    console.log('Condition Guide Section not found.');
}

