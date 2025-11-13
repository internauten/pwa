// Service Worker Registration with Update Detection
if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Detect when a new service worker is waiting to activate
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);

                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

                // Check for updates on page focus
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        registration.update();
                    }
                });

                // Listen for new service worker waiting to activate
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is ready to activate
                            showUpdateNotification(registration);
                        }
                    });
                });

                // Check if there's already a waiting service worker
                if (registration.waiting) {
                    showUpdateNotification(registration);
                }
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Show update notification to user
function showUpdateNotification(registration) {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: slideDown 0.3s ease;
  `;

    updateBanner.innerHTML = `
    <span>🎉 New version available!</span>
    <button id="update-btn" style="
      background: white;
      color: #667eea;
      border: none;
      padding: 8px 20px;
      border-radius: 15px;
      font-weight: 600;
      cursor: pointer;
    ">Update Now</button>
    <button id="dismiss-btn" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 15px;
      border-radius: 15px;
      cursor: pointer;
    ">Later</button>
  `;

    document.body.appendChild(updateBanner);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideDown {
      from { top: -100px; opacity: 0; }
      to { top: 20px; opacity: 1; }
    }
  `;
    document.head.appendChild(style);

    // Update button click handler
    document.getElementById('update-btn').addEventListener('click', () => {
        if (registration.waiting) {
            // Tell the waiting service worker to activate immediately
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    });

    // Dismiss button
    document.getElementById('dismiss-btn').addEventListener('click', () => {
        updateBanner.remove();
    });
}// PWA Install Prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const installStatus = document.getElementById('installStatus');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to show install button
    installBtn.style.display = 'inline-block';
    installStatus.textContent = 'App ready to install!';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // Clear the deferredPrompt
        deferredPrompt = null;
        // Hide the install button
        installBtn.style.display = 'none';
        if (outcome === 'accepted') {
            installStatus.textContent = 'App installed successfully!';
        } else {
            installStatus.textContent = 'Installation cancelled';
        }
    }
});

// Check if already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installStatus.textContent = 'App is installed!';
    installBtn.style.display = 'none';
});

// Check if running as standalone (installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    installStatus.textContent = 'App is running as installed app!';
    installBtn.style.display = 'none';
} else if (!deferredPrompt) {
    installStatus.textContent = 'Use browser menu to install (Share → Add to Home Screen on iOS)';
}

// Notepad functionality with localStorage
const notepad = document.getElementById('notepad');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const saveStatus = document.getElementById('saveStatus');

// Load saved note on page load
window.addEventListener('load', () => {
    const savedNote = localStorage.getItem('myNote');
    if (savedNote) {
        notepad.value = savedNote;
    }
});

// Save note
saveBtn.addEventListener('click', () => {
    localStorage.setItem('myNote', notepad.value);
    saveStatus.textContent = '✅ Note saved successfully!';
    saveStatus.style.color = '#4CAF50';
    setTimeout(() => {
        saveStatus.textContent = '';
    }, 3000);
});

// Clear note
clearBtn.addEventListener('click', () => {
    notepad.value = '';
    localStorage.removeItem('myNote');
    saveStatus.textContent = '🗑️ Note cleared';
    saveStatus.style.color = '#ff6b6b';
    setTimeout(() => {
        saveStatus.textContent = '';
    }, 3000);
});

// Color picker functionality
const colorBoxes = document.querySelectorAll('.color-box');
colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
        const color = box.dataset.color;
        document.body.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`;

        // Save color preference
        localStorage.setItem('bgColor', color);

        // Visual feedback
        box.style.transform = 'scale(1.2)';
        setTimeout(() => {
            box.style.transform = '';
        }, 200);
    });
});

// Load saved color
const savedColor = localStorage.getItem('bgColor');
if (savedColor) {
    document.body.style.background = `linear-gradient(135deg, ${savedColor} 0%, ${adjustColor(savedColor, -30)} 100%)`;
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    const clamp = (val) => Math.min(Math.max(val, 0), 255);
    const fill = (str) => ('00' + str).slice(-2);

    const num = parseInt(color.slice(1), 16);
    const red = clamp((num >> 16) + amount);
    const green = clamp(((num >> 8) & 0x00FF) + amount);
    const blue = clamp((num & 0x0000FF) + amount);

    return '#' + fill(red.toString(16)) + fill(green.toString(16)) + fill(blue.toString(16));
}

// Online/Offline status
const onlineStatus = document.getElementById('onlineStatus');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    console.log('Connection status:', isOnline ? 'Online' : 'Offline');

    if (isOnline) {
        statusIndicator.textContent = '🟢';
        statusText.textContent = 'Online';
        onlineStatus.style.color = '#4CAF50';
    } else {
        statusIndicator.textContent = '🔴';
        statusText.textContent = 'Offline';
        onlineStatus.style.color = '#ff6b6b';
    }
}

// Add event listeners
window.addEventListener('online', () => {
    console.log('Online event fired');
    updateOnlineStatus();
});

window.addEventListener('offline', () => {
    console.log('Offline event fired');
    updateOnlineStatus();
});

// Initial status check
updateOnlineStatus();

// Poll connection status every 5 seconds as a fallback
setInterval(() => {
    updateOnlineStatus();
}, 5000);

// Auto-save notepad every 30 seconds
setInterval(() => {
    if (notepad.value.trim()) {
        localStorage.setItem('myNote', notepad.value);
    }
}, 30000);

// Prevent zoom on iOS double-tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('PWA loaded successfully!');
