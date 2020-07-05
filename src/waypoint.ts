import {Commit} from './commit'

type WaypointType = 'Start' | 'Middle' | 'End'

class Waypoint {
  commit: Commit
  duration: number
  type: WaypointType

  constructor(commit: Commit, duration: number, type: WaypointType) {
    this.commit = commit
    this.type = type
    this.duration = duration
  }
}

export default Waypoint
