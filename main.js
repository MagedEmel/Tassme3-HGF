"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================
   Firebase
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBwX2D5tvQNIhekxDAR3qZsyGfiEWZ8sgo",
  authDomain: "tassme3-hgf.firebaseapp.com",
  projectId: "tassme3-hgf",
  storageBucket: "tassme3-hgf.firebasestorage.app",
  messagingSenderId: "583701432766",
  appId: "1:583701432766:web:b949b263357ebae6d251ef",
  measurementId: "G-S22M40LVRC",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   Stage (localStorage)
========================= */

const stage = localStorage.getItem("stage");
let grade = document.getElementById("grade");
grade.innerHTML = localStorage.getItem("stage");
if (!stage) {
  alert("اختار المرحلة الأول");
  window.location.href = "index.html";
}
const backword = document.getElementById("backword");
backword.onclick = () => {
  window.location = "index.html";
};
/* =========================
   DOM
========================= */

const table = document.querySelector("tbody.data");

/* =========================
   SETTINGS (عدد القطع)
========================= */

let settings = {
  pieces: 4,
};

async function loadSettings() {
  const ref = doc(db, "stages", stage, "settings", "main");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    settings = snap.data();
  }
}

/* =========================
   ADD STUDENT
========================= */

window.addStudent = async function () {
  const input = document.getElementById("studentName");
  const name = input.value.trim();

  if (!name) return;

  let lessons = {};

  for (let i = 1; i <= settings.pieces; i++) {
    lessons[`piece${i}`] = 0;
  }

  await addDoc(collection(db, "stages", stage, "students"), {
    name,
    lessons,
  });

  input.value = "";
  getStudents();
};
/* =========================
   GET STUDENTS
========================= */

async function getStudents() {
  table.innerHTML = "";

  const snap = await getDocs(collection(db, "stages", stage, "students"));

  let students = [];

  snap.forEach((d) => {
    students.push({ id: d.id, ...d.data() });
  });

  students.sort((a, b) => a.name.localeCompare(b.name, "ar"));

  students.forEach((student) => {
    let tr = document.createElement("tr");

    tr.innerHTML += `<td class='name'>${student.name}</td>`;

    for (let i = 1; i <= settings.pieces; i++) {
      let val = student.lessons?.[`piece${i}`] || 0;

      tr.innerHTML += `
  <td 
  data-label="${settings.names[i - 1] + " ( " + settings.max[i - 1] + " ) "}">
    <input type="number"
      value="${val}"
      data-id="${student.id}"
      data-piece="piece${i}"
      class='pp'
    >
  </td>
`;
    }

    let total = calculateTotal(student.lessons || {});
    tr.innerHTML += `<td class='total'>${total}</td>`;

    table.appendChild(tr);
  });

  attachEvents();
}

function renderHeader() {
  let thead = document.querySelector("thead tr");

  thead.innerHTML = `<th>الاسم</th>`;

  for (let i = 1; i <= settings.pieces; i++) {
    const name =
      settings.names?.[i - 1] + "(" + settings.max[i - 1] + ")" || `قطعة ${i}`;

    thead.innerHTML += `<th class='name'>${name}</th>`;
  }

  thead.innerHTML += `<th>المجموع</th>`;
}

/* =========================
   CALCULATE TOTAL
========================= */

function calculateTotal(lessons) {
  let total = 0;

  for (let i = 1; i <= settings.pieces; i++) {
    const value = Number(lessons[`piece${i}`] || 0);
    const max = settings.max?.[i - 1] || 0;

    total += value; // أو value/max لو grading system
  }

  return total;
}

/* =========================
   UPDATE INPUTS
========================= */

function attachEvents() {
  document.querySelectorAll("input[type=number]").forEach((input) => {
    input.onchange = async function () {
      const id = this.dataset.id;
      const piece = this.dataset.piece;
      let value = Number(this.value);

      const index = Number(piece.replace("piece", "")) - 1;

      const max = settings.max?.[index] ?? 10;

      // 🔥 Clamp value between 0 and max
      if (value < 0) value = 0;
      if (value > max) value = max;

      // رجّع القيمة في الـ input لو اتعدلت
      this.value = value;

      const ref = doc(db, "stages", stage, "students", id);

      await updateDoc(ref, {
        [`lessons.${piece}`]: value,
      });

      getStudents();
    };
  });
}

/* =========================
   INIT
========================= */
loadSettings().then(() => {
  renderHeader();
  getStudents();
});

window.searchStudents = async function () {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const snap = await getDocs(collection(db, "stages", stage, "students"));

  let students = [];

  snap.forEach((d) => {
    const data = { id: d.id, ...d.data() };

    if (data.name.toLowerCase().includes(value)) {
      students.push(data);
    }
  });

  table.innerHTML = "";

  students.forEach((student) => {
    let tr = document.createElement("tr");

    tr.innerHTML += `<td class='name'>${student.name}</td>`;

    for (let i = 1; i <= settings.pieces; i++) {
      let val = student.lessons?.[`piece${i}`] || 0;

      tr.innerHTML += `
      <td 
      data-label="${settings.names[i - 1] + " ( " + settings.max[i - 1] + " ) "}">
      <input type="number"
        value="${val}"
        data-id="${student.id}"
        data-piece="piece${i}"
        class='pp'
      >
      </td>`;
    }

    let total = calculateTotal(student.lessons || {});
    tr.innerHTML += `<td class='total'>${total}</td>`;

    table.appendChild(tr);
  });

  attachEvents();
};
