const fs = require('fs');
const path = require('path');

const files = [
  'src/components/dashboard/welcome-card.tsx',
  'src/components/dashboard/tabs/agency-properties-tab.tsx',
  'src/components/dashboard/tabs/invoices-tab.tsx',
  'src/components/dashboard/stats-tab.tsx',
  'src/components/dashboard/plan-card.tsx',
  'src/components/dashboard/agency-team-management.tsx',
  'src/components/dashboard/agency-management.tsx'
];

files.forEach(file => {
  const absolutePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    // Remove extra > at the end of lines with ">
    // Pattern: "> followed by any number of spaces, then another >
    const newContent = content.replace(/">[\s]*>/g, '">');
    if (content !== newContent) {
      fs.writeFileSync(absolutePath, newContent);
      console.log(`Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
