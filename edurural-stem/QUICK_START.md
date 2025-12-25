# 🚀 EduRural STEM - Quick Start Guide

Get your offline-first STEM education app running in **5 minutes**!

---

## ⚡ 5-Minute Quick Start

### Step 1: Download & Extract (1 minute)
```bash
# Navigate to the project folder
cd edurural-stem
```

### Step 2: Start Local Server (1 minute)
**Option A: Using Python 3**
```bash
python -m http.server 8000
```

**Option B: Using Node.js**
```bash
npx http-server
```

**Option C: Using VS Code**
- Install "Live Server" extension
- Right-click index.html → "Open with Live Server"

### Step 3: Open in Browser (1 minute)
```
http://localhost:8000
```

You should see the EduRural STEM landing page!

### Step 4: Test Offline Mode (1 minute)
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Check "Offline" checkbox
4. Reload the page (Ctrl+R)
5. **It should still load!** ✅

### Step 5: Test Authentication (1 minute)
1. Click "Student Login" button
2. Enter any email: `student@example.com`
3. Enter any password: `password123`
4. Click "Login"
5. You should see the student dashboard!

---

## 🔑 Demo Credentials

Use these for quick testing:

**Student Account**
- Email: `student@example.com`
- Password: `password123`

**Teacher Account**
- Email: `teacher@example.com`
- Password: `password123`

*(These work offline - Firebase not required for demo)*

---

## 📋 Checklist: What Works Out of the Box

✅ **Landing Page**
- Login form
- Signup form
- Language switching
- PWA install button
- Feature cards

✅ **Student Dashboard**
- Lesson list
- Progress tracking
- Quiz shortcuts
- Category filtering
- Student stats

✅ **Lessons**
- Full lesson content
- Multiple interactive examples
- Progress saving
- Next lesson navigation
- Mark complete button

✅ **Quizzes**
- Multiple choice questions
- Instant feedback
- Score calculation
- Results summary
- Explanations

✅ **Offline**
- Service Worker caching
- All pages accessible offline
- Quiz completion offline
- Auto-sync when online
- No data loss

✅ **Languages**
- English (en)
- Spanish (es)
- Hausa (ha)
- Swahili (sw)
- Toggle with language button

✅ **Mobile**
- Responsive design
- Touch-friendly buttons
- Mobile-optimized layout
- PWA installable

---

## 🎯 Feature Overview

### For Students
- 📚 Access lessons offline
- 🎯 Take quizzes and track scores
- 📊 See progress dashboard
- 🌍 Learn in 4 languages
- 📱 Works on any device
- 🔄 Auto-syncs when online

### For Teachers
- 👥 View student progress
- 📈 Class analytics
- 📋 Assign lessons
- 📊 Track quiz scores
- 📝 Manage content
- 📪 Monitor engagement

### Technical
- 🚀 100% offline-first
- 💾 IndexedDB storage
- 🔥 Firebase integration
- 📲 PWA installable
- 🔒 Secure authentication
- ⚡ Lightning fast

---

## 🛠️ File Structure You Need to Know

```
edurural-stem/
├── index.html              ← Start here!
├── manifest.json           ← PWA config
├── sw.js                   ← Service Worker
│
├── css/
│   └── styles.css         ← All styling
│
├── js/
│   ├── app.js             ← App initialization
│   ├── auth.js            ← Login/signup
│   ├── firebase.js        ← Backend setup
│   ├── indexedDB.js       ← Local storage
│   ├── i18n.js            ← Languages
│   ├── router.js          ← Navigation
│   ├── sync.js            ← Offline sync
│   └── ui.js              ← UI rendering
│
├── pages/
│   ├── student-dashboard.html
│   ├── teacher-dashboard.html
│   ├── lesson.html
│   ├── quiz.html
│   └── offline.html
│
├── data/
│   ├── lessons.json       ← Add your lessons here!
│   └── quiz.json          ← Add your quizzes here!
│
└── docs/ (documentation)
```

---

## 🔧 Common Tasks

### Add a New Lesson
1. Open `data/lessons.json`
2. Add new object to lessons array:
```json
{
  "id": "lesson-new",
  "title": {
    "en": "Your Lesson Title",
    "es": "Título de tu lección",
    "ha": "Girke Jiya",
    "sw": "Kichwa cha Somo"
  },
  "category": "Physics",
  "duration": 45,
  "level": "beginner",
  "content": {
    "en": "<h2>Lesson Content</h2><p>Your content here...</p>",
    "es": "<h2>Contenido</h2><p>Tu contenido aquí...</p>",
    "ha": "<h2>Aikin</h2><p>Ka samu nawa...</p>",
    "sw": "<h2>Maudhui</h2><p>Maudhui yako hapa...</p>"
  },
  "examples": [
    {
      "title": "Example 1",
      "steps": ["Do this", "Then that", "Finally this"]
    }
  ]
}
```
3. Save and reload app
4. New lesson appears automatically!

### Add a New Quiz
1. Open `data/quiz.json`
2. Add new quiz object:
```json
{
  "id": "quiz-new",
  "title": "My Quiz",
  "lessonId": "lesson-new",
  "timeLimit": 1800,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "text": "What is the answer?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true }
      ],
      "explanation": "Option B is correct because..."
    }
  ]
}
```
3. Save and reload
4. Quiz is available!

