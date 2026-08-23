// Test CSS variables and structure in the zatamine theme
const fs = require('fs');
const path = require('path');

function testCSSVariables() {
    console.log('Testing CSS variables in zatamine theme...');
    
    // Read the main CSS file
    const cssFile = path.join(__dirname, '../assets/css/main.css');
    try {
        const cssContent = fs.readFileSync(cssFile, 'utf8');
        
        // Check for essential CSS variables (more comprehensive)
        const requiredVariables = [
            '--bg-color',
            '--text-color', 
            '--header-footer-border',
            '--link-color',
            '--border-radius',
            '--spacing-xs',
            '--spacing-sm',
            '--spacing-md',
            '--spacing-lg'
        ];
        
        let passed = 0;
        let failed = 0;
        
        requiredVariables.forEach(variable => {
            if (cssContent.includes(variable)) {
                console.log(`✅ ${variable} found in CSS`);
                passed++;
            } else {
                console.log(`❌ ${variable} missing from CSS`);
                failed++;
            }
        });
        
        // Check for important CSS selectors
        const requiredSelectors = [
            '.header',
            '.dark-mode-toggle',
            '.main-nav ul',
            '.nav-item',
            'body'
        ];
        
        requiredSelectors.forEach(selector => {
            if (cssContent.includes(selector)) {
                console.log(`✅ ${selector} found in CSS`);
                passed++;
            } else {
                console.log(`❌ ${selector} missing from CSS`);
                failed++;
            }
        });
        
        console.log(`\nCSS Results: ${passed} passed, ${failed} failed`);
        return failed === 0;
    } catch (error) {
        console.log('Error reading CSS file:', error.message);
        return false;
    }
}

function testCSSStructure() {
    console.log('\nTesting CSS structure...');
    
    const cssFile = path.join(__dirname, '../assets/css/main.css');
    try {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Check for key structural elements
        const checks = [
            { name: 'Has dark mode media query', check: content.includes('@media (prefers-color-scheme: dark)') },
            { name: 'Has responsive design rules', check: content.includes('@media screen and (max-width: 768px)') },
            { name: 'Has CSS transitions', check: content.includes('transition:') },
            { name: 'Has proper root variables', check: content.startsWith(':root {') }
        ];
        
        let passed = 0;
        let failed = 0;
        
        checks.forEach(check => {
            if (check.check) {
                console.log(`✅ ${check.name}`);
                passed++;
            } else {
                console.log(`❌ ${check.name}`);
                failed++;
            }
        });
        
        console.log(`\nCSS Structure Results: ${passed} passed, ${failed} failed`);
        return failed === 0;
    } catch (error) {
        console.log('Error reading CSS file:', error.message);
        return false;
    }
}

// Run all tests
const cssVarTestPassed = testCSSVariables();
const cssStructureTestPassed = testCSSStructure();

if (cssVarTestPassed && cssStructureTestPassed) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
}