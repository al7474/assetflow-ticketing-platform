# Dark Mode Implementation

## 🌓 Overview

AssetFlow now includes a complete dark mode implementation using Tailwind CSS's class-based dark mode strategy.

## ✨ Features

- **🎨 Complete Coverage**: All components support dark mode (Login, Register, Dashboard, Assets, Tickets, Pricing, Billing)
- **💾 Persistence**: Theme preference saved to localStorage
- **🔄 System Preference**: Automatically detects and respects OS dark mode preference
- **⚡ Smooth Transitions**: Elegant 200ms transitions between light and dark themes
- **🎯 Toggle Button**: Convenient sun/moon icon button in navbar
- **📱 Responsive**: Works seamlessly across all screen sizes

## 🏗️ Architecture

### Core Files

1. **ThemeContext** (`src/context/ThemeContext.jsx`)
   - Global theme state management
   - localStorage persistence
   - System preference detection
   - Adds/removes `dark` class on `<html>` element

2. **ThemeToggle** (`src/components/ThemeToggle.jsx`)
   - Sun/moon icon toggle button
   - Accessible with aria-label and title
   - Positioned in navbar

3. **Tailwind Config** (`tailwind.config.js`)
   - Enabled `darkMode: 'class'` strategy
   - Allows conditional dark: prefix classes

### Updated Components

All components now include dark mode classes:

- **App.jsx**: Background gradients, navbar, buttons, modals
- **Login.jsx**: Form inputs, backgrounds, borders
- **Register.jsx**: Form inputs, backgrounds, borders
- **Dashboard.jsx**: Cards, charts, backgrounds, text colors
- **PricingPage.jsx**: Pricing cards, buttons, backgrounds
- **BillingPage.jsx**: Usage bars, cards, backgrounds
- **index.css**: Global transitions, custom scrollbar styles

## 🎨 Color Palette

### Light Mode
- Background: `bg-white`, `bg-gray-50`
- Text: `text-gray-800`, `text-gray-600`
- Borders: `border-gray-200`, `border-gray-300`

### Dark Mode
- Background: `dark:bg-gray-800`, `dark:bg-gray-900`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-gray-600`, `dark:border-gray-700`

### Accent Colors (Auto-adjusted)
- Indigo: `indigo-500` → `dark:indigo-400`
- Green: `green-600` → `dark:green-400`
- Red: `red-600` → `dark:red-400`
- Orange: `orange-600` → `dark:orange-400`

## 🔧 Usage

### For Users

Click the sun/moon icon in the top-right corner of the navbar to toggle between light and dark modes. Your preference will be remembered.

### For Developers

**Adding dark mode to new components:**

```jsx
// Example component
function MyComponent() {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
        Click me
      </button>
    </div>
  );
}
```

**Using the theme context:**

```jsx
import { useTheme } from '../context/ThemeContext';

function CustomComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {isDark ? 'Dark' : 'Light'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 🧪 Testing

Test the following scenarios:

1. **Toggle Functionality**
   - Click theme toggle button
   - Verify instant theme change
   - Refresh page - theme should persist

2. **System Preference**
   - Clear localStorage: `localStorage.removeItem('theme')`
   - Change OS dark mode setting
   - Reload app - should match OS preference

3. **All Views**
   - Login/Register pages
   - Dashboard (if admin)
   - Assets view
   - Tickets view (if admin)
   - Pricing page
   - Billing page

4. **Visual Consistency**
   - Check all text is readable
   - Verify button hover states
   - Ensure charts/graphs are visible
   - Test modal dialogs
   - Verify form inputs

## 📊 Browser Support

- ✅ Chrome/Edge (89+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ All modern browsers supporting CSS custom properties

## 🎯 Best Practices

### Do's ✅
- Always add `dark:` variants for backgrounds
- Test both themes before committing
- Use semantic color names (e.g., `bg-gray-800` not `bg-dark`)
- Include transitions for smooth changes
- Maintain sufficient contrast ratios (WCAG AA)

### Don'ts ❌
- Don't use inline styles that override dark mode
- Don't forget to update text colors when changing backgrounds
- Don't use pure black (#000) - use `gray-900` instead
- Don't override global transitions unless necessary

## 🚀 Future Enhancements

Potential improvements:

- [ ] Auto theme switching based on time of day
- [ ] Multiple theme options (not just light/dark)
- [ ] Custom accent color picker
- [ ] High contrast mode for accessibility
- [ ] Theme preview before applying

## 📝 Accessibility

Dark mode implementation follows WCAG 2.1 guidelines:

- **Contrast Ratios**: All text meets AA standards (4.5:1 minimum)
- **Focus States**: Visible focus indicators in both themes
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Screen Readers**: Theme toggle has proper ARIA labels

## 🐛 Troubleshooting

**Theme not persisting?**
- Check browser localStorage is enabled
- Clear browser cache and cookies
- Verify ThemeProvider wraps entire app

**Colors look wrong?**
- Ensure Tailwind CSS is properly configured
- Check `darkMode: 'class'` is set in tailwind.config.js
- Verify no conflicting CSS overrides

**Transitions too slow/fast?**
- Adjust duration in `index.css` (default: 200ms)
- Change `transition-duration` value

## 📚 Resources

- [Tailwind CSS Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [React Context API](https://react.dev/reference/react/useContext)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Implementation Date**: February 2026  
**Status**: ✅ Complete and Production Ready
