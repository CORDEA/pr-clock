import {Commit} from './commit'

const ignoreMinTime = 7 * 60 * 60 * 1000
const title = 'Elapsed time: '

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
    let prevDate = null
    let totalDuration = 0
    let lastIndex = this.commits.length - 1
    for (let i = 0; i <= lastIndex; i++) {
      const commit = this.commits[i]
      if (i === 0 || i === lastIndex) {
        waypoints.push(commit)
      }
      if (prevDate != null) {
        const duration = commit.createdAt.getTime() - prevDate.getTime()
        if (duration < ignoreMinTime) {
          totalDuration = duration
        } else {
          if (i !== 0 && i !== lastIndex) {
            waypoints.push(commit)
          }
        }
      }
      prevDate = commit.createdAt
    }

    const duration = BodyBuilder.calcRelativeDuration(totalDuration)
    let body = `${title}${duration}\n\n`
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i]
      if (i !== 0) {
        body += ' |\n'
      }
      body += `\`${waypoint.sha}\` ${waypoint.createdAt}\n`
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
}
