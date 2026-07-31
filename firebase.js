// =====================================
// firebase.js
// Colour Prediction Game
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// =====================================
// Firebase Configuration
// =====================================

const firebaseConfig = {

    apiKey: "AIzaSyBiKIpK8hsBwEzMZ1aXd18KPNRMmKRzs8U",

    authDomain: "colour-prediction-c4862.firebaseapp.com",

    projectId: "colour-prediction-c4862",

    storageBucket: "colour-prediction-c4862.firebasestorage.app",

    messagingSenderId: "174422934209",

    appId: "1:174422934209:web:b03c2e127adec3d54dca40"

};

// =====================================
// Initialize Firebase
// =====================================

const app = initializeApp(firebaseConfig);

// =====================================
// Firebase Services
// =====================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

// =====================================
// Export
// =====================================

export {
    app,
    auth,
    db,
    storage
};