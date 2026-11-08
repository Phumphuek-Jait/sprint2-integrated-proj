import { loadDatas, deleteData, addData, editData } from './service.js'

const scheduleTable = document.querySelector("#schedule")
const scheduleBody = scheduleTable.querySelector("#schedule-body")
const modal = document.getElementById('error-modal')

modal.addEventListener('cancel', (event) => {
    event.preventDefault()
})

fetchSchedules()

async function fetchSchedules(){
    try{
        const healthResponse = await fetch('/api/v1/health')

        if(!healthResponse.ok){
            throw new Error(`Health check failed: ${healthResponse.status}`)
        }
        const scheduleDatas = await loadDatas()
        showSchedule(scheduleDatas)
    }catch (error){
        console.error(error)
        showErrorModal()
    }
}


function showSchedule(scheduleDatas) {
    if (!scheduleDatas || scheduleDatas.length === 0) {
        emptySchedule()
        return
    }
        
    const scheduleFragment = document.createDocumentFragment()
    scheduleDatas.forEach(data => {
        const row = newRow(data)
        scheduleFragment.append(row)
    });
    scheduleBody.append(scheduleFragment)
}

function newRow(data){
    const scheduleRow = document.createElement("tr")
    scheduleRow.dataset.testid = "schedule-row"

    scheduleRow.append(createCell("code", data?.course.code), createCell("title", data?.course.title), createCell("type", data?.course.type), createCell("section", data?.section), createCell("group", data?.studentGroup), createCell("day", toCapitalize(data?.dayOfWeek)), createCell("time", `${data?.startTime}-${data?.endTime}`), createCell("weeks", `${data?.startWeek}-${data?.endWeek}`), createCell("remarks", data?.remarks))
    return scheduleRow
}

function createCell(testId, value) {
    const cell = document.createElement("td")
    cell.dataset.testid = testId
    cell.textContent = value ?? ""
    return cell
}

function emptySchedule(){
    const emptyRow = document.createElement("tr")
    const emptyCell = document.createElement("td")
    emptyCell.colSpan = 9
    emptyCell.textContent = "There is currently no class schedule. Please check back later."
    emptyCell.dataset.testid = "empty-message"
    emptyRow.append(emptyCell)
    scheduleBody.append(emptyRow)
}



function toCapitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function showErrorModal() {
    if(modal && !modal.open){
        modal.showModal()
    }
}
