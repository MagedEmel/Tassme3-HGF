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
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
let showAll = false;

const showAllBtn = document.getElementById("showAllBtn");
/* =========================
   SHOW ALL BUTTON
========================= */

showAllBtn.onclick = function () {
  showAll = !showAll;

  const value = document.getElementById("search").value.trim().toLowerCase();

  /* =========================
     لو فيه سيرش
  ========================= */

  if (value) {
    const filtered = allStudents.filter((student) =>
      student.name.toLowerCase().includes(value),
    );

    renderStudents(filtered);
  } else {
    renderStudents(allStudents);
  }
};
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
    const lessonName =
      settings.names?.[i - 1] + " ( " + settings.max[i - 1] + " ) " ||
      `قطعة ${i}`;

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

  /* =========================
     Check If Exists
  ========================= */

  const snap = await getDocs(collection(db, "stages", stage, "students"));

  let exists = false;

  snap.forEach((d) => {
    const student = d.data();

    if (student.name.trim() === name) {
      exists = true;
    }
  });

  if (exists) {
    alert("الاسم موجود بالفعل");

    return;
  }

  /* =========================
     Create Lessons
  ========================= */

  let lessons = {};

  for (let i = 1; i <= settings.pieces; i++) {
    lessons[`piece${i}`] = 0;
  }

  /* =========================
     Add Student
  ========================= */

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
function renderStudents(students = allStudents) {
  table.innerHTML = "";

  let dataToShow = showAll ? students : students.slice(0, 5);

  dataToShow.forEach((student) => {
    let tr = document.createElement("tr");

    /* =========================
       NAME
    ========================= */

    tr.innerHTML += `
      <td class='name'>
        ${student.name}
      </td>
    `;

    /* =========================
       PIECES
    ========================= */

    for (let i = 1; i <= settings.pieces; i++) {
      let val = student.lessons?.[`piece${i}`] || 0;

      let max = settings.max?.[i - 1] || 10;

      tr.innerHTML += `
        <td
          data-label="
          ${settings.names[i - 1]}
          (
          ${settings.max[i - 1]}
          )
          "
        >

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

    /* =========================
       TOTAL
    ========================= */

    let total = calculateTotal(student.lessons || {});

    tr.innerHTML += `
      <td class='total'>
        ${total}
      </td>
    `;

    table.appendChild(tr);
  });

  attachEvents();

  /* =========================
     SHOW BUTTON
  ========================= */

  if (students.length <= 5) {
    showAllBtn.style.display = "none";
  } else {
    showAllBtn.style.display = "block";

    showAllBtn.innerHTML = showAll ? "عرض أقل" : "عرض الكل";
  }
}

/* =========================
   Get Students
========================= */

function getStudents() {
  onSnapshot(
    collection(db, "stages", stage, "students"),

    (snap) => {
      let students = [];

      snap.forEach((d) => {
        students.push({
          id: d.id,
          ...d.data(),
        });
      });

      students.sort((a, b) => a.name.localeCompare(b.name, "ar"));

      allStudents = students;

      totalStudents.innerHTML = students.length;

      const searchValue = document
        .getElementById("search")
        .value.trim()
        .toLowerCase();

      if (searchValue) {
        const filtered = allStudents.filter((student) =>
          student.name.toLowerCase().includes(searchValue),
        );

        renderStudents(filtered);
      } else {
        renderStudents(allStudents);
      }
    },
  );
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

      /* =========================
           Validation
        ========================= */

      if (value < 0) value = 0;

      if (value > max) value = max;

      this.value = value;

      /* =========================
           Firebase Update
        ========================= */

      const ref = doc(db, "stages", stage, "students", id);

      await updateDoc(ref, {
        [`lessons.${piece}`]: value,
      });

      /* =========================
           Local Update
        ========================= */

      const student = allStudents.find((s) => s.id === id);

      if (!student.lessons) {
        student.lessons = {};
      }

      student.lessons[piece] = value;

      /* =========================
           Update Total Only
        ========================= */

      const tr = this.closest("tr");

      const totalTd = tr.querySelector(".total");

      totalTd.innerHTML = calculateTotal(student.lessons);
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

  /* =========================
     EMPTY SEARCH
  ========================= */

  if (!value) {
    renderStudents(allStudents);

    return;
  }

  /* =========================
     FILTER
  ========================= */

  const filtered = allStudents.filter((student) =>
    student.name.toLowerCase().includes(value),
  );

  /* =========================
     RENDER TABLE
  ========================= */

  renderStudents(filtered);

  /* =========================
     SUGGESTIONS
  ========================= */

  filtered.slice(0, 5).forEach((student) => {
    const div = document.createElement("div");

    div.innerHTML = student.name;

    div.onclick = function () {
      document.getElementById("search").value = student.name;

      suggestions.innerHTML = "";

      renderStudents([student]);
    };

    suggestions.appendChild(div);
  });
};

/* =========================
   Init
========================= */

loadSettings().then(() => {
  renderHeader();

  getStudents();
});

window.backupExcel = async function () {
  try {
    const workbook = XLSX.utils.book_new();

    const stagesSnap = await getDocs(collection(db, "stages"));

    for (const stageDoc of stagesSnap.docs) {
      const stageName = stageDoc.id;

      /* =========================
         SETTINGS
      ========================= */

      let settings = {
        pieces: 0,
        names: [],
        max: [],
      };

      const settingsRef = doc(db, "stages", stageName, "settings", "main");

      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        settings = settingsSnap.data();
      }

      /* =========================
         STUDENTS
      ========================= */

      const studentsSnap = await getDocs(
        collection(db, "stages", stageName, "students"),
      );

      let data = [];

      studentsSnap.forEach((student) => {
        const s = student.data();

        let row = {
          الاسم: s.name || "",
        };

        let total = 0;

        for (let i = 1; i <= settings.pieces; i++) {
          const lessonName = settings.names?.[i - 1] || `قطعة ${i}`;

          const value = Number(s.lessons?.[`piece${i}`] || 0);

          row[lessonName] = value;

          total += value;
        }

        row["المجموع"] = total;

        data.push(row);
      });

      /* =========================
         لو مفيش طلاب
      ========================= */

      if (data.length === 0) {
        data.push({
          "لا يوجد بيانات": "",
        });
      }

      /* =========================
         SHEET
      ========================= */

      const worksheet = XLSX.utils.json_to_sheet(data);

      XLSX.utils.book_append_sheet(workbook, worksheet, stageName.slice(0, 31));
    }

    /* =========================
       DOWNLOAD
    ========================= */

    const date = new Date().toLocaleDateString("en-CA");

    XLSX.writeFile(
      workbook,
      `Backup-${localStorage.getItem("stage")}-${date}.xlsx`,
    );

    alert("Backup Done");
  } catch (error) {
    alert(error.message);

    console.error(error);
  }
};
