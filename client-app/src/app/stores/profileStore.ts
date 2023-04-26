import { makeAutoObservable, runInAction } from 'mobx'
import { Photo, Profile } from '../models/profile'
import agent from '../api/agent'
import { store } from './store'

export default class ProfileStore {
  profile: Profile | null = null
  loadingProfile: boolean = false
  uploadingPhoto: boolean = false
  loadingPhoto: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  get isCurrentUser() {
    if (store.userStore.user && this.profile) {
      return store.userStore.user.userName === this.profile.userName
    }
    return false
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true
    try {
      const profile = await agent.Profiles.get(username)
      runInAction(() => {
        this.profile = profile
        this.loadingProfile = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.loadingProfile = false
      })
    }
  }

  uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true
    try {
      const response = await agent.Profiles.uploadPhoto(file)
      const photo = response.data
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo)
          if (photo.isMain && store.userStore.user) {
            store.userStore.setImage(photo.url)
            this.profile.image = photo.url
          }
        }
        this.uploadingPhoto = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.uploadingPhoto = false
      })
    }
  }

  setMainPhoto = async (photo: Photo) => {
    this.loadingPhoto = true
    try {
      await agent.Profiles.setMainPhoto(photo.id)
      runInAction(() => {
        store.userStore.setImage(photo.url)
        if (this.profile && this.profile.photos) {
          this.profile.photos.find((p) => p.isMain)!.isMain = false
          this.profile.photos.find((p) => p.id === photo.id)!.isMain = true
          this.profile.image = photo.url
          store.activityStore.updateAttendeeImage(this.profile.userName, photo.url)
          this.loadingPhoto = false
        }
      })
    } catch (error) {
      console.log(error)
      runInAction(() => (this.loadingPhoto = false))
    }
  }

  deletePhoto = async (photo: Photo) => {
    this.loadingPhoto = true
    try {
      await agent.Profiles.deletePhoto(photo.id)
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos = this.profile.photos.filter((p) => p.id !== photo.id)
          this.loadingPhoto = false
        }
      })
    } catch (error) {
      console.log(error)
      this.loadingPhoto = false
    }
  }
}
