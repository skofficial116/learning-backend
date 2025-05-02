// import axios from "axios";

// const scriptURL =
//   "https://script.google.com/macros/s/AKfycbwJCcbVNKf7qP4MrXoT7SD-XOZueEtWSbF8yTBxHY-lCRUjNrwO4eNAEJypL2mehhaJ/exec";
// // const scriptURL = 'https://script.google.com/macros/s/AKfycbwxFLMHxNCwyzWpSzF14TW5WhSDFE2-lbxv-YigRfY/dev';

// const formData = new URLSearchParams({
//   firstname: "Sachin",
//   lastname: "Kumar",
//   phone: "9988224832",
//   gender: "Male",
//   university: "GEU",
//   course: "M.Com",
//   semester: "1",
// });

// try {
//   const res = await axios.post(scriptURL, formData);
//   console.log("✅ Response from Google Apps Script:", res.data);
// } catch (err) {
//   console.error("❌ Error posting to GAS:", err.response?.data || err.message);
// }
import {timetable} from "./src/controllers/timetable.js";


console.log(timetable['BCA']["4"]["A"]);

