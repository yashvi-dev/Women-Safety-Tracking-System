// check-env.js
require("dotenv").config(); // Load variables from .env

console.log("Checking environment variables...\n");

const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "PORT",
  "CLIENT_URL",
  "FIREBASE_PROJECT_ID",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

let allSet = true;

requiredVars.forEach((key) => {
  const value = process.env[key];
  if (!value) {
    console.warn(`❌ Missing: ${key}`);
    allSet = false;
  } else {
    console.log(`✅ ${key} = ${value}`);
  }
});

if (allSet) {
  console.log("\n✅ All required environment variables are set.");
} else {
  console.log(
    "\n❗ Some environment variables are missing. Please update your .env file."
  );
}
