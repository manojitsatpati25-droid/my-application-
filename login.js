// =======================================
// login.js
// Firebase Login
// =======================================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ---------------------------------------
// If already logged in
// ---------------------------------------

onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href = "dashboard.html";

    }

});

// ---------------------------------------
// Login Button
// ---------------------------------------

const loginBtn = document.getElementById("loginBtn");

const msg = document.getElementById("msg");

loginBtn.addEventListener("click", login);

// ---------------------------------------
// Login Function
// ---------------------------------------

async function login() {

    msg.style.color = "red";
    msg.innerHTML = "";

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    if (email === "" || password === "") {

        msg.innerHTML = "Please enter Email and Password.";

        return;

    }

    loginBtn.disabled = true;

    loginBtn.innerHTML = "Logging in...";

    try {

        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

        msg.style.color = "green";

        msg.innerHTML = "Login Successful";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);

    } catch (error) {

        console.error(error);

        switch (error.code) {

            case "auth/invalid-credential":
                msg.innerHTML = "Invalid email or password.";
                break;

            case "auth/user-not-found":
                msg.innerHTML = "User not found.";
                break;

            case "auth/wrong-password":
                msg.innerHTML = "Wrong password.";
                break;

            case "auth/invalid-email":
                msg.innerHTML = "Invalid email address.";
                break;

            case "auth/network-request-failed":
                msg.innerHTML = "No Internet connection.";
                break;

            case "auth/too-many-requests":
                msg.innerHTML = "Too many attempts. Try again later.";
                break;

            default:
                msg.innerHTML = error.message;

        }

    }

    loginBtn.disabled = false;

    loginBtn.innerHTML = "Login";

}