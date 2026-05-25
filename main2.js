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
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  query,
  orderBy,
  limit,
  startAfter,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import * as XLSX from "https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs";

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

let historyLastDoc = null;

let historyFirstLoad = true;

/*
document.getElementById("excelInput").addEventListener("change", async (e) => {
  try {
    const file = e.target.files[0];

    if (!file) return;

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer);

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const studentsRef = collection(db, "stages", stage, "students");

    const studentsSnap = await getDocs(studentsRef);

    let existingNames = [];

    studentsSnap.forEach((d) => {
      existingNames.push(d.data().name.trim().toLowerCase());
    });

    let added = 0;

    for (const row of data) {
      const name = (row["الاسم"] || "").trim();

      if (!name) continue;

      if (existingNames.includes(name.toLowerCase())) {
        continue;
      }

      const lessons = {};

      for (let i = 1; i <= settings.pieces; i++) {
        lessons[`piece${i}`] = 0;
      }

      await addDoc(studentsRef, {
        name,
        lessons,
      });

      added++;
    }

    alert(`تم إضافة ${added} طالب ✅`);

    e.target.value = "";
  } catch (error) {
    console.log(error);

    alert("حصل خطأ");
  }
});
*/

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.body.style.display = "block";
  }
});

/* =========================
   Stage
========================= */

const stage = localStorage.getItem("stage");

if (!stage) {
  alert("اعمل Login الاول");
  window.location.href = "index.html";
}

let grade = document.getElementById("grade");
grade.innerHTML = localStorage.getItem("stage");
let backword = document.getElementById("backword");
backword.onclick = async () => {
  const uid = localStorage.getItem("uid");

  const userRef = doc(db, "users", uid);

  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();

    if (userData.role === "admin") window.location.href = "stage.html";
    else {
      window.location.href = "index.html";
      localStorage.removeItem("uid");
      localStorage.removeItem("userName");
      localStorage.removeItem("stage");
    }
  }
};

let messges = [
  "بنشكرك على طول بالك مع الاطفال ربنا يعوضك ❤️",
  "الايه دعوا الاولاد ياتون الى .... ",
  "الجو حر انهاردة بس متقلقش التكييف شغال 😅",
  "متخليش حد يمشى وهو زعلان هااا فرح اطفالك حتى لو بكلمه حلوه 😍 ",
  "حِينَئِذٍ امْتَلأَتْ أَفْوَاهُنَا ضِحْكًا، وَأَلْسِنَتُنَا تَرَنُّمًا. حِينَئِذٍ قَالُوا بَيْنَ الأُمَمِ: إِنَّ الرَّبَّ قَدْ عَظَّمَ الْعَمَلَ مَعَ هؤُلاَءِ (سفر المزامير 126: 2)",
  "فَرِحِينَ فِي الرَّجَاءِ، صَابِرِينَ فِي الضَّيْقِ، مُواظِبِينَ عَلَى الصَّلاَةِ (رسالة بولس الرسول إلى أهل رومية 12: 12) ",
  "لاَ تَحْزَنُوا، لأَنَّ فَرَحَ الرَّبِّ هُوَ قُوَّتُكُمْ. (نح 8: 10).",
  "فَرِّحْ نَفْسَ عَبْدِكَ، لأَنَّنِي إِلَيْكَ يَا رَبُّ أَرْفَعُ نَفْسِي (سفر المزامير 86: 4)",
  "حَتَّى الآنَ لَمْ تَطْلُبُوا بِاسْمِي شَيْئاً. اطْلُبُوا تَنَالُوا، فَيَكُونَ فَرَحُكُمْ كَامِلاً.يُوحَنَّا ١٦:‏٢٤",
  "* الْجَوَابُ الْمُلائِمُ يُفَرِّحُ الإِنْسَانَ، وَمَا أَحْسَنَ الْكَلِمَةَ فِي حِينِهَا.أَمْثَالٌ ١٥:‏٢٣ ",
  "فَلْيَتَبَرَّعْ كُلُّ وَاحِدٍ بِمَا نَوَى فِي قَلْبِهِ، لَا بِأَسَفٍ وَلا عَنِ اضْطِرَارٍ، لأَنَّ اللهَ يُحِبُّ مَنْ يُعْطِي بِسُرُورٍ.كُورِنْثُوسَ ٱلثَّانِيةُ ٩:‏٧",
  "لَيْتَكُمْ تَصْمُتُونَ صَمْتًا. يَكُونُ ذلِكَ لَكُمْ حِكْمَةً",
  "يَصْمُتُ الْعَاقِلُ فِي ذلِكَ الزَّمَانِ لأَنَّهُ زَمَانٌ رَدِيءٌ (سفر عاموس 5: 13)",
  "الْحِكْمَةُ هِيَ الرَّأْسُ. فَاقْتَنِ الْحِكْمَةَ، وَبِكُلِّ مُقْتَنَاكَ اقْتَنِ الْفَهْمَ (سفر الأمثال 4: 7)",
  "وَرَابحُ النُّفُوسِ حَكِيمٌ (سفر الأمثال 11: 30)",
  "لأَنَّ غَضَبَ الإِنْسَانِ لاَ يَصْنَعُ بِرَّ اللهِ (رسالة يعقوب 1: 20)",
  "بَطِيءُ الْغَضَبِ كَثِيرُ الْفَهْمِ، وَقَصِيرُ الرُّوحِ مُعَلِّي الْحَمَقِ (سفر الأمثال 14: 29)",
  "اَ تُسْرِعْ بِرُوحِكَ إِلَى الْغَضَبِ، لأَنَّ الْغَضَبَ يَسْتَقِرُّ فِي حِضْنِ الْجُهَّالِ",
];
let messge = document.getElementById("messge");
const dayIndex =
  Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % messges.length;

