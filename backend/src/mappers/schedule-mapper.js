export default class ScheduleMapper {
    static toSummaryDTO(schedule) {
        return {
            id: schedule.id,
            course: {
                id: schedule.course.id,
                code: schedule.course.code,
                title: schedule.course.title,
                type: schedule.course.type,
                yearLevel: schedule.course.yearLevel,
            },
            section: schedule.section,
            studentGroup: schedule.studentGroup,
            dayOfWeek: schedule.dayOfWeek,
            startTime: formatTime(schedule.startTime),
            endTime: formatTime(schedule.endTime),
            startWeek: schedule.startWeek,
            endWeek: schedule.endWeek,
            remarks: schedule.remarks,
        }
    }

    static toDetailDTO(schedule) {
        const { ...data } = schedule
        return data
    }

    static map(schedule, viewType) {
        if (viewType === 'summary') {
            return this.toSummaryDTO(schedule)
        }
        return this.toDetailDTO(schedule)
    }

    static maps(schedules, viewType) {
        if (viewType === 'full') {
            return schedules.map((schedule) => this.toDetailDTO(schedule))
        }
        return schedules.map((schedule) => this.toSummaryDTO(schedule))
    }
}

function formatTime(time) {
    return time.toISOString().slice(11, 16)
}
