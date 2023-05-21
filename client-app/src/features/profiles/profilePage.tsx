import { observer } from 'mobx-react-lite'
import ProfileHeader from './profileHeader'
import { Grid } from 'semantic-ui-react'
import ProfileContent from './profileContent'
import { useStore } from '../../app/stores/store'
import { useParams } from 'react-router'
import { useEffect } from 'react'
import LoadingComponent from '../../app/layout/LoadingComponent'

export default observer(function ProfilePage() {
  const { profileStore } = useStore()
  const { username } = useParams<{ username: string }>()

  useEffect(() => {
    profileStore.loadProfile(username!)
    return () => {
      profileStore.setActiveTab(0)
    }
  }, [username, profileStore])

  if (profileStore.loadingProfile) return <LoadingComponent content='Loading a profile...' />

  return (
    <Grid>
      <Grid.Column width={16}>
        {profileStore.profile && (
          <>
            <ProfileHeader profile={profileStore.profile} />
            <ProfileContent profile={profileStore.profile} />
          </>
        )}
      </Grid.Column>
    </Grid>
  )
})
