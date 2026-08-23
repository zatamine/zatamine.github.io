// Dark mode specific testing — validates the real theme implementation
const fs = require('fs');
const path = require('path');

function testThemeCSS() {
    console.log('Testing dark mode in assets/css/main.css...');

    const cssFile = path.join(__dirname, '../assets/css/main.css');
    try {
        const content = fs.readFileSync(cssFile, 'utf8');

        const checks = [
            { name: 'CSS responds to data-theme="dark"', check: content.includes(':root[data-theme="dark"]') },
            { name: 'Dark variables applied via data-theme', check: content.includes(':root[data-theme="dark"]') && content.includes('--bg-color: #1a1a1a') },
            { name: 'Sun icon hidden in dark theme', check: content.includes(':root[data-theme="dark"] .sun-icon') },
            { name: 'Moon icon shown in dark theme', check: content.includes(':root[data-theme="dark"] .moon-icon') },
            { name: 'Moon icon hidden by default (light mode)', check: content.includes('.moon-icon {\n  opacity: 0;') || content.includes('.moon-icon { opacity: 0;') },
            { name: 'OS preference respected when no choice made', check: content.includes(':root:not([data-theme="light"])') }
        ];

        return runChecks(checks, 'Theme CSS Results');
    } catch (error) {
        console.log('Error reading CSS file:', error.message);
        return false;
    }
}

function testThemeJS() {
    console.log('\nTesting dark mode in assets/js/main.js...');

    const jsFile = path.join(__dirname, '../assets/js/main.js');
    try {
        const content = fs.readFileSync(jsFile, 'utf8');

        const checks = [
            { name: 'Sets data-theme on document root', check: content.includes('document.documentElement.setAttribute(\'data-theme\'') },
            { name: 'Toggles between light and dark', check: content.includes("'light' : 'dark'") },
            { name: 'Persists choice in localStorage', check: content.includes("localStorage.setItem('theme'") },
            { name: 'Reads saved preference on load', check: content.includes("localStorage.getItem('theme')") },
            { name: 'Falls back to OS preference', check: content.includes("(prefers-color-scheme: dark)") },
            { name: 'Toggle button event listener attached', check: content.includes('darkModeToggle.addEventListener') }
        ];

        return runChecks(checks, 'Theme JS Results');
    } catch (error) {
        console.log('Error reading JS file:', error.message);
        return false;
    }
}

function runChecks(checks, label) {
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

    console.log(`\n${label}: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

const cssPassed = testThemeCSS();
const jsPassed = testThemeJS();

if (cssPassed && jsPassed) {
    console.log('\n🎉 Dark mode tests passed!');
    process.exit(0);
} else {
    console.log('\n❌ Dark mode tests failed.');
    process.exit(1);
}