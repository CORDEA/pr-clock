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
    const seconds = duration / 1000
    if (seconds < 60) {
      return `${seconds} seconds`
    }
    const minutes = seconds / 60
    if (minutes < 60) {
      return `${minutes} minutes ${seconds} seconds`
    }
    const hours = minutes / 60
    if (hours < 24) {
      return `${hours} hours ${minutes} minutes`
    }
    const days = hours / 24
    return `${days} days ${hours} hours`
  }
}
