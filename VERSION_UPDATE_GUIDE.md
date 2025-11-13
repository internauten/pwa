# Version Update Guide

## How Updates Work Now

The PWA now has **automatic update detection** with user notification. Here's how it works:

### 🔄 Update Detection

The service worker automatically checks for updates in three ways:

1. **On Page Load** - Checks every time the app loads
2. **Hourly** - Automatic background checks every 60 minutes
3. **On Focus** - When user returns to the app tab

### 📦 Update Strategy

**For HTML Pages (index.html):**

- **Network-First** strategy - Always tries to fetch the latest version from server
- Falls back to cache only if offline
- New version is automatically cached when fetched

**For Assets (CSS, JS, images):**

- **Cache-First** strategy - Serves from cache for speed
- Updates cache in background when online
- New versions available after service worker update

### 🎉 User Experience

When a new version is detected:

1. **Notification Banner** appears at the top of the screen
2. User sees: "🎉 New version available!"
3. Two options:
   - **Update Now** - Immediately activates new version and reloads
   - **Later** - Dismisses notification, update happens on next full reload

### 🚀 Deploying Updates

When you deploy a new version:

1. **Update the cache version** in `sw.js`:

   ```javascript
   const CACHE_NAME = 'my-pwa-v2'; // Increment version
   ```

2. **Deploy your changes** to your hosting service

3. **Users will see**:
   - Existing users: Update notification banner within 1 hour (or immediately on next visit)
   - New users: Automatic installation of latest version

### 💡 Best Practices

#### Always Increment Cache Version

```javascript
// In sw.js
const CACHE_NAME = 'my-pwa-v1'; // Before
const CACHE_NAME = 'my-pwa-v2'; // After update
```

#### For Critical Fixes

If you need users to get updates immediately:

1. Increment cache version
2. Users online will get notification within 1 hour
3. Users will get update on next app visit

#### Testing Updates Locally

##### Option 1: DevTools

1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Refresh page

##### Option 2: Unregister

1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh page

##### Option 3: Clear Cache

1. Open DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh page

### 🔧 Manual Update Function

You can also trigger updates programmatically:

```javascript
// Force check for updates
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) reg.update();
  });
}
```

### 📊 Update Flow Diagram

```
User visits app
     ↓
Service Worker checks for updates
     ↓
New version found?
     ├─ No → Continue with cached version
     └─ Yes → Download new service worker
           ↓
       New SW installed (waiting state)
           ↓
       Show update banner to user
           ↓
       User clicks "Update Now"?
           ├─ Yes → Activate new SW → Reload page
           └─ No → Update on next full refresh
```

### 🐛 Troubleshooting

**Update not showing?**

1. Check browser DevTools console for errors
2. Verify CACHE_NAME was incremented
3. Clear browser cache and hard reload (Ctrl+Shift+R)
4. Check if service worker is registered in DevTools → Application

**Old version still loading?**

1. Close ALL tabs with the app
2. Reopen the app
3. Or use "Update Now" button when it appears

**Force clear everything:**

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
location.reload();
```

## Example Version Update Workflow

### Scenario: Fix a bug in app.js

1. **Make your fix** in `app.js`

2. **Update service worker**:

   ```javascript
   // sw.js
   const CACHE_NAME = 'my-pwa-v2'; // Changed from v1
   ```

3. **Commit and deploy** to your hosting

4. **Users experience**:
   - Next time they visit (or within 1 hour): Update banner appears
   - Click "Update Now": Instant reload with new version
   - Click "Later": Gets update on next manual page refresh

### Scenario: Major redesign with new files

1. **Add new files** and update existing ones

2. **Update sw.js**:

   ```javascript
   const CACHE_NAME = 'my-pwa-v3';
   const urlsToCache = [
     '/',
     '/index.html',
     '/styles.css',
     '/app.js',
     '/manifest.json',
     '/new-feature.js', // Added new file
   ];
   ```

3. **Deploy and users get update notification**

## Version History Tracking (Optional)

Consider adding a version indicator in your app:

```html
<!-- In index.html -->
<footer>
  <p>&copy; 2025 My PWA | v2.0.0</p>
</footer>
```

```javascript
// In app.js
const APP_VERSION = '2.0.0';
console.log(`App Version: ${APP_VERSION}`);
localStorage.setItem('app-version', APP_VERSION);
```

This helps you track which version users are on when debugging issues.
