"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var firebaseConfig = {
    apiKey: "AIzaSyCgZEssQ-OQMjyYp3PV6pvKpx1NHZgMslA",
    authDomain: "groupe-bbl.firebaseapp.com",
    projectId: "groupe-bbl",
    storageBucket: "groupe-bbl.firebasestorage.app",
    messagingSenderId: "874485140986",
    appId: "1:874485140986:web:649396788b0b842c81a843"
};
var app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
