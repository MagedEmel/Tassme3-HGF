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
   DELETE OLD HISTORY
========================= */

async function deleteOldHistory() {
  const now = Date.now();

  const lastWeek = now - 7 * 24 * 60 * 60 * 1000;

  const snap = await getDocs(collection(db, "history"));

  for (const historyDoc of snap.docs) {
    const data = historyDoc.data();

    if (data.time < lastWeek) {
      await deleteDoc(doc(db, "history", historyDoc.id));
    }
  }
}

deleteOldHistory();
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
    table.innerHTML = "";
    return;
  }

  currentStudent = value;

  const filtered = allStudents.filter((student) => {
    const studentName = student.name.trim().toLowerCase().replace(/\s+/g, " ");

    return studentName === value;
  });

  const pagination = document.getElementById("pagination");

  pagination.style.display = "none";

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
function renderStudents(students = allStudents) {
  renderStudentsHeader();
  table.innerHTML = "";

  let dataToShow = students;
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
        return;
      }

      const filtered = allStudents.filter((student) => {
        const studentName = student.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

        return studentName === currentStudent;
      });

      renderStudents(filtered);
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

/* =========================
   HISTORY PAGINATION
========================= */

import {
  query,
  orderBy,
  limit,
  startAfter,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let historyPages = [];

let currentHistoryPage = 0;

const historyLimit = 10;

/* =========================
   DELETE OLD HISTORY
========================= */

/* =========================
   HISTORY BUTTON
========================= */

document.getElementById("historyBtn").onclick = async function () {
  historyPages = [];

  currentHistoryPage = 0;

  await loadHistory();
};

/* =========================
   LOAD HISTORY
========================= */

async function loadHistory(direction = "next") {
  renderHistoryHeader();

  table.innerHTML = "";

  const pagination = document.getElementById("pagination");
  pagination.style.display = "flex";
  pagination.innerHTML = "";

  const now = Date.now();

  const lastWeek = now - 7 * 24 * 60 * 60 * 1000;

  let q;

  /* =========================
     FIRST PAGE
  ========================= */

  if (historyPages.length === 0) {
    q = query(
      collection(db, "history"),

      orderBy("time", "desc"),

      limit(historyLimit),
    );
  } else if (direction === "next") {
    /* =========================
     NEXT PAGE
  ========================= */
    q = query(
      collection(db, "history"),

      orderBy("time", "desc"),

      startAfter(historyPages[historyPages.length - 1]),

      limit(historyLimit),
    );
  } else {
    /* =========================
     PREVIOUS PAGE
  ========================= */
    const prevIndex = currentHistoryPage - 1;

    if (prevIndex < 0) return;

    currentHistoryPage = prevIndex;

    const prevDoc = prevIndex === 0 ? null : historyPages[prevIndex - 1];

    if (prevDoc) {
      q = query(
        collection(db, "history"),

        orderBy("time", "desc"),

        startAfter(prevDoc),

        limit(historyLimit),
      );
    } else {
      q = query(
        collection(db, "history"),

        orderBy("time", "desc"),

        limit(historyLimit),
      );
    }
  }

  const snap = await getDocs(q);

  let data = [];

  snap.forEach((docu) => {
    const d = docu.data();

    if (d.time >= lastWeek && d.stage === stage) {
      data.push(d);
    }
  });

  /* =========================
     SAVE LAST DOC
  ========================= */

  if (snap.docs.length > 0 && direction !== "prev") {
    historyPages.push(snap.docs[snap.docs.length - 1]);

    currentHistoryPage = historyPages.length - 1;
  }

  renderHistory(data);

  renderHistoryPagination(snap.docs.length);
}

/* =========================
   RENDER HISTORY
========================= */

function renderHistory(data) {
  table.innerHTML = "";

  for (const item of data) {
    const userName = item.userName || "غير معروف";

    const tr = document.createElement("tr");

    const date = new Date(item.time);

    tr.innerHTML = `
      <td class="name">
        ${item.studentName}
      </td>

      <td data-label="القطعة">
        ${item.piece}
      </td>

      <td data-label="الدرجة القديمة">
        ${item.oldValue}
      </td>

      <td data-label="الدرجة الجديدة">
        ${item.newValue}
      </td>

      <td data-label="الخادم">
        ${userName}
      </td>

      <td data-label="الوقت">
        ${date.toLocaleString("ar-EG")}
      </td>
    `;

    table.appendChild(tr);
  }
}

/* =========================
   PAGINATION
========================= */

function renderHistoryPagination(count) {
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  /* =========================
     PREVIOUS
  ========================= */

  const prevBtn = document.createElement("button");

  prevBtn.innerHTML = "السابق";

  prevBtn.disabled = currentHistoryPage === 0;

  prevBtn.onclick = async () => {
    await loadHistory("prev");
  };

  pagination.appendChild(prevBtn);

  /* =========================
     PAGE NUMBER
  ========================= */

  const pageBtn = document.createElement("button");

  pageBtn.innerHTML = currentHistoryPage + 1;

  pageBtn.classList.add("active");

  pagination.appendChild(pageBtn);

  /* =========================
     NEXT
  ========================= */

  const nextBtn = document.createElement("button");

  nextBtn.innerHTML = "التالي";

  nextBtn.disabled = count < historyLimit;

  nextBtn.onclick = async () => {
    await loadHistory("next");
  };

  pagination.appendChild(nextBtn);
}

/* =========================
   HEADER
========================= */

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

console.log(localStorage.getItem("uid"));
