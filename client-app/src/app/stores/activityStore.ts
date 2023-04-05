import { makeAutoObservable, runInAction } from 'mobx'
import { Activity } from '../models/activity'
import agent from '../api/agent'
import { v4 as uuid } from 'uuid'

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>()
  selectedActivity: Activity | undefined = undefined
  editMode = false
  loading = false
  loadingInitial = true

  constructor() {
    makeAutoObservable(this)
  }

  loadActivities = async () => {
    try {
      const activities = await agent.Activities.list()
      activities.forEach((activity) => {
        activity.date = activity.date.split('T')[0]
        this.activityRegistry.set(activity.id, activity)
      })
      this.loadingInitial = false
    } catch (error) {
      console.log(error)
      this.loadingInitial = false
    }
  }

  get sortActivitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    )
  }

  setLoadingInitial(state: boolean) {
    this.loadingInitial = state
  }

  selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id)
  }

  cancelSelectedActivity = () => {
    this.selectedActivity = undefined
  }

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.cancelSelectedActivity()
    this.editMode = true
  }
  closeForm = () => {
    this.editMode = false
  }

  createActivity = async (activity: Activity) => {
    this.loading = true
    activity.id = uuid()
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
        this.editMode = false
        this.loading = false
        this.selectedActivity =
          this.selectedActivity?.id === id ? undefined : this.selectedActivity
      })
    } catch (error) {
      console.log(error)
      this.loading = false
    }
  }
}
