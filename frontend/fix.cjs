const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      let changed = false;
      if (content.includes('\\\\`')) {
        content = content.replace(/\\\\\`/g, '\`');
        changed = true;
      }
      if (content.includes('\\`')) {
        content = content.replace(/\\\`/g, '\`');
        changed = true;
      }
      if (content.includes('\\$')) {
        content = content.replace(/\\\$/g, '$');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(p, content);
      }
    }
  });
}

walk('src');
