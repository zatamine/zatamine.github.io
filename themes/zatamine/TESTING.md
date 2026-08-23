# Testing the Zatamine Theme

This document explains how to test and verify the functionality of the zatamine Hugo theme, including its dark mode toggle feature.

## Running Automated Tests

The theme includes automated tests for various aspects of its functionality. To run these tests:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:css          # Test CSS variables and structure
npm run test:dark-mode  # Test dark mode implementation  
npm run test:ui       # Test UI components
npm run test:integration # Run integration tests
```

## Testing Dark Mode Functionality

### Manual Verification Steps

To manually verify the dark mode toggle works correctly:

1. Build the site:
   ```bash
   hugo
   ```

2. Serve the site:
   ```bash
   hugo server
   ```

3. Open your browser and navigate to the site

4. Verify that:
   - Only one icon (sun or moon) is visible at a time
   - Clicking the toggle button switches between icons correctly
   - The theme preference persists between page visits

### Expected Behavior

The dark mode toggle should behave as follows:
- Default state: Sun icon is visible, moon icon is hidden
- After clicking toggle to dark mode: Moon icon is visible, sun icon is hidden
- Clicking again returns to light mode with sun icon visible
- The choice persists between page loads using localStorage

## Test Coverage

The automated tests verify:

1. **CSS Variables**: All required CSS variables are present and correctly defined
2. **Dark Mode Implementation**: Proper CSS selectors for theme switching and icon visibility 
3. **JavaScript Functionality**: Theme toggle logic, localStorage persistence, and OS preference handling
4. **Integration**: End-to-end validation of the complete dark mode system

## Troubleshooting

If both icons appear simultaneously:

1. Check browser cache - clear it or use incognito mode
2. Verify no other CSS rules are overriding the theme selectors
3. Ensure the `data-theme` attribute is being properly set on the `<html>` element
4. Confirm that JavaScript is executing correctly in the browser

## Running Tests with Playwright (Advanced)

For more comprehensive UI testing:

```bash
# Install Playwright dependencies
npm install @playwright/test

# Run Playwright tests
npx playwright test tests/dark-mode.playwright.test.js
```

This will provide end-to-end verification of the dark mode functionality.