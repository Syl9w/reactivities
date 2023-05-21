import axios, { AxiosError, AxiosResponse } from 'axios'
import { Activity, ActivityFormValues } from '../models/activity'
import { toast } from 'react-toastify'
import { router } from '../router/Routes'
import { store } from '../stores/store'
import { User, UserFormValues } from '../models/user'
import { Photo, Profile } from '../models/profile'

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

axios.defaults.baseURL = 'http://localhost:5000/api'

axios.interceptors.request.use((config) => {
  const token = store.commonStore.token
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  async (response) => {
    await sleep(500)
    return response
  },
  (error: AxiosError) => {
    const { data, status, config } = error.response as AxiosResponse
    switch (status) {
      case 400:
        if ((config.method = 'get' && data.errors.hasOwnProperty('id'))) {
          router.navigate('/not-found')
        }
        if (data.errors) {
          const modalStateErrors = []
          for (const key in data.errors) {
            if (data.errors[key]) modalStateErrors.push(data.errors[key])
          }
          throw modalStateErrors.flat()
        } else {
          toast.error(data)
        }
        break
      case 401:
        toast.error('Unauthorized')
        break
      case 403:
        toast.error('Forbidden')
        break
      case 404:
        router.navigate('/not-found')
        break
      case 500:
        store.commonStore.setServerError(data)
        router.navigate('/server-error')
        break
      default:
        break
    }
    return Promise.reject(error)
  }
)

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const request = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
  list: () => request.get<Activity[]>('/activities'),
  details: (id: string) => request.get<Activity>(`/activities/${id}`),
  create: (activity: ActivityFormValues) => request.post<void>('/activities', activity),
  update: (activity: ActivityFormValues) =>
    request.put<void>(`/activities/${activity.id}`, activity),
  delete: (id: string) => request.del<void>(`/activities/${id}`),
  attend: (id: string) => request.post<void>(`/activities/${id}/attend`, {}),
}

const Account = {
  current: () => request.get<User>('/account'),
  login: (user: UserFormValues) => request.post<User>('/account/login', user),
  register: (user: UserFormValues) => request.post<User>('/account/register', user),
}

const Profiles = {
  get: (username: string) => request.get<Profile>(`/profiles/${username}`),
  uploadPhoto: (file: any) => {
    let formData = new FormData()
    formData.append('File', file)
    return axios.post<Photo>('photos', formData, {
      headers: {
        'Content-Type': 'multypart/form-data',
      },
    })
  },
  setMainPhoto: (id: string) => request.put<void>(`/photos/${id}/setmain`, {}),
  deletePhoto: (id: string) => request.del<void>(`/photos/${id}`),
  updateProfile: (profile: Partial<Profile>) => request.put(`/profiles`, profile),
  updateFollowing: (username: string) => request.post<void>(`/follow/${username}`, {}),
  listFollowings: (username: string, predicate: string) =>
    request.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
}
const agent = {
  Activities,
  Account,
  Profiles,
}

export default agent
