// Simple test to verify React app structure
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing React App Structure...\n');

// Check if key files exist
const filesToCheck = [
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/pages/Dashboard.jsx',
  'src/components/Navigation.jsx',
  'src/components/ui/Button.jsx',
  'src/components/ui/Input.jsx',
  'package.json'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📋 Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present!');
  console.log('\n🚀 To run the application:');
  console.log('1. npm install');
  console.log('2. npm run dev');
  console.log('3. Open http://localhost:5173 in your browser');
} else {
  console.log('❌ Some files are missing. Please check the file structure.');
}

console.log('\n📱 Mobile Testing Tips:');
console.log('- Use Chrome DevTools device emulation');
console.log('- Test on actual mobile devices');
console.log('- Check responsive breakpoints: 640px, 768px, 1024px, 1280px');