messge.innerHTML = messges[dayIndex];

/* =========================
   DOM
========================= */

const table = document.querySelector("tbody.data");

let allStudents = [];
let currentStudent = "";

/* =========================
   Settings
========================= */

let settings = {
  pieces: 4,
  max: [10, 10, 10, 10],
  names: [],
};

const searchBtn = document.getElementById("searchBtn");

searchBtn.onclick = function () {
  const value = document
    .getElementById("search")
    .value.trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!value) {
    currentStudent = "";

    table.innerHTML = "";

    document.getElementById("pagination").innerHTML = "";

    renderStudentsHeader();

    return;
  }

  currentStudent = value;

  currentPage = 1;

  const filtered = allStudents.filter((student) => {
    const studentName = student.name.trim().toLowerCase().replace(/\s+/g, " ");

    return studentName.includes(value);
  });

  renderStudents(filtered);
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

function renderStudentsHeader() {
  const theadRow = document.querySelector("thead tr");

  if (!theadRow) return;

  theadRow.innerHTML = `<th id="name">الاسم</th>`;

  let t = 0;

  for (let i = 1; i <= settings.pieces; i++) {
    const lessonName =
      " ( " + settings.max[i - 1] + " ) " + settings.names?.[i - 1];

    t += settings.max[i - 1];

    theadRow.innerHTML += `
      <th>${lessonName}</th>
    `;
  }

  theadRow.innerHTML += `<th> ( ${t} ) المجموع</th>`;
}
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
/* =========================
   Pagination
========================= */

let currentPage = 1;

const rowsPerPage = 10;

/* =========================
   Render Students
========================= */

function renderStudents(students = allStudents) {
  document.getElementById("historyCount").innerHTML = "";

  renderStudentsHeader();

  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;

  const end = start + rowsPerPage;

  const dataToShow = students.slice(start, end);

  dataToShow.forEach((student) => {
    let tr = document.createElement("tr");

    tr.innerHTML += `
      <td class='name'>
        ${student.name}
      </td>
    `;

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

    let total = calculateTotal(student.lessons || {});

    tr.innerHTML += `
      <td class='total'>
        ${total}
      </td>
    `;

    table.appendChild(tr);
  });

  attachEvents();

  renderPagination(students);
}

/* =========================
   Render Pagination
========================= */

function renderPagination(students) {
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  const totalPages = Math.ceil(students.length / rowsPerPage);

  if (totalPages <= 1) return;

  /* =========================
     PREV
  ========================= */

  const prevBtn = document.createElement("button");

  prevBtn.innerHTML = "«";

  prevBtn.disabled = currentPage === 1;

  prevBtn.onclick = () => {
    currentPage--;

    renderStudents(students);
  };

  pagination.appendChild(prevBtn);

  /* =========================
     PAGE BUTTONS
  ========================= */

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");

    btn.innerHTML = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      currentPage = i;

      renderStudents(students);
    };

    pagination.appendChild(btn);
  }

  /* =========================
     NEXT
  ========================= */

  const nextBtn = document.createElement("button");

  nextBtn.innerHTML = "»";

  nextBtn.disabled = currentPage === totalPages;

  nextBtn.onclick = () => {
    currentPage++;

    renderStudents(students);
  };

  pagination.appendChild(nextBtn);
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

      if (!currentStudent) {
        table.innerHTML = "";

        document.getElementById("pagination").innerHTML = "";

        renderStudentsHeader();

        return;
      } else {
        const filtered = allStudents.filter((student) => {
          const studentName = student.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

          return studentName.includes(currentStudent);
        });

        renderStudents(filtered);
      }
    },
  );
}

/* =========================
   Update Inputs
========================= */

