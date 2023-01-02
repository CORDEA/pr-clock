export class Commit {
  createdAt: Date
  sha: string

  constructor(commit: any) {
    this.createdAt = new Date(commit.commit.committer.date)
    this.sha = commit.sha
  }
}
