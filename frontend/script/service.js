import { getItems, deleteItem, addItem, editItem } from './utils/fetchUtils.js'
//Nodejs+Express+SQLite backend
const apiURL = '/intproj26/ip26-line/api/v1/schedules'
//JSON Server
// const apiURL = 'http://localhost:3000/schedules'

function loadDatas() {
  return getItems(apiURL)
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

export { loadDatas, deleteData, addData, editData }
