import * as core from '@actions/core'
import * as github from '@actions/github'
import {Commit} from './commit'

const ignoreMinTime = 7 * 60 * 60 * 1000
const title = 'Elapsed time: '

async function run(): Promise<void> {
  try {
    const client = github.getOctokit(core.getInput('github-token'))
    const context = github.context
    if (context.payload.action !== 'opened') {
      return
    }
    if (!context.payload.pull_request) {
      return
    }
    const rawCommits = await client.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: context.issue.number
    })
    const commits = rawCommits.data.map(commit => new Commit(commit))
    const waypoints = []
    let prevDate = null
    let totalDuration = 0
    let lastIndex = commits.length - 1
    for (let i = 0; i <= lastIndex; i++) {
      const commit = commits[i]
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
    const issues = await client.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issue.number
    })
    let ownIssue = null
    for (const issue of issues.data) {
      if (issue.user.login !== 'github-actions') {
        continue
      }
      if (issue.body.includes(title)) {
        ownIssue = issue
      }
    }
    const duration = calcRelativeDuration(totalDuration)

    let body = `${title}${duration}\n\n`
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i]
      if (i !== 0) {
        body += ' |\n'
      }
      body += `\`${waypoint.sha}\` ${waypoint.createdAt}\n`
    }

    if (ownIssue !== null) {
      await client.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        comment_id: ownIssue.id,
        body: body
      })
      return
    }
    await client.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issue.number,
      body: body
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

function calcRelativeDuration(duration: number): string {
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

run()
