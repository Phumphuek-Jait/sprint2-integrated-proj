import { loadDatas, deleteData, addData, editData } from './service.js'

const scheduleTable = document.querySelector("#schedule")
const scheduleBody = scheduleTable.querySelector("#schedule-body")
const modal = document.getElementById('error-modal')

showSchedule()

async function showSchedule() {
    try{
        const scheduleDatas = await loadDatas()
        
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
    catch (error){
        console.error(error)
        showErrorModal()
    }
}

function newRow(data){
    const scheduleRow = document.createElement("tr")
    scheduleRow.dataset.testid = "schedule-row"

    scheduleRow.append(createCell("code", data?.code), createCell("title", data?.title), createCell("type", data?.type), createCell("section", data?.section), createCell("group", data?.group), createCell("day", toCapitalize(data?.day)), createCell("time", data?.time), createCell("weeks", data?.weeks), createCell("remarks", data?.remarks))
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
    emptyRow.append(emptyCell)
    scheduleBody.append(emptyRow)
}



function toCapitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function fetchSchedules(){
    try{
        const response = await fetch('/api/v1/health');
        if (response.status !== 200){
            showErrorModal();
            return;
        }
        const data = await response.json();

    }catch (error){
        showErrorModal();
    }
}

function showErrorModal() {
  const modal = document.getElementById('error-modal')

  if (modal) {
    modal.oncancel = (event) => {
      event.preventDefault()
    }

    if (!modal.open) {
      modal.showModal()
    }
  }
}

fetchSchedules()