export default class ScheduleMapper {
    static toGuessDTO(schedule) {
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

    static toYearWithGDTO(schedule, counts) {
        let fix = true
        const key = `${schedule.section}:${schedule.studentGroup}`
        const countedSection = counts[key] ?? 0
        if (schedule.course.type === "ELECTIVE" || countedSection > 2) fix = false
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
            room: schedule.room,
            fixed: fix
        }
    }

    static toDetailDTO(schedule) {
        const { ...data } = schedule
        return data
    }

    static map(schedule, viewType) {
        if (viewType === 'summary') {
            return this.toGuessDTO(schedule)
        }
        return this.toDetailDTO(schedule)
    }

    static maps(schedules, viewType, counts) {
        if (viewType === 'yearlevelWithg') {
            return schedules.map((schedule) => this.toYearWithGDTO(schedule, counts))
        }
        return schedules.map((schedule) => this.toGuessDTO(schedule))
    }
}

function formatTime(time) {
    return time.toISOString().slice(11, 16)
}
