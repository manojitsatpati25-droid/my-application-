// =====================================
// script.js
// Dashboard Controller
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    onSnapshot,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;

// =====================================
// Authentication Check
// =====================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "index.html";

        return;

    }

    currentUser = user;

    loadUser();

});

// =====================================
// Load User Data
// =====================================

function loadUser() {

    const userRef = doc(db, "users", currentUser.uid);

    onSnapshot(userRef, (snapshot) => {

        if (!snapshot.exists()) return;

        const data = snapshot.data();

        // Name
        const userName = document.getElementById("userName");
        if (userName)
            userName.innerText = data.name || "Player";

        // Email
        const userEmail = document.getElementById("userEmail");
        if (userEmail)
            userEmail.innerText = data.email || "";

        // Wallet
        const wallet = document.getElementById("wallet");
        if (wallet)
            wallet.innerText = "₹" + (data.balance || 0);

        // Profile Form
        const name = document.getElementById("name");
        if (name)
            name.value = data.name || "";

        const email = document.getElementById("email");
        if (email)
            email.value = data.email || "";

        // Profile Image
        const image = document.getElementById("profileImage");

        if (image) {

            image.src = data.photo && data.photo !== ""
                ? data.photo
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        }

    });

}

// =====================================
// Logout
// =====================================

window.logout = async function () {

    try {

        await signOut(auth);

        location.href = "index.html";

    } catch (error) {

        alert(error.message);

    }

};

// =====================================
// Navigation
// =====================================

window.goTo = function (page) {

    location.href = page;

};

// =====================================
// Refresh User
// =====================================

window.refreshUser = function () {

    if (currentUser) {

        loadUser();

    }

};

// =====================================
// Check Admin
// =====================================

window.isAdmin = async function () {

    if (!currentUser) return false;

    const snap = await getDoc(
        doc(db, "users", currentUser.uid)
    );

    if (!snap.exists()) return false;

    return snap.data().admin === true;

};