import * as core from '@actions/core'
import * as github from '@actions/github'
import {Commit, CommitResponse} from './commit'
import {BodyBuilder} from './bodybuilder'

async function run(): Promise<void> {
  const client = github.getOctokit(core.getInput('github-token'))
  const context = github.context
  const action = context.payload.action
  if (action !== 'opened' && action !== 'edited' && action !== 'synchronize') {
    core.debug(`This is unsupported action: ${action}`)
    return
  }
  if (!context.payload.pull_request) {
    core.debug('This is not PR')
    return
  }
  core.debug('Starting...')
  const rawCommits = await client.rest.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  })
  const commits = rawCommits.data.map(
    (commit: CommitResponse) => new Commit(commit)
  )
  const builder = new BodyBuilder(commits)
  let comments = null
  try {
    comments = await client.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number
    })
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
  if (comments === null) {
    return
  }
  core.debug(`Number of comments: ${comments.data.length}`)
  let ownComment = null
  for (const comment of comments.data) {
    if (comment?.user?.login !== 'github-actions') {
      continue
    }
    if (builder.isBody(comment?.body ?? '')) {
      ownComment = comment
    }
  }

  const body = builder.build()
  core.debug(`Body: ${body}`)

  if (ownComment !== null) {
    core.debug(`Update comment`)
    try {
      await client.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: ownComment.id,
        body
      })
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
      return
    }
    core.debug('Create comment')
  }
  try {
    await client.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body
    })
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
