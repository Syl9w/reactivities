import { makeAutoObservable, runInAction } from 'mobx'
import { Activity } from '../models/activity'
import agent from '../api/agent'

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>()
  selectedActivity: Activity | undefined = undefined
  editMode = false
  loading = false
  loadingInitial = false

  constructor() {
    makeAutoObservable(this)
  }

  loadActivities = async () => {
    this.setLoadingInitial(true)
    try {
      const activities = await agent.Activities.list()
      activities.forEach((activity) => {
        this.setActivity(activity)
      })
      this.loadingInitial = false
    } catch (error) {
      console.log(error)
      this.loadingInitial = false
    }
  }

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id)
    if (activity) {
      this.selectedActivity = activity
      return activity
    } else {
      try {
        this.setLoadingInitial(true)
        activity = await agent.Activities.details(id)
        this.activityRegistry.set(activity.id, activity)
        runInAction(() => {
          this.selectedActivity = activity
        })
        this.setLoadingInitial(false)
        return activity
      } catch (error) {
        console.log(error)
        this.setLoadingInitial(false)
      }
    }
  }

  setActivity = (activity: Activity) => {
    activity.date = activity.date.split('T')[0]
    this.activityRegistry.set(activity.id, activity)
  }

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id)
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    )
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = activity.date
        activities[date] = activities[date] ? [...activities[date], activity] : [activity]
        return activities
      }, {} as { [key: string]: Activity[] })
    )
  }

  setLoadingInitial(state: boolean) {
    this.loadingInitial = state
  }

  createActivity = async (activity: Activity) => {
    this.loading = true
    try {
      await agent.Activities.create(activity)
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity)
        this.editMode = false
        this.selectedActivity = activity
        this.loading = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.loading = false
      })
    }
  }

  updateActivity = async (activity: Activity) => {
    this.loading = true
    try {
      await agent.Activities.update(activity)
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity)
        this.editMode = false
        this.selectedActivity = activity
        this.loading = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.loading = false
      })
    }
  }

  deleteActivity = async (id: string) => {
    this.loading = true
    try {
      await agent.Activities.delete(id)
      runInAction(() => {
        this.activityRegistry.delete(id)
        this.loading = false
      })
    } catch (error) {
      console.log(error)
      this.loading = false
    }
  }
}
