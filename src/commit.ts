import * as types from '@octokit/types'

export type CommitResponse =
  types.Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/commits']['response']['data'][0]

export class Commit {
  createdAt: Date
  sha: string

  constructor(commit: CommitResponse) {
    this.createdAt = new Date(commit.commit.committer?.date ?? 0)
    this.sha = commit.sha
  }
}
