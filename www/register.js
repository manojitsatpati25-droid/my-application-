// =======================================
// register.js
// Firebase Register
// =======================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ---------------------------------------
// Already logged in?
// ---------------------------------------

onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href = "dashboard.html";

    }

});

// ---------------------------------------
// Register Button
// ---------------------------------------

const registerBtn = document.getElementById("registerBtn");

const msg = document.getElementById("msg");

registerBtn.addEventListener("click", register);

// ---------------------------------------
// Register Function
// ---------------------------------------

async function register() {

    msg.innerHTML = "";
    msg.style.color = "red";

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        msg.innerHTML = "Please fill all fields.";

        return;

    }

    if (password !== confirmPassword) {

        msg.innerHTML = "Passwords do not match.";

        return;

    }

    if (password.length < 6) {

        msg.innerHTML = "Password must be at least 6 characters.";

        return;

    }

    registerBtn.disabled = true;

    registerBtn.innerHTML = "Creating Account...";

    try {

        const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                email,

                password

            );

        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,
            name: name,
            email: email,
            balance: 500,
            photo: "",
            admin: false,
            createdAt: serverTimestamp()

        });

        msg.style.color = "green";

        msg.innerHTML = "Registration Successful";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1000);

    } catch (error) {

        console.error(error);

        switch (error.code) {

            case "auth/email-already-in-use":
                msg.innerHTML = "Email already registered.";
                break;

            case "auth/invalid-email":
                msg.innerHTML = "Invalid email address.";
                break;

            case "auth/weak-password":
                msg.innerHTML = "Password is too weak.";
                break;

            case "auth/operation-not-allowed":
                msg.innerHTML = "Enable Email/Password Authentication in Firebase.";
                break;

            default:
                msg.innerHTML = error.message;

        }

    }

    registerBtn.disabled = false;

    registerBtn.innerHTML = "Register";

}