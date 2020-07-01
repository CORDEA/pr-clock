import * as core from '@actions/core'
import * as github from '@actions/github'

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
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
