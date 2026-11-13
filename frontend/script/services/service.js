import { getItems, deleteItem, addItem, editItem } from '../utils/fetchUtils.js'
//Nodejs+Express+SQLite backend
const apiURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/schedules'
const apiURLH = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/health'
const apiStudentURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/stydents'
const apiYearLevelURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/year-levels'
//JSON Server
// const apiURL = 'http://localhost:3000/schedules'

function loadDatas(yearLevel) {
  const url =
    yearLevel === undefined
      ? apiURL
      : `${apiURL}?yearLevel=${encodeURIComponent(yearLevel)}`

  return getItems(url)
}

function deleteData(id) {
  return deleteItem(apiURL, id)
}

function addData(data) {
  return addItem(apiURL, data)
}

function editData(data) {
  return editItem(apiURL, data)
}

function fetchhealth() {
  return getItems(apiURLH)
}

async function getStudentProfile(studentId){
  const res = await fetch(`${apiStudentURL}/${encodeURIComponent(studentId)}`)
  //ดักคนที่ไม่ใช้ นศ หรือรหัสผิด
  if(res.status === 404){
    const errordata = await res.json()
    return {notFound: true, message: errordata.message}
  }
  
  //backend ตอบกลับมาสำเร็จไหม
  if(!res.ok){
    throw new Error('Failed to fetch student profile')
  }
  return await res.json()
}

function loadSchedulebyYearAndGroup(yearLevel,studentGroup){
  const url = `${apiYearLevelURL}/${encodeURIComponent(yearLevel)}/schedules?studentGroup=${encodeURIComponent(studentGroup)}`
  return getItems(url)
}

export { loadDatas, deleteData, addData, editData, fetchhealth, getStudentProfile, loadSchedulebyYearAndGroup }
