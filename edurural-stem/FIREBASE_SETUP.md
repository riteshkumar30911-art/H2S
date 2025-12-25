# Firebase Setup Guide for EduRural STEM

## 🔧 Prerequisites

1. **Google Account** - Required for Firebase
2. **Node.js** - Optional (for Firebase CLI)
3. **Firebase Project** - Create at https://console.firebase.google.com

## 📝 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `edurural-stem`
4. Choose **"Create in Canada"** or preferred location
5. Click **"Create project"** (wait for provisioning)

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Enable **Email/Password** provider:
   - Click **Email/Password**
   - Toggle **Enable**
   - Leave password reset email enabled
   - Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select location: **US (multi-region)** recommended
5. Click **"Enable"**

### Step 4: Set Firestore Security Rules

In Firestore, go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can only access their own data
    match /students/{studentId} {
      allow read, write: if request.auth.uid == studentId;
    }
    
    // Teachers can read student data
    match /students/{document=**} {
      allow read: if request.auth.token.role == 'teacher';
    }
    
    // Quiz results are write-only by students
    match /quizResults/{document=**} {
      allow write: if request.auth.token.role == 'student';
      allow read: if request.auth.token.role == 'teacher';
    }
    
    // Lessons are public for reading
    match /lessons/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **"Publish"**

### Step 5: Get Your Firebase Config

1. In Firebase Console, click **"Project Settings"** (⚙️ icon)
2. Click **"Your apps"** section
3. Click **"Web"** to create a web app
4. App nickname: `edurural-stem-web`
5. Click **"Register app"**
6. Copy the config object

### Step 6: Update App Configuration

Update `js/firebase.js` with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 7: Create Test Users

In Firebase Authentication:

1. Click **"Add user"** button
2. **Student User:**
   - Email: `student@example.com`
   - Password: `password123`
   - Click **"Add user"**

3. **Teacher User:**
   - Email: `teacher@example.com`
   - Password: `password123`
   - Click **"Add user"**

### Step 8: Add Sample Data to Firestore

1. Go to **Firestore Database**
2. Click **"Start collection"** → Name: `students`
3. Click **"Auto ID"** → Add fields:
   ```
   name (string): "Test Student"
   email (string): "student@example.com"
   role (string): "student"
   createdAt (timestamp): now
   ```
4. Repeat for lessons and quiz results

### Step 9: Enable Hosting (Optional)

1. Go to **Hosting** (left sidebar)
2. Click **"Get started"**
3. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
4. Initialize project:
   ```bash
   firebase init
   ```
5. Deploy:
   ```bash
   firebase deploy
   ```

## 📊 Firestore Collections Structure

### students/
```json
{
  "uid": "user_id_123",
  "name": "Student Name",
  "email": "student@example.com",
  "enrollmentId": "ENR001",
  "role": "student",
  "createdAt": "2024-12-25T10:00:00Z",
  "progress": {
    "completedLessons": 5,
    "totalScore": 85,
    "badgesEarned": 3
  }
}
```

### lessons/
```json
{
  "id": "math_1",
  "title": "Introduction to Algebra",
  "subject": "math",
  "content": "...",
  "duration": "15 min",
  "difficulty": "Beginner"
}
```

### quizResults/
```json
{
  "id": "quiz_result_123",
  "studentId": "uid_123",
  "lessonId": "math_1",
  "score": 85,
  "answers": [0, 1, 2, 1, 0],
  "completedAt": "2024-12-25T10:15:00Z",
  "synced": true
}
```

### teachers/
```json
{
  "uid": "teacher_uid_123",
  "name": "Teacher Name",
  "email": "teacher@example.com",
  "role": "teacher",
  "school": "School Name"
}
```

## 🚀 Advanced Setup

### Add Custom Claims (For Role-Based Access)

Using Firebase Admin SDK (Node.js):

```javascript
const admin = require('firebase-admin');

// Initialize admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set custom claims for teacher
admin.auth().setCustomUserClaims('teacher_uid_123', { role: 'teacher' })
  .then(() => {
    console.log('Custom claims set for teacher');
  });

// Set custom claims for student
admin.auth().setCustomUserClaims('student_uid_123', { role: 'student' })
  .then(() => {
    console.log('Custom claims set for student');
  });
```

### Setup Cloud Functions (Optional)

Create a function to process quiz results:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.onQuizSubmit = functions.firestore
  .document('quizResults/{resultId}')
  .onCreate((snap, context) => {
    const result = snap.data();
    
    // Update student progress
    return admin.firestore()
      .collection('students')
      .doc(result.studentId)
      .update({
        'progress.totalScore': result.score,
        'progress.completedLessons': admin.firestore.FieldValue.increment(1)
      });
  });
```

## 🔐 Production Security

### Before Deploying to Production:

1. **Update Security Rules:**
   ```javascript
   // Change from test mode rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Implement proper authentication checks
       allow read, write: if request.auth != null;
     }
   }
   ```

2. **Enable reCAPTCHA:**
   - Firebase Console → Authentication → Sign-in method
   - Enable reCAPTCHA Enterprise

3. **Set Budget Alerts:**
   - Firebase Console → Billing → Budget alerts
   - Set limits for Firestore and other services

4. **Enable Audit Logging:**
   - Go to Google Cloud Console
   - Enable Cloud Audit Logs

5. **Restrict API Keys:**
   - Firebase Console → Project Settings → Keys
   - Restrict API key to web only
   - Add application restrictions

## 🧪 Testing Firebase Connection

Add this to your browser console to test:

```javascript
// Test Firebase import
import { firebaseService } from './js/firebase.js';

// Try to login
firebaseService.loginUser('student@example.com', 'password123', 'student')
  .then(result => {
    console.log('Login successful:', result);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

## 🐛 Common Issues & Solutions

### Issue: "FirebaseError: Firebase: Error (auth/invalid-api-key)"
**Solution:** 
- Check API key in firebaseConfig
- Ensure key is not restricted incorrectly
- Delete and create new web app

### Issue: "PERMISSION_DENIED: Missing or insufficient permissions"
**Solution:**
- Update Firestore security rules
- Ensure user is authenticated
- Check custom claims are set

### Issue: "Service Worker fails to register"
**Solution:**
- Ensure HTTPS is enabled
- Check browser console for errors
- Clear browser cache
- Try incognito mode

### Issue: "IndexedDB quota exceeded"
**Solution:**
- Clear old cached data
- Implement data cleanup logic
- Use browser's storage management

## 📚 Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Authentication](https://firebase.google.com/docs/auth)

## 🎯 Next Steps

1. ✅ Create Firebase project
2. ✅ Enable Authentication
3. ✅ Setup Firestore
4. ✅ Add security rules
5. ✅ Get Firebase config
6. ✅ Update app configuration
7. ✅ Create test users
8. ✅ Test the app
9. ⏳ Deploy to hosting
10. ⏳ Setup monitoring

---

**Configuration Complete!** Your EduRural STEM app is now connected to Firebase.
