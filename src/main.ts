import * as core from '@actions/core'
import * as github from '@actions/github'

const ignoreMinTime = 7 * 60 * 60 * 1000

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
    const commits = await client.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: context.issue.number
    })
    const dates = commits.data.map(commit =>
      new Date(commit.commit.committer.date).getTime()
    )
    let prevDate = null
    let totalDuration = 0
    for (const date of dates) {
      if (prevDate != null) {
        const duration = date - prevDate
        if (duration < ignoreMinTime) {
          totalDuration = duration
        }
      }
      prevDate = date
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
      if (issue.body.includes('')) {
        ownIssue = issue
      }
    }
    const duration = calcRelativeDuration(totalDuration)
    if (ownIssue !== null) {
      await client.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        comment_id: ownIssue.id,
        body: duration
      })
      return
    }
    await client.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issue.number,
      body: duration
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
