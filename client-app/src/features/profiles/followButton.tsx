import { observer } from 'mobx-react-lite'
import { Profile } from '../../app/models/profile'
import { Reveal, Button } from 'semantic-ui-react'
import { useStore } from '../../app/stores/store'
import { SyntheticEvent } from 'react'

interface Props {
  profile: Profile
}

export default observer(function FollowButton({ profile }: Props) {
  const { profileStore, userStore } = useStore()
  const { updateFollowing, loadingFollowAction } = profileStore

  if (userStore.user?.userName === profile.userName) return null

  function handleFollow(e: SyntheticEvent, username: string) {
    e.preventDefault()
    profile.following ? updateFollowing(username, false) : updateFollowing(username, true)
  }

  return (
    <Reveal animated='move'>
      <Reveal.Content visible style={{ width: '100%' }}>
        <Button fluid color='teal' content={profile.following ? 'Following' : 'Not Following'} />
      </Reveal.Content>
      <Reveal.Content hidden style={{ width: '100%' }}>
        <Button
          fluid
          basic
          color={profile.following ? 'red' : 'green'}
          content={profile.following ? 'Unfollow' : 'Follow'}
          loading={loadingFollowAction}
          onClick={(e) => handleFollow(e, profile.userName)}
        />
      </Reveal.Content>
    </Reveal>
  )
})