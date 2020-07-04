import * as types from '@octokit/types'

export class Commit {
  createdAt: Date
  sha: string

  constructor(commit: types.PullsListCommitsResponseData[0]) {
    this.createdAt = new Date(commit.commit.committer.date)
    this.sha = commit.sha
  }
}
