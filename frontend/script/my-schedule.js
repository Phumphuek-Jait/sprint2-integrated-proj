//จักหน้า my-schedule
import { requireSignIn, signOut } from "./auth.js";
import { getStudentProfile, loadSchedulebyYearAndGroup } from "./services/service.js";

async function initpage(){
   const user = await requireSignIn()
   document.getElementById("user-display-name").textContent = user.name;
   document.getElementById("sign-out-button").addEventListener('click', () => {
    signOut();
   });
   const studentId = user.preferred_username || user.username || user.studentId;
   await loadMySchedule(studentId) 
}

async function loadMySchedule(studentId){
   const statusEl = document.getElementById('status-message');
   const courseSection = document.getElementById("course-options-section");

   try{
      const student = await getStudentProfile(studentId);
      if(student.notFound){
         statusEl.textContent = student.message || "Your account is not a student of the BSc.IT program.";
         statusEl.hidden = false;
         courseSection.hidden = true;
         return;
      }

      const response = await loadSchedulebyYearAndGroup(student.yearLevel,student.studentGroup);
      const schedules = Array.isArray(response) ? response : (response.data || []);

      statusEl.hidden = true;
      courseSection.hidden = false;
      renderCourseOptions(schedules);

   }catch(error){
      console.error("Error loading schedule:", error);
      statusEl.textContent = "Failed to load schedule data.";
      statusEl.hidden = false;
   }
}

function renderCourseOptions(schedules){
   const tbody = document.getElementById("course-options-body")
   tbody.innerHTML = "";

   schedules.forEach((item) => {
      const tr = document.createElement("tr");
      const code = item.course?.code || item.code || "-";
      const title = item.course?.title || item.title || "-";
      const type = item.course?.type || item.type || "-";
      const section = item.section ?? "-";
      const group = item.studentGroup || "-";
      const day = item.dayOfWeek || "-";
      const time = `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`;
      const weeks = (item.startWeek && item.endWeek) ? `${item.startWeek}-${item.endWeek}` : "-";
      const room = item.room || "-";
      const remarks = item.remarks || "-";

      tr.innerHTML = `
         <td>${code}</td>
         <td>${title}</td>
         <td>${type}</td>
         <td>${section}</td>
         <td>${group}</td>
         <td>${day}</td>
         <td>${time}</td>
         <td>${weeks}</td>
         <td>${room}</td>
         <td>${remarks}</td>
      `;
      tbody.appendChild(tr);
   });
}

function formatTime(timeStr){
   if(!timeStr) return "";
   if(timeStr.includes("T")){
      return timeStr.split("T")[1].slice(0,5);
   }
   return timeStr.slice(0,5);
}

initpage();