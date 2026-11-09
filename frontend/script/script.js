import { loadDatas, deleteData, addData, editData } from './service.js'

const scheduleTable = document.querySelector('#schedule')
const scheduleBody = scheduleTable.querySelector('#schedule-body')
const modal = document.getElementById('error-modal')
const scheduleButtons = document.querySelectorAll('#buttons button')
const scheduleCache = new Map()

modal.addEventListener('cancel', (event) => {
  event.preventDefault()
})

window.addEventListener('popstate', () => {
  const yearLevel = getYearLevelFromURL()

  updateSelectedButton(yearLevel)
  fetchSchedules(yearLevel)
})

function updateURL(yearLevel) {
  const url = new URL(window.location.href)

  if (yearLevel === undefined) {
    url.searchParams.delete('yearLevel')
  } else {
    url.searchParams.set('yearLevel', yearLevel)
  }

  window.history.pushState({}, '', url)
}

scheduleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const yearLevel =
      button.id === 'All' ? undefined : Number(button.id.replace('year_', ''))

    updateSelectedButton(yearLevel)
    updateURL(yearLevel)
    fetchSchedules(yearLevel)
  })
})

function getYearLevelFromURL() {
  const params = new URLSearchParams(window.location.search)
  const yearLevel = params.get('yearLevel')

  if (yearLevel === null) {
    return undefined
  }

  const level = Number(yearLevel)

  if (Number.isInteger(level) && level >= 1 && level <= 4) {
    return level
  }

  return undefined
}

function updateSelectedButton(yearLevel) {
  scheduleButtons.forEach((button) => {
    const isSelected =
      yearLevel === undefined
        ? button.id === 'All'
        : button.id === `year_${yearLevel}`

    button.setAttribute('aria-pressed', String(isSelected))
  })
}

const initialYearLevel = getYearLevelFromURL()

updateSelectedButton(initialYearLevel)
fetchSchedules(initialYearLevel)

async function fetchSchedules(yearLevel) {
  const cacheKey = yearLevel ?? 'all'

  if (scheduleCache.has('all')) {
    const all = scheduleCache.get('all')

    const filtered =
      yearLevel !== undefined
        ? all.filter((s) => s.course.yearLevel === yearLevel)
        : all

    showSchedule(filtered)
    return
  }

  if (scheduleCache.has(cacheKey)) {
    showSchedule(scheduleCache.get(cacheKey))
    return
  }

  try {
    const scheduleDatas = await loadDatas(yearLevel)

    scheduleCache.set(cacheKey, scheduleDatas)

    showSchedule(scheduleDatas)
  } catch (error) {
    console.error(error)
    showErrorModal()
  }
}

function showSchedule(scheduleDatas) {
  scheduleBody.replaceChildren()

  if (!scheduleDatas || scheduleDatas.length === 0) {
    emptySchedule()
    return
  }

  const scheduleFragment = document.createDocumentFragment()
  scheduleDatas.forEach((data) => {
    const row = newRow(data)
    scheduleFragment.append(row)
  })
  scheduleBody.append(scheduleFragment)
}

function newRow(data) {
  const scheduleRow = document.createElement('tr')
  scheduleRow.dataset.testid = 'schedule-row'

  scheduleRow.append(
    createCell('code', data?.course.code),
    createCell('title', data?.course.title),
    createCell('type', data?.course.type),
    createCell('section', data?.section),
    createCell('group', data?.studentGroup),
    createCell('day', toCapitalize(data?.dayOfWeek)),
    createCell('time', `${data?.startTime}-${data?.endTime}`),
    createCell('weeks', `${data?.startWeek}-${data?.endWeek}`),
    createCell('remarks', data?.remarks)
  )
  return scheduleRow
}

function createCell(testId, value) {
  const cell = document.createElement('td')
  cell.dataset.testid = testId
  cell.textContent = value ?? ''
  return cell
}

function emptySchedule() {
  const emptyRow = document.createElement('tr')
  const emptyCell = document.createElement('td')
  emptyCell.colSpan = 9
  emptyCell.textContent =
    'There is currently no class schedule. Please check back later.'
  emptyCell.dataset.testid = 'empty-message'
  emptyRow.append(emptyCell)
  scheduleBody.append(emptyRow)
}

function toCapitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function showErrorModal() {
  if (modal && !modal.open) {
    modal.showModal()
  }
}
