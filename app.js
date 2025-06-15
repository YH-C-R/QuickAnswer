
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDiqtUvy3itSoOtXR3rzFS7Xp6xP",
  authDomain: "quickanswer-48ac4.firebaseapp.com",
  databaseURL: "https://quickanswer-48ac4-default-rtdb.firebaseio.com",
  projectId: "quickanswer-48ac4",
  storageBucket: "quickanswer-48ac4.firebasestorage.app",
  messagingSenderId: "616701037723",
  appId: "1:616701037723:web:b2e990b3018c5ae536ca3e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