### Change App Colors
1. Open `css/styles.css`
2. Find the color variables:
```css
:root {
  --primary-color: #4CAF50;      /* Change green */
  --secondary-color: #FF9800;    /* Change orange */
  --accent-color: #2196F3;       /* Change blue */
}
```
3. Edit colors (use hex codes from [ColorPicker](https://htmlcolorcodes.com/))
4. Save and reload
5. Colors update everywhere!

### Change App Name
1. Open `manifest.json`
2. Change "name" and "short_name":
```json
{
  "name": "Your App Name",
  "short_name": "YAN"
}
```
3. Open `js/app.js`
4. Find translation object and update app_name
5. Done!

---

## 🐛 Troubleshooting

### App won't load
**Solution:**
1. Check browser console for errors (F12)
2. Make sure server is running
3. Try clearing cache: Ctrl+Shift+Delete
4. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Service Worker not working
**Solution:**
1. Must use HTTPS or localhost
2. Check DevTools → Application → Service Workers
3. Try unregistering: DevTools → Application → unregister
4. Refresh page
5. Should register again

### Offline mode not working
**Solution:**
1. Check DevTools → Network → check if assets are cached
2. Enable Service Worker (see above)
3. Visit page online first (to cache)
4. Then toggle offline
5. Reload page

### Quiz answers not saving
**Solution:**
1. Check IndexedDB (DevTools → Storage → IndexedDB)
2. Verify localStorage isn't disabled
3. Check console for errors
4. Try clearing app data and restart

### Language not changing
**Solution:**
1. Click language toggle button
2. Check localStorage (DevTools → Storage → Local Storage)
3. Look for 'language' key
4. Verify new language in localStorage
5. Refresh page

---

## 📱 Mobile Installation

### Android
1. Open app in Chrome
2. Tap menu (3 dots) → "Install app"
3. Tap "Install"
4. App appears on home screen
5. Opens fullscreen like native app

### iPhone
1. Open app in Safari
2. Tap Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App appears on home screen

### Desktop
1. Open app in Chrome/Edge
2. Click install icon (appears in address bar)
3. Click "Install"
4. App opens in window
5. Works offline!

---

## 🧪 Testing Checklist

Run through these to verify everything works:

### Basic Functionality
- [ ] App loads at localhost:8000
- [ ] Can see landing page
- [ ] Can click login button
- [ ] Can type in form
- [ ] Can navigate to dashboard
- [ ] Can see lessons list
- [ ] Can click on lesson
- [ ] Can read lesson content
- [ ] Can click on quiz
- [ ] Can answer quiz questions
- [ ] Can see results

### Offline Mode
- [ ] Offline DevTools toggle works
- [ ] App still loads offline
- [ ] Can navigate offline
- [ ] Can take quiz offline
- [ ] Answers save offline
- [ ] Can read lessons offline
- [ ] Toggle online
- [ ] App syncs data
- [ ] No data loss

### Languages
- [ ] Click language toggle
- [ ] Page translates to Spanish
- [ ] Click again → Hausa
- [ ] Click again → Swahili
- [ ] Click again → English
- [ ] All UI text updates
- [ ] Check right-to-left if supported

### Mobile
- [ ] Rotate phone → layout adapts
- [ ] Touch buttons work
- [ ] Scroll works smoothly
- [ ] Can take quiz on mobile
- [ ] Can install app
- [ ] Installed app launches fullscreen

---

## 💡 Pro Tips

1. **Debug Mode**
   ```javascript
   // In browser console:
   window.appDebug.appState  // See current state
   window.appDebug.getCurrentUser()  // See current user
   window.appDebug.syncPendingData()  // Force sync
   ```

2. **Clear All Data**
   ```javascript
   // In browser console:
   localStorage.clear()  // Clear local storage
   indexedDB.deleteDatabase('educenter_db')  // Clear IndexedDB
   location.reload()  // Reload app
   ```

3. **Force Cache Update**
   - Change CACHE_VERSION in sw.js (line 5)
   - Old cache will auto-delete
   - New assets will be cached

4. **Test Firebase (after setup)**
   ```javascript
   // In browser console:
   firebase.auth().currentUser  // Check logged-in user
   firebase.database().ref('lessons').once('value')  // Fetch data
   ```

5. **Monitor Performance**
   - DevTools → Lighthouse
   - Run audit
   - Check scores
   - Follow recommendations

---

## 📚 What's Next?

### Short Term (Today)
1. ✅ Get app running locally
2. ✅ Test offline functionality
3. ✅ Try different languages
4. ✅ Add your first lesson
5. ✅ Create a quiz

### Medium Term (This Week)
1. Create Firebase project
2. Configure authentication
3. Set up database
4. Deploy to Firebase Hosting
5. Test on real devices

### Long Term (This Month)
1. Gather user feedback
2. Add more lessons
3. Customize design
4. Monitor usage
5. Plan improvements

---

## 🆘 Need Help?

### Quick Questions
- Check [README.md](README.md)
- Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Search browser console errors

### Detailed Setup
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- See [DEPLOYMENT.md](DEPLOYMENT.md)

### Architecture Deep Dive
- Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

### Deployment Issues
- Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🎉 You're Ready!

You now have a complete offline-first PWA for STEM education!

**Next step**: [Read Firebase Setup Guide →](FIREBASE_SETUP.md)

---

**Questions?** Check the documentation files included in the project.  
**Found a bug?** Check the console (F12) for error messages.  
**Want to customize?** Edit lessons.json and styles.css - no build step needed!

**Happy Learning! 🚀📚**
