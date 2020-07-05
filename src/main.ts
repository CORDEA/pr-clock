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
      core.debug('This is not PR')
      return
    }
    core.debug('Starting...')
    const rawCommits = await client.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: context.issue.number
    })
    const commits = rawCommits.data.map(commit => new Commit(commit))
    const builder = new BodyBuilder(commits)
    const comments = await client.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issue.number
    })
    core.debug(`Number of comments: ${comments.data.length}`)
    let ownComment = null
    for (const comment of comments.data) {
      if (comment.user.login !== 'github-actions') {
        continue
      }
      if (builder.isBody(comment.body)) {
        ownComment = comment
      }
    }

    const body = builder.build()
    core.debug(`Body: ${body}`)

    if (ownComment !== null) {
      core.debug(`Update comment`)
      await client.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        comment_id: ownComment.id,
        body
      })
      return
    }
    core.debug('Create comment')
    await client.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issue.number,
      body
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
