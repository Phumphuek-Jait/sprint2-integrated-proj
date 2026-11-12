import { getItems } from '../utils/fetchUtils.js'

const apiURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/year-levels'

function loadCourseSchedules(yearLevel, studentGroup) {
  const url = `${apiURL}/${encodeURIComponent(yearLevel)}/schedules?studentGroup=${encodeURIComponent(studentGroup)}`
  return getItems(url)
}

export { loadCourseSchedules }
