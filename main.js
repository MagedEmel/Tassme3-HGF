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
   Stage
========================= */

const stage = localStorage.getItem("stage");

if (!stage) {
  alert("اختار المرحلة الأول");
  window.location.href = "index.html";
}

let grade = document.getElementById("grade");
grade.innerHTML = localStorage.getItem("stage");
let backword = document.getElementById("backword");
backword.onclick = () => {
  window.location = "index.html";
};
/* =========================
   DOM
========================= */

const table = document.querySelector("tbody.data");

let allStudents = [];

/* =========================
   Settings
========================= */

let settings = {
  pieces: 4,
  max: [10, 10, 10, 10],
  names: [],
};

async function loadSettings() {
  const ref = doc(db, "stages", stage, "settings", "main");

  const snap = await getDoc(ref);

  if (snap.exists()) {
    settings = snap.data();
  }
}

/* =========================
   Render Header
========================= */

function renderHeader() {
  const theadRow = document.querySelector("thead tr");

  if (!theadRow) return;

  theadRow.innerHTML = `<th id="name">الاسم</th>`;

  for (let i = 1; i <= settings.pieces; i++) {
    const lessonName = settings.names?.[i - 1] || `قطعة ${i}`;

    theadRow.innerHTML += `
      <th>${lessonName}</th>
    `;
  }

  theadRow.innerHTML += `<th>المجموع</th>`;
}

/* =========================
   Add Student
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
   Calculate Total
========================= */

function calculateTotal(lessons) {
  let total = 0;

  for (let i = 1; i <= settings.pieces; i++) {
    total += Number(lessons[`piece${i}`] || 0);
  }

  return total;
}

/* =========================
   Render Students
========================= */
let c = 0;
let totalStudents = document.getElementById("totalStudents");
function renderStudents(students) {
  table.innerHTML = "";

  students.forEach((student) => {
    let tr = document.createElement("tr");

    tr.innerHTML += `
      <td class='name'>${student.name}</td>
    `;

    for (let i = 1; i <= settings.pieces; i++) {
      let val = student.lessons?.[`piece${i}`] || 0;

      let max = settings.max?.[i - 1] || 10;

      tr.innerHTML += `
        <td data-label="${settings.names[i - 1] + " ( " + settings.max[i - 1] + " ) "}">
          <input
            type="number"
            min="0"
            max="${max}"
            data-id="${student.id}"
            data-piece="piece${i}"
            value="${val}"
            style="width:60px"
          >
        </td>
      `;
    }

    let total = calculateTotal(student.lessons || {});

    tr.innerHTML += `
      <td>${total}</td>
    `;
    table.appendChild(tr);
  });
  attachEvents();
}

/* =========================
   Get Students
========================= */

async function getStudents() {
  const snap = await getDocs(collection(db, "stages", stage, "students"));

  let students = [];

  snap.forEach((d) => {
    students.push({
      id: d.id,
      ...d.data(),
    });

    c++;
    totalStudents.innerHTML = c;
  });

  students.sort((a, b) => a.name.localeCompare(b.name, "ar"));

  allStudents = students;

  renderStudents(students);
}

/* =========================
   Update Inputs
========================= */

function attachEvents() {
  document.querySelectorAll("input[type='number']").forEach((input) => {
    input.onchange = async function () {
      const id = this.dataset.id;

      const piece = this.dataset.piece;

      let value = Number(this.value);

      const index = Number(piece.replace("piece", "")) - 1;

      const max = settings.max?.[index] || 10;

      if (value < 0) value = 0;

      if (value > max) value = max;

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
   Search Suggestions
========================= */

window.searchSuggestions = function () {
  const value = document.getElementById("search").value.trim().toLowerCase();

  const suggestions = document.getElementById("suggestions");

  suggestions.innerHTML = "";

  if (!value) {
    renderStudents(allStudents);

    return;
  }

  const filtered = allStudents
    .filter((student) => student.name.toLowerCase().includes(value))
    .slice(0, 5);

  filtered.forEach((student) => {
    const div = document.createElement("div");

    div.innerHTML = student.name;

    div.onclick = function () {
      document.getElementById("search").value = student.name;

      suggestions.innerHTML = "";

      renderStudents([student]);
    };

    suggestions.appendChild(div);
  });

  renderStudents(
    allStudents.filter((student) => student.name.toLowerCase().includes(value)),
  );
};

/* =========================
   Init
========================= */

loadSettings().then(() => {
  renderHeader();

  getStudents();
});
