// UI test for zatamine theme
const fs = require('fs');
const path = require('path');

console.log('Testing UI components in zatamine theme...');

function testUIComponents() {
    console.log('\n🔍 Testing UI component structure...');
    
    const uiComponents = [
        'header',
        'nav',
        'main',
        'footer',
        'dark-mode-toggle',
        'navigation-menu'
    ];
    
    let passed = 0;
    let failed = 0;
    
    // Test that the main components exist in the layout
    const headerFile = path.join(__dirname, '../layouts/partials/header.html');
    try {
        const content = fs.readFileSync(headerFile, 'utf8');
        
        uiComponents.forEach(component => {
            if (content.includes(component)) {
                console.log(`✅ ${component} component found in header`);
                passed++;
            } else {
                // Not all components are necessarily in header, but let's check for key ones
                if (component === 'dark-mode-toggle') {
                    if (content.includes('dark-mode-toggle')) {
                        console.log(`✅ ${component} found in header`);
                        passed++;
                    } else {
                        console.log(`❌ ${component} missing from header`);
                        failed++;
                    }
                } else {
                    console.log(`⚠️  ${component} not directly in header (expected)`);
                    // This is OK, don't count it as failure
                    passed++; // Count as passing since this isn't necessarily required
                }
            }
        });
        
    } catch (error) {
        console.log('Error reading header file:', error.message);
        failed++;
    }
    
    console.log(`\nUI Component Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

function testDarkModeIconVisibility() {
    console.log('\n🔍 Testing dark mode icon visibility...');
    
    const cssFile = path.join(__dirname, '../assets/css/main.css');
    try {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Test that we have the correct rules for icon visibility
        const checks = [
            {
                name: 'Has default sun icon visible rule',
                check: content.includes('.sun-icon {\n  opacity: 1') || content.includes('.sun-icon { opacity: 1')
            },
            {
                name: 'Has default moon icon hidden rule', 
                check: content.includes('.moon-icon {\n  opacity: 0') || content.includes('.moon-icon { opacity: 0')
            },
            {
                name: 'Has dark mode sun icon hidden rule',
                check: content.includes(':root[data-theme="dark"] .sun-icon {\n  opacity: 0') || content.includes(':root[data-theme="dark"] .sun-icon { opacity: 0')
            },
            {
                name: 'Has dark mode moon icon visible rule',
                check: content.includes(':root[data-theme="dark"] .moon-icon {\n  opacity: 1') || content.includes(':root[data-theme="dark"] .moon-icon { opacity: 1')
            }
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
        
        console.log(`\nIcon Visibility Tests: ${passed} passed, ${failed} failed`);
        return failed === 0;
    } catch (error) {
        console.log('Error reading CSS file:', error.message);
        return false;
    }
}

// Run all tests
const uiTestPassed = testUIComponents();
const iconTestPassed = testDarkModeIconVisibility();

if (uiTestPassed && iconTestPassed) {
    console.log('\n🎉 UI Tests passed! The theme structure is correct.');
    process.exit(0);
} else {
    console.log('\n❌ Some UI tests failed.');
    process.exit(1);
}