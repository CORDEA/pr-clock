import {Commit} from './commit'

class Waypoint {
  commit: Commit
  duration: number
  restEnd: boolean

  constructor(commit: Commit, duration: number, restEnd: boolean) {
    this.commit = commit
    this.duration = duration
    this.restEnd = restEnd
  }
}

export default Waypoint
