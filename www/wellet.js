import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
doc,
onSnapshot,
updateDoc,
increment
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let uid = "";

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

uid=user.uid;

const ref=doc(db,"users",uid);

onSnapshot(ref,(snap)=>{

if(snap.exists()){

document.getElementById("wallet").innerHTML=
"₹"+snap.data().balance;

}

});

});

async function addMoney(){

const amount=Number(prompt("Enter Amount"));

if(!amount || amount<=0) return;

await updateDoc(

doc(db,"users",uid),

{

balance:increment(amount)

}

);

alert("Money Added Successfully");

}

async function withdrawMoney(){

const amount=Number(prompt("Withdraw Amount"));

if(!amount || amount<=0) return;

await updateDoc(

doc(db,"users",uid),

{

balance:increment(-amount)

}

);

alert("Money Withdrawn");

}

document.getElementById("addMoneyBtn").addEventListener("click",addMoney);

document.getElementById("withdrawMoneyBtn").addEventListener("click",withdrawMoney);