import * as core from '@actions/core'
import * as github from '@actions/github'
import {Commit} from './commit'
import {BodyBuilder} from './bodybuilder'

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
    const builder = new BodyBuilder(commits)
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
      if (builder.isBody(issue.body)) {
        ownIssue = issue
      }
    }

    const body = builder.build()
    console.log(`Body: ${body}`)

    if (ownIssue !== null) {
      console.log(`Update #${ownIssue.id} issue`)
      await client.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        comment_id: ownIssue.id,
        body: body
      })
      return
    }
    console.log('Create issue')
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

run()
