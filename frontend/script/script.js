import { loadDatas, deleteData, addData, editData } from './service.js'

const scheduleTable = document.querySelector("#schedule")
const scheduleBody = scheduleTable.querySelector("#schedule-body")

showSchedule

async function showSchedule() {
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

function newRow(data){
    const scheduleRow = document.createElement("tr")
    scheduleRow.dataset.testid = "schedule-row"

    const classCode= document.createElement("td")
    classCode.dataset.testid = "code"
    classCode.textContent= data?.code ?? ""  

    const classTitle= document.createElement("td")
    classTitle.dataset.testid = "title"
    classTitle.textContent= data?.title ?? "" 
    
    const classType= document.createElement("td")
    classType.dataset.testid = "type"
    classType.textContent= data?.type ?? ""

    const classSection= document.createElement("td")
    classSection.dataset.testid = "section"
    classSection.textContent= data?.section ?? ""

    const classGroup= document.createElement("td")
    classGroup.dataset.testid = "group"
    classGroup.textContent= data?.group ?? ""

    const classDay= document.createElement("td")
    classDay.dataset.testid = "day"
    classDay.textContent= data?.day ?? ""

    const classTime= document.createElement("td")
    classTime.dataset.testid = "time"
    classTime.textContent= data?.time ?? ""

    const classWeeks= document.createElement("td")
    classWeeks.dataset.testid = "weeks"
    classWeeks.textContent= data?.weeks ?? ""

    const classRemarks= document.createElement("td")
    classRemarks.dataset.testid = "remarks"
    classRemarks.textContent= data?.remarks ?? ""

    scheduleRow.append(classCode, classTitle, classType, classSection, classGroup, classDay, classTime, classWeeks, classRemarks)

    return scheduleRow
}

function emptySchedule(){
    const emptyRow = document.createElement("tr")
    const emptyCell = document.createElement("td")
    emptyCell.colSpan = 9
    emptyCell.textContent = "There is currently no class schedule. Please check back later."
    emptyRow.append(emptyCell)
    scheduleBody.append(emptyRow)
}