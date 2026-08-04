// =====================================
// transactions.js
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const transactionList = document.getElementById("transactionList");

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    loadTransactions(user.uid);

});

function loadTransactions(uid) {

    const q = query(
        collection(db, "transactions"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {

        transactionList.innerHTML = "";

        if (snapshot.empty) {

            transactionList.innerHTML = `
                <div class="empty">
                    No Transactions Found
                </div>
            `;

            return;

        }

        snapshot.forEach((doc) => {

            const t = doc.data();

            let typeClass = "";

            switch (t.type) {

                case "deposit":
                    typeClass = "deposit";
                    break;

                case "withdraw":
                    typeClass = "withdraw";
                    break;

                case "bet":
                    typeClass = "bet";
                    break;

                case "win":
                    typeClass = "win";
                    break;

                default:
                    typeClass = "";

            }

            let statusClass = "";

            switch (t.status) {

                case "success":
                    statusClass = "success";
                    break;

                case "pending":
                    statusClass = "pending";
                    break;

                case "failed":
                    statusClass = "failed";
                    break;

                default:
                    statusClass = "";

            }

            let date = "";

            if (t.createdAt) {

                date = t.createdAt.toDate().toLocaleString();

            }

            transactionList.innerHTML += `

            <div class="card">

                <div class="row">
                    <span>Type</span>
                    <span class="${typeClass}">
                        ${t.type}
                    </span>
                </div>

                <div class="row">
                    <span>Amount</span>
                    <strong>₹${t.amount}</strong>
                </div>

                <div class="row">
                    <span>Status</span>
                    <span class="${statusClass}">
                        ${t.status}
                    </span>
                </div>

                <div class="row">
                    <span>Date</span>
                    <span>${date}</span>
                </div>

            </div>

            `;

        });

    });

}