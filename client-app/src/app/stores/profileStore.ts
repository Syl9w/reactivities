import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { Photo, Profile } from '../models/profile'
import agent from '../api/agent'
import { store } from './store'

export default class ProfileStore {
  profile: Profile | null = null
  loadingProfile = false
  uploadingPhoto = false
  loadingPhoto = false
  loadingFollowAction = false
  followings: Profile[] = []
  loadingFollowings = false
  activeTab = 0

  constructor() {
    makeAutoObservable(this)
    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? 'followers' : 'following'
          this.loadFollowings(predicate)
        } else {
          this.followings = []
        }
      }
    )
  }

  setActiveTab = (activeTab: any) => {
    this.activeTab = activeTab
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

  updateProfile = async (profile: Partial<Profile>) => {
    this.loadingPhoto = true
    try {
      await agent.Profiles.updateProfile(profile)
      runInAction(() => {
        if (profile.displayName && profile.displayName !== store.userStore.user?.displayName) {
          store.userStore.setDisplayName(profile.displayName)
        }
        this.profile = { ...this.profile, ...(profile as Profile) }
        this.loadingPhoto = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => (this.loadingPhoto = false))
    }
  }

  updateFollowing = async (username: string, following: boolean) => {
    this.loadingFollowAction = true
    try {
      await agent.Profiles.updateFollowing(username)
      store.activityStore.updateAttendeeFollowing(username)
      runInAction(() => {
        if (
          this.profile &&
          this.profile.userName !== store.userStore.user?.userName &&
          this.profile.userName === username
        ) {
          following ? this.profile.followersCount++ : this.profile.followersCount--
          this.profile.following = !this.profile.following
        }
        if(this.profile && this.profile.userName === store.userStore.user?.userName){
          following?this.profile.followingsCount++:this.profile.followingsCount--
        }
        this.followings.forEach((profile) => {
          if (profile.userName === username) {
            profile.following ? profile.followingsCount-- : profile.followingsCount++
            profile.following = !profile.following
          }
        })

        this.loadingFollowAction = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => (this.loadingFollowAction = false))
    }
  }

  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true
    try {
      const followings = await agent.Profiles.listFollowings(this.profile!.userName, predicate)
      runInAction(() => {
        this.followings = followings
        this.loadingFollowings = false
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.loadingFollowings = false
      })
    }
  }
}
