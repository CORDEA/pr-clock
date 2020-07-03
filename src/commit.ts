import * as types from '@octokit/types'

export class Commit {
  createdAt: Date

  constructor(commit: types.PullsListCommitsResponseData[0]) {
    this.createdAt = new Date(commit.commit.committer.date)
  }
}
