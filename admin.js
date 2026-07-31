// =====================================
// admin.js
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    orderBy,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// --------------------
// Admin Login Check
// --------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists() || snap.data().admin !== true) {

        alert("Access Denied");
        location.href = "dashboard.html";
        return;

    }

    loadDashboard();
    loadWithdrawRequests();
    loadRecentBets();

});

// --------------------
// Dashboard Stats
// --------------------

async function loadDashboard() {

    const users = await getDocs(collection(db, "users"));
    document.getElementById("totalUsers").innerHTML = users.size;

    const bets = await getDocs(collection(db, "bets"));
    document.getElementById("totalBets").innerHTML = bets.size;

    const pending = await getDocs(
        query(
            collection(db, "withdrawRequests"),
            where("status", "==", "pending")
        )
    );

    document.getElementById("pendingWithdraw").innerHTML = pending.size;

    // Demo only
    document.getElementById("onlineUsers").innerHTML = users.size;

}

// --------------------
// Withdraw Requests
// --------------------

function loadWithdrawRequests() {

    const tbody = document.getElementById("withdrawTable");

    const q = query(
        collection(db, "withdrawRequests"),
        where("status", "==", "pending")
    );

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = "";

        snapshot.forEach((d) => {

            const w = d.data();

            tbody.innerHTML += `
<tr>
<td>${w.email}</td>
<td>₹${w.amount}</td>
<td>${w.upi}</td>
<td>
<button onclick="approve('${d.id}')">Approve</button>
<button onclick="reject('${d.id}')">Reject</button>
</td>
</tr>
`;

        });

    });

}

// --------------------
// Recent Bets
// --------------------

function loadRecentBets() {

    const tbody = document.getElementById("betTable");

    const q = query(
        collection(db, "bets"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = "";

        snapshot.forEach((d) => {

            const b = d.data();

            tbody.innerHTML += `
<tr>
<td>${b.uid}</td>
<td>${b.round}</td>
<td>${b.color}</td>
<td>₹${b.amount}</td>
<td>${b.status}</td>
</tr>
`;

        });

    });

}

// --------------------
// Approve Withdraw
// --------------------

window.approve = async function(id){

    await updateDoc(
        doc(db,"withdrawRequests",id),
        {
            status:"approved"
        }
    );

    alert("Withdrawal Approved");

};

// --------------------
// Reject Withdraw
// --------------------

window.reject = async function(id){

    await updateDoc(
        doc(db,"withdrawRequests",id),
        {
            status:"rejected"
        }
    );

    alert("Withdrawal Rejected");

};

// --------------------
// Game Controls
// --------------------

document.getElementById("startGame").onclick = async ()=>{

    await updateDoc(
        doc(db,"game","current"),
        {
            status:"betting"
        }
    );

};

document.getElementById("stopGame").onclick = async ()=>{

    await updateDoc(
        doc(db,"game","current"),
        {
            status:"closed"
        }
    );

};

document.getElementById("nextRound").onclick = async ()=>{

    const snap = await getDoc(
        doc(db,"game","current")
    );

    const game = snap.data();

    await updateDoc(
        doc(db,"game","current"),
        {
            round:(game.round||0)+1,
            countdown:30,
            status:"betting"
        }
    );

};