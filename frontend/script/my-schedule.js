
import { requireSignIn, signOut, authFetch } from "./auth.js";
import { createCell, toCapitalize } from "./utils/tableUtils.js";
import {getStudentProfile,loadSchedulebyYearAndGroup,getStudentSelection} from "./services/service.js";

const userNameElement = document.getElementById("user-display-name");
const userSection = document.getElementById("user-info");
const signOutButton = document.getElementById("sign-out-button");
const authStatus = document.getElementById("auth-status");
const selectionDialog = document.getElementById("selection-message");
document.getElementById("selection-message-ok").addEventListener("click", () => selectionDialog.close());

function showSelectionMessage(message) {
  document.getElementById("selection-message-text").textContent = message;
  if (!selectionDialog.open) selectionDialog.showModal();
}

async function selectCourse(studentId, schedule, button, onSelected, onConflict) {
  button.disabled = true;
  try {
    const response = await authFetch(new URL(`api/v1/students/${encodeURIComponent(studentId)}/selections`, document.baseURI), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: schedule.course.id, section: schedule.section })
    });
    if (response.status === 409) {
      selectionDialog.addEventListener("close", onConflict, { once: true });
      showSelectionMessage("This course is already in your schedule.");
      button.disabled = false;
      return;
    }
    if (!response.ok) throw new Error(`Selection failed: ${response.status}`);
    onSelected(await response.json());
  } catch (error) {
    console.error(error);
    button.disabled = false;
    showSelectionMessage("There is a problem. Please try again later.");
  }
}

async function initPage() {
  if (!userNameElement || !userSection || !signOutButton || !authStatus) {
    console.error("My Schedule authentication elements are missing.");
    return;
  }

  signOutButton.disabled = true;
  authStatus.textContent = "Checking your sign-in with KMUTT account...";
  authStatus.hidden = false;

  try {
    const user = await requireSignIn();

    userNameElement.textContent = user.name || user.username || "User";
    userSection.hidden = false;
    authStatus.hidden = true;
    signOutButton.disabled = false;

    signOutButton.addEventListener("click", async () => {
      signOutButton.disabled = true;

      try {
        await signOut();
      } catch (error) {
        console.error("Unable to sign out:", error);
        authStatus.textContent = "Unable to sign out. Please try again.";
        authStatus.hidden = false;
        signOutButton.disabled = false;
      }
    });

    if (user.roles && user.roles.includes("lecturer")) {
      document.getElementById("lecturer-message").hidden = false;
      return;
    }

    await loadMySchedule(user.username);

  } catch (error) {
    console.error("My Schedule sign-in failed:", error);

    authStatus.textContent =
      "Unable to sign in. Please reload the page or contact the administrator.";

    authStatus.hidden = false;
    userSection.hidden = true;
    signOutButton.disabled = true;
  }
}

initPage();

async function loadMySchedule(studentId) {
  const notStudentEl = document.getElementById("not-student-message");
  const myScheduleSection = document.getElementById("my-schedule-section");
  const courseOptionSection = document.getElementById("course-options-section");
  const modal = document.getElementById("error-modal");

  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
  });

  try {
    const student = await getStudentProfile(studentId);

    if (!student || student.notFound) {
      notStudentEl.hidden = false;
      myScheduleSection.hidden = true;
      courseOptionSection.hidden = true;
      return;
    }

    const studentProfile = document.getElementById("student-profile");
    studentProfile.textContent =
      `Year ${student.yearLevel} · Group ${student.studentGroup}`;

    const [schedules, selections] = await Promise.all([
      loadSchedulebyYearAndGroup(student.yearLevel, student.studentGroup),
      getStudentSelection(studentId)
    ]);

    function refreshTables() {
      renderSchedules(schedules, selections, studentId, (selection) => {
        selections.push(selection);
        refreshTables();
      }, async () => {
        try {
          const currentSelections = await getStudentSelection(studentId);
          selections.splice(0, selections.length, ...currentSelections);
          refreshTables();
        } catch (error) {
          console.error(error);
          showSelectionMessage("There is a problem. Please try again later.");
        }
      });
    }
    refreshTables();
  } catch (error) {
    console.error("Error loading schedule:", error);

    if (!modal.open) {
      modal.showModal();
    }
  }
}

function renderSchedules(schedules, selections, studentId, onSelected, onConflict) {
  const myScheduleSection = document.getElementById("my-schedule-section");
  const courseOptionSection = document.getElementById("course-options-section");
  const myScheduleItems = [];
  const courseOptionItems = [];

  schedules.forEach((schedule) => {
    const courseId = schedule.course?.id ?? schedule.courseId;

    const matchedSelection = selections.find((sel) => {
      const selCourseId = sel.courseId ?? sel.course?.id;
      return selCourseId === courseId;
    });

    if (schedule.fixed) {
      myScheduleItems.push(schedule);
    } else if (matchedSelection) {
      if (schedule.section === matchedSelection.section) {
        myScheduleItems.push(schedule);
      }
    } else {
      courseOptionItems.push(schedule);
    }
  });

  myScheduleSection.hidden = false;

  renderTable(
    "my-schedule-body",
    myScheduleItems,
    "No classes yet. Choose from Courses to Choose."
  );

  courseOptionSection.hidden = courseOptionItems.length === 0;
  renderTable("course-options-body", courseOptionItems, null, studentId, onSelected, onConflict);
}

function renderTable(tbodyId, items, emptyMessage = null, studentId = null, onSelected = null, onConflict = null) {
  const tbody = document.getElementById(tbodyId);
  tbody.replaceChildren();

  if (items.length === 0 && emptyMessage) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    row.dataset.testid = "my-schedule-empty";
    cell.colSpan = tbody.closest("table").querySelectorAll("thead th").length;
    cell.textContent = emptyMessage;

    row.append(cell);
    tbody.append(row);
    return;
  }

  items.forEach((data) => {
    const row = document.createElement("tr");
    row.dataset.testid = "schedule-row";

    row.append(
      createCell("code", data?.course?.code),
      createCell("title", data?.course?.title),
      createCell("type", data?.course?.type),
      createCell("section", data?.section),
      createCell("group", data?.studentGroup),
      createCell("day", toCapitalize(data?.dayOfWeek)),
      createCell("time", `${data?.startTime}-${data?.endTime}`),
      createCell("weeks", `${data?.startWeek}-${data?.endWeek}`),
      createCell("room", data?.room),
      createCell("remarks", data?.remarks)
    );

    if (studentId !== null) {
      const cell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Select";
      button.addEventListener("click", () => selectCourse(studentId, data, button, onSelected, onConflict));
      cell.append(button);
      row.append(cell);
    }

    tbody.append(row);
  });
}


