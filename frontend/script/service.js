import { getItems, deleteItem, addItem, editItem } from './utils/fetchUtils.js'
//Nodejs+Express+SQLite backend
const apiURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/schedules'
const apiURLH = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/health'
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

export { loadDatas, deleteData, addData, editData, fetchhealth }
