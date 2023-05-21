import { observer } from 'mobx-react-lite'
import { Tab } from 'semantic-ui-react'
import { Profile } from '../../app/models/profile'
import ProfilePhotos from './profilePhotos'
import ProfileAbout from './profileAbout'
import ProfileFollowings from './profileFollowings'
import { useStore } from '../../app/stores/store'

interface Props {
  profile: Profile
}

export default observer(function ProfileContent({ profile }: Props) {
  const {profileStore} = useStore()
  const panes = [
    {
      menuItem: 'About',
      render: () => <ProfileAbout />,
    },
    {
      menuItem: 'Photos',
      render: () => <ProfilePhotos profile={profile} />,
    },
    {
      menuItem: 'Events',
      render: () => <Tab.Pane>Events Content</Tab.Pane>,
    },
    {
      menuItem: 'Followers',
      render: () => <ProfileFollowings/>,
    },
    {
      menuItem: 'Following',
      render: () => <ProfileFollowings />,
    },
  ]

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='right'
      panes={panes}
      onTabChange={(e, data) => {profileStore.setActiveTab(data.activeIndex)}}
    />
  )
})
