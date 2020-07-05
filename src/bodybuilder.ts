import {Commit} from './commit'
import Waypoint from './waypoint'

const ignoreMinTime = 7 * 60 * 60 * 1000
const title = '### Elapsed time'

export class BodyBuilder {
  private readonly commits: Commit[]

  constructor(commits: Commit[]) {
    this.commits = commits
  }

  isBody(string: string): boolean {
    return string.includes(title)
  }

  build(): string {
    const waypoints = []
    let prevCommit = null
    let totalDuration = 0
    let lastIndex = this.commits.length - 1
    for (let i = 0; i <= lastIndex; i++) {
      const commit = this.commits[i]
      if (prevCommit != null) {
        const duration =
          commit.createdAt.getTime() - prevCommit.createdAt.getTime()
        const ignore = duration >= ignoreMinTime
        if (!ignore) {
          totalDuration += duration
        }
        if (i === 1) {
          waypoints.push(
            new Waypoint(prevCommit, duration, false)
          )
        } else {
          if (ignore) {
            waypoints.push(
              new Waypoint(prevCommit, duration, false)
            )
          }
        }
        if (i === lastIndex) {
          waypoints.push(
            new Waypoint(commit, duration, ignore)
          )
        } else {
          if (ignore) {
            waypoints.push(
              new Waypoint(commit, duration, true)
            )
          }
        }
      }
      prevCommit = commit
    }

    const formattedTotalDuration =
      BodyBuilder.calcRelativeDuration(totalDuration)
    let body = `${title}\n${formattedTotalDuration}\n\n###Timeline\n`
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i]
      if (i !== 0) {
        if (waypoint.restEnd) {
          const formattedDuration =
            BodyBuilder.calcRelativeDuration(waypoint.duration)
          body += '&nbsp;&nbsp;:arrow_double_down:&nbsp;&nbsp;' +
            `${formattedDuration} (Ignored from total duration)`
        } else {
          body += '&nbsp;&nbsp;:arrow_down_small:'
        }
        body += '\n'
      }
      body += `${waypoint.commit.sha} at ` +
        `${BodyBuilder.formatDate(waypoint.commit.createdAt)}\n`
    }
    return body
  }

  private static calcRelativeDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000)
    if (seconds < 60) {
      return `${seconds} seconds`
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      const diff = seconds % 60
      if (diff > 0) {
        return `${minutes} minutes ${diff} seconds`
      }
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      const diff = minutes % 60
      if (diff > 0) {
        return `${hours} hours ${diff} minutes`
      }
      return `${hours} hours`
    }
    const days = Math.floor(hours / 24)
    const diff = hours % 24
    if (diff > 0) {
      return `${days} days ${diff} hours`
    }
    return `${days} days`
  }

  private static formatDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ` +
      `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:` +
      `${date.getSeconds().toString().padStart(2, '0')}`
  }
}
