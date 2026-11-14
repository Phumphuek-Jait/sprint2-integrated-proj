//จักหน้า my-schedule
import { requireSignIn, signOut } from "./auth.js";
import { createCell, toCapitalize } from "./utils/tableUtils.js";
import { getStudentProfile, loadSchedulebyYearAndGroup, getStudentSelection} from "./services/service.js";

async function initpage(){
   const user = await requireSignIn()
   document.getElementById("user-display-name").textContent = user.name;
   document.getElementById("sign-out-button").addEventListener('click', () => {
    signOut();
   });

   if(user.roles && user.roles.includes("lecturer")){
      document.getElementById("lecturer-message").hidden = false
      return
   }

   const studentId = user.username;
   await loadMySchedule(studentId) 
}

async function loadMySchedule(studentId){
   const notStudentEl = document.getElementById("not-student-message")
   const myScheduleSection = document.getElementById('status-message');
   const courseOptionSection = document.getElementById("course-options-section");

   try{
      const student = await getStudentProfile(studentId);
      if(student.notFound){
         notStudentEl.hidden = false
         myScheduleSection.hidden = true
         courseOptionSection.hidden = true
         return;
      }

      

      const [schedules, selections] = await Promise.all([
         loadSchedulebyYearAndGroup(student.yearLevel, student.studentGroup),
         getStudentSelection(studentId)
      ])

      const myScheduleItems = []
      const courseOptionItems = []

      schedules.forEach((schedule) => {
         const courseId = schedule.course?.id ?? schedule.courseId
         const matchedSelection = selections.find((sel) => {
            const selCourseId = sel.courseId ?? sel.course?.id
            return selCourseId === courseId
         })

      if (schedule.fixed) {
        myScheduleItems.push(schedule)
      } else if (matchedSelection) {
        if (schedule.section === matchedSelection.section) {
          myScheduleItems.push(schedule)
        }
      } else {
        courseOptionItems.push(schedule)
      }
    })

    myScheduleSection.hidden = false
    renderTable('my-schedule-body', myScheduleItems)

    courseOptionsSection.hidden = courseOptionItems.length === 0
    renderTable('course-options-body', courseOptionItems)

  } catch (error) {
    console.error('Error loading schedule:', error)
    if (!modal.open) {
      modal.showModal()
    }
  }
}

function renderTable(tbodyId, items) {
  const tbody = document.getElementById(tbodyId)
  tbody.replaceChildren()

  items.forEach((data) => {
    const row = document.createElement('tr')
    row.dataset.testid = 'schedule-row'

    row.append(
      createCell('code', data?.course?.code),
      createCell('title', data?.course?.title),
      createCell('type', data?.course?.type),
      createCell('section', data?.section),
      createCell('group', data?.studentGroup),
      createCell('day', toCapitalize(data?.dayOfWeek)),
      createCell('time', `${data?.startTime}-${data?.endTime}`),
      createCell('weeks', `${data?.startWeek}-${data?.endWeek}`),
      createCell('remarks', data?.remarks)
    )
    tbody.append(row)
  })
}

initpage();