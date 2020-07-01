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
      pull_number: context.issue.number
    })
    const dates =
      commits.data
        .map(commit => new Date(commit.commit.committer.date).getTime())
    let prevDate = null
    let totalDuration = 0
    for (let date of dates) {
      if (prevDate != null) {
        const duration = date - prevDate
        if (duration < ignoreMinTime) {
          totalDuration = duration
        }
      }
      prevDate = date
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