function attachEvents() {
  document.querySelectorAll("input[type='number']").forEach((input) => {
    input.onblur = function () {
      const id = this.dataset.id;

      const piece = this.dataset.piece;

      let value = Number(this.value);

      const index = Number(piece.replace("piece", "")) - 1;

      const max = settings.max?.[index];

      if (value < 0) value = 0;

      if (value > max) value = max;

      this.value = value;

      const student = allStudents.find((s) => s.id === id);

      const pieceName = settings.names[index];

      /* =========================
         POPUP
      ========================= */

      const popup = document.getElementById("confirmPopup");

      const popupText = document.getElementById("popupText");

      const confirmBtn = document.getElementById("confirmBtn");

      const cancelBtn = document.getElementById("cancelBtn");

      popup.style.display = "flex";

      popupText.innerHTML = `
        انت هتعدل درجة
        <span style="color:#ffc107">
          ${student.name}
        </span>

        <br><br>

        في قطعة

        <span style="color:#00ff88">
          ${pieceName}
        </span>

        <br><br>

        و هتحط درجة

        <span style="color:#ff9800">
          ${value}
        </span>
      `;

      /* =========================
         CANCEL
      ========================= */

      cancelBtn.onclick = function () {
        popup.style.display = "none";
      };

      /* =========================
         CONFIRM
      ========================= */

      confirmBtn.onclick = async function () {
        popup.style.display = "none";

        const ref = doc(db, "stages", stage, "students", id);

        const oldValue = student.lessons?.[piece] || 0;

        await updateDoc(ref, {
          [`lessons.${piece}`]: value,
        });

        /* =========================
   SAVE HISTORY
========================= */

        const uid = localStorage.getItem("uid");

        const userName = localStorage.getItem("userName");

        await addDoc(collection(db, "history"), {
          stage: stage,

          studentName: student.name,

          piece: pieceName,

          oldValue: oldValue,

          newValue: value,

          uid: uid,

          userName: userName,

          newValue: value,

          time: Date.now(),
        });
      };
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

  if (!value) return;

  const filtered = allStudents.filter((student) =>
    student.name.toLowerCase().includes(value),
  );

  filtered.slice(0, 5).forEach((student) => {
    const div = document.createElement("div");

    div.innerHTML = student.name;

    div.onclick = function () {
      document.getElementById("search").value = student.name;

      suggestions.innerHTML = "";
    };

    suggestions.appendChild(div);
  });
};

/* =========================
   Init
========================= */

loadSettings().then(() => {
  renderStudentsHeader();

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
document.getElementById("historyBtn").onclick = async function () {
  currentPage = 1;

  historyLastDoc = null;

  await loadHistory();
};

async function loadHistory(next = false) {
  renderHistoryHeader();

  table.innerHTML = "";

  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  let q;

  if (next && historyLastDoc) {
    q = query(
      collection(db, "history"),

      orderBy("time", "desc"),

      startAfter(historyLastDoc),

      limit(rowsPerPage),
    );
  } else {
    q = query(
      collection(db, "history"),

      orderBy("time", "desc"),

      limit(rowsPerPage),
    );
  }

  const snap = await getDocs(q);

  let data = [];

  snap.forEach((docu) => {
    const d = docu.data();

    if (d.stage === stage) {
      data.push(d);
    }
  });

  if (snap.docs.length > 0) {
    historyLastDoc = snap.docs[snap.docs.length - 1];
  }

  renderHistory(data);

  renderHistoryPagination(data);
}

function renderHistoryHeader() {
  const theadRow = document.querySelector("thead tr");

  theadRow.innerHTML = `
    <th id="name">الطفل</th>
    <th>القطعة</th>
    <th>الدرجة القديمة</th>
    <th>الدرجة الجديدة</th>
    <th>الخادم</th>
    <th>الوقت</th>
  `;
}

/* =========================
   Render History
========================= */

function renderHistory(data) {
  table.innerHTML = "";

  data.forEach((item) => {
    const userName = item.userName || "غير معروف";

    const tr = document.createElement("tr");

    const date = new Date(item.time);

    tr.innerHTML = `
      <td class="name">
        ${item.studentName}
      </td>

      <td>
        ${item.piece}
      </td>

      <td>
        ${item.oldValue}
      </td>

      <td>
        ${item.newValue}
      </td>

      <td>
        ${userName}
      </td>

      <td>
        ${date.toLocaleString("ar-EG")}
      </td>
    `;

    table.appendChild(tr);
  });

  document.getElementById("historyCount").innerHTML =
    `عدد التعديلات المعروضة : ${data.length}`;
}

/* =========================
   History Pagination
========================= */

function renderHistoryPagination(data) {
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  /* =========================
     CURRENT PAGE
  ========================= */

  const currentBtn = document.createElement("button");

  currentBtn.innerHTML = currentPage;

  currentBtn.classList.add("active");

  pagination.appendChild(currentBtn);

  /* =========================
     NEXT
  ========================= */

  const nextBtn = document.createElement("button");

  nextBtn.innerHTML = "التالي";

  nextBtn.onclick = async () => {
    currentPage++;

    await loadHistory(true);
  };

  if (data.length < rowsPerPage) {
    nextBtn.disabled = true;

    nextBtn.classList.add("disabled");
  }

  pagination.appendChild(nextBtn);
}
console.log(localStorage.getItem("uid"));
