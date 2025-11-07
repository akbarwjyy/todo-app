# PWA Testing Guide

## Local Testing

1. **Start Local Server**

   ```bash
   python -m http.server 8080
   ```

2. **Access the App**

   - Open browser and go to: `http://localhost:8080`
   - **Important**: Use `localhost` or `127.0.0.1` for PWA features to work

3. **Test PWA Features**

### Installation Test

- Look for "Install App" button in the app
- Or use browser's install option (Chrome: address bar icon)
- Try installing on mobile device

### Service Worker Test

- Open Chrome DevTools → Application → Service Workers
- Check if service worker is registered and active
- Test offline mode by going offline in DevTools

### Manifest Test

- Chrome DevTools → Application → Manifest
- Verify all manifest properties are loaded correctly
- Check icon display

### Offline Test

- Load the app online first
- Go to DevTools → Network → Check "Offline"
- Refresh page - app should still work
- Add/edit tasks while offline
- Go back online - changes should persist

### Mobile Testing

- Access `http://[your-local-ip]:8080` from mobile
- Test touch interactions
- Try installation on mobile browser

## PWA Checklist

### ✅ Basic Requirements

- [x] Served over HTTPS (localhost works for testing)
- [x] Has a web app manifest
- [x] Has a service worker
- [x] Icons for different sizes
- [x] Responsive design

### ✅ Enhanced Features

- [x] Offline functionality
- [x] Background sync support
- [x] Push notification support
- [x] Installable prompt
- [x] Standalone display mode
- [x] Proper meta tags

### ✅ Mobile Optimization

- [x] Touch-friendly interface
- [x] Proper viewport meta tag
- [x] Safe area support
- [x] Prevent zoom on input focus
- [x] Large touch targets (44px minimum)

### ✅ Accessibility

- [x] High contrast mode support
- [x] Reduced motion support
- [x] Keyboard navigation
- [x] Screen reader friendly

## Performance

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 90+ for PWA criteria

### Expected Scores

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+

## Deployment

### Production Requirements

1. **HTTPS**: Absolutely required for PWA features
2. **Domain**: Real domain (not IP address)
3. **Valid SSL Certificate**

### Hosting Options

- **GitHub Pages**: Free HTTPS hosting
- **Netlify**: Easy deployment with HTTPS
- **Vercel**: Great for static sites
- **Firebase Hosting**: Google's solution

### Deployment Steps

1. Upload all files to hosting service
2. Ensure HTTPS is enabled
3. Test PWA installation on real devices
4. Monitor service worker updates

## Troubleshooting

### Common Issues

**Install button not showing:**

- Check HTTPS requirement
- Verify manifest.json is valid
- Ensure service worker is registered
- Check browser PWA criteria

**Service worker not working:**

- Check for JavaScript errors
- Verify file paths are correct
- Hard refresh (Ctrl+Shift+R)
- Check Network tab for failed requests

**Offline mode not working:**

- Verify service worker caches resources
- Check cache names match
- Test with DevTools offline mode
- Look for fetch event errors

**Icons not displaying:**

- Check file paths in manifest
- Verify icon files exist
- Test different sizes
- Check console for errors

**App not installable on mobile:**

- Test with Chrome on Android
- Verify manifest display mode
- Check minimum PWA requirements
- Try different browsers

### Debug Tools

**Chrome DevTools:**

- Application → Service Workers
- Application → Manifest
- Application → Storage
- Network → Offline checkbox
- Lighthouse → PWA audit

**Firefox DevTools:**

- Application → Service Workers
- Application → Manifest

### Console Commands

Test PWA features in browser console:

```javascript
// Check if app is installable
window.deferredPrompt;

// Check service worker status
navigator.serviceWorker.controller;

// Test notification permission
Notification.permission;

// Check if running in standalone mode
window.matchMedia("(display-mode: standalone)").matches;

// Manual service worker registration
navigator.serviceWorker.register("/sw.js");
```

## Updates

### Service Worker Updates

1. Change CACHE_NAME in sw.js
2. Deploy new version
3. Service worker will update automatically
4. Users will see update notification

### Manifest Updates

- Changes take effect on next install
- Existing installations may need reinstall
- Test updates on different devices

---

**Happy PWA Development! 🚀**
