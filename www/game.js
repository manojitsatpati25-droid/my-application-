// =====================================
// game.js
// Phase 3.2
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;
let wallet = 0;
let currentRound = 0;
let countdown = 30;
let gameStatus = "betting";

// ----------------------------
// Login Check
// ----------------------------

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        location.href="index.html";

        return;

    }

    currentUser=user;

    loadUser();

    loadGame();

});

// ----------------------------
// User Wallet
// ----------------------------

function loadUser(){

    const ref=doc(db,"users",currentUser.uid);

    onSnapshot(ref,(snap)=>{

        if(!snap.exists()) return;

        const user=snap.data();

        wallet=user.balance||0;

        document.getElementById("wallet").innerHTML="₹"+wallet;

    });

}

// ----------------------------
// Live Game
// ----------------------------

function loadGame(){

    const ref=doc(db,"game","current");

    onSnapshot(ref,(snap)=>{

        if(!snap.exists()) return;

        const game=snap.data();

        currentRound=game.round;

        countdown=game.countdown;

        gameStatus=game.status;

        document.getElementById("round").innerHTML=currentRound;

        document.getElementById("timer").innerHTML=countdown;

    });

}

// ----------------------------
// Place Bet
// ----------------------------

window.placeBet=async function(color){

    if(gameStatus!="betting"){

        alert("Betting Closed");

        return;

    }

    const amount=parseInt(
        document.getElementById("betAmount").value
    );

    if(isNaN(amount)||amount<=0){

        alert("Enter Bet Amount");

        return;

    }

    if(amount>wallet){

        alert("Insufficient Balance");

        return;

    }

    try{

        await updateDoc(
            doc(db,"users",currentUser.uid),
            {
                balance:increment(-amount)
            }
        );

        await addDoc(
            collection(db,"bets"),
            {

                uid:currentUser.uid,

                round:currentRound,

                color:color,

                amount:amount,

                status:"pending",

                createdAt:serverTimestamp()

            }
        );

        alert("Bet Placed");

        document.getElementById("betAmount").value="";

    }catch(e){

        alert(e.message);

        console.log(e);

    }

}