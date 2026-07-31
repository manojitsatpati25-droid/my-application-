// =====================================
// withdraw.js
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;
let wallet = 0;

const walletText = document.getElementById("wallet");
const amountInput = document.getElementById("amount");
const upiInput = document.getElementById("upi");
const status = document.getElementById("status");
const btn = document.getElementById("withdrawBtn");

// --------------------
// Login Check
// --------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    loadWallet();

});

// --------------------
// Load Wallet
// --------------------

async function loadWallet() {

    const snap = await getDoc(
        doc(db, "users", currentUser.uid)
    );

    if (!snap.exists()) return;

    wallet = snap.data().balance || 0;

    walletText.innerHTML = "₹" + wallet;

}

// --------------------
// Withdraw
// --------------------

btn.addEventListener("click", async () => {

    const amount = Number(amountInput.value);

    const upi = upiInput.value.trim();

    status.innerHTML = "";

    if (!amount || amount <= 0) {

        status.style.color = "red";
        status.innerHTML = "Enter a valid amount.";
        return;

    }

    if (amount > wallet) {

        status.style.color = "red";
        status.innerHTML = "Insufficient balance.";
        return;

    }

    if (upi.length < 5 || !upi.includes("@")) {

        status.style.color = "red";
        status.innerHTML = "Enter a valid UPI ID.";
        return;

    }

    btn.disabled = true;
    btn.innerHTML = "Submitting...";

    try {

        await addDoc(
            collection(db, "withdrawRequests"),
            {

                uid: currentUser.uid,
                email: currentUser.email,
                amount: amount,
                upi: upi,
                status: "pending",
                createdAt: serverTimestamp()

            }
        );

        status.style.color = "#22c55e";
        status.innerHTML = "Withdrawal request submitted successfully.";

        amountInput.value = "";
        upiInput.value = "";

    } catch (error) {

        console.log(error);

        status.style.color = "red";
        status.innerHTML = error.message;

    }

    btn.disabled = false;
    btn.innerHTML = "Submit Withdrawal";

});