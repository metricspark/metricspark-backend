import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* ===== FIREBASE CONFIG ===== */

const firebaseConfig = {
  apiKey: "AIzaSyANWlsjTqHVeaCBBrOH8LJ-cMygCZoIhYc",
  authDomain: "metricspark-1456b.firebaseapp.com",
  projectId: "metricspark-1456b",
  storageBucket: "metricspark-1456b.appspot.com",
  messagingSenderId: "958626906247",
  appId: "1:958626906247:web:0ed0f6ea8607e233e2b822"
};


/* ===== INITIALIZE FIREBASE ===== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* ===== ELEMENTS ===== */

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginBtn = document.getElementById("loginBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const forgotPassword = document.getElementById("forgotPassword");
const togglePassword = document.getElementById("togglePassword");


let isSignUp = false;


/* ===== TAB SWITCH ===== */

loginTab.addEventListener("click", () => {

  isSignUp = false;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  loginBtn.textContent = "Sign In";

});

signupTab.addEventListener("click", () => {

  isSignUp = true;

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  loginBtn.textContent = "Sign Up";

});


/* ===== SHOW / HIDE PASSWORD ===== */

togglePassword.addEventListener("click", () => {

  if (passwordInput.type === "password") {

    passwordInput.type = "text";
    togglePassword.textContent = "Hide";

  } else {

    passwordInput.type = "password";
    togglePassword.textContent = "Show";

  }

});


/* ===== LOGIN / SIGNUP ===== */

loginBtn.addEventListener("click", async () => {

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Processing...";

  try {

    if (isSignUp) {

      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully ✅");

    } else {

      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful ✅");

    }

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

  loginBtn.disabled = false;
  loginBtn.textContent = isSignUp ? "Sign Up" : "Sign In";

});


/* ===== PASSWORD RESET ===== */

forgotPassword.addEventListener("click", async () => {

  const email = emailInput.value.trim();

  if (!email) {
    alert("Enter your email first");
    return;
  }

  try {

    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent ✅");

  } catch (error) {

    alert(error.message);

  }

});


/* ===== AUTO LOGIN REDIRECT ===== */

onAuthStateChanged(auth, (user) => {

  if (user) {
    window.location.href = "dashboard.html";
  }

});