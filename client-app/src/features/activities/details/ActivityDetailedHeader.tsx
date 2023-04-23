import { observer } from 'mobx-react-lite'
import React from 'react'
import { Button, Header, Item, Segment, Image, Label } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useStore } from '../../../app/stores/store'

const activityImageStyle = {
  filter: 'brightness(30%)',
}

const activityImageTextStyle = {
  position: 'absolute',
  bottom: '5%',
  left: '5%',
  width: '100%',
  height: 'auto',
  color: 'white',
}

interface Props {
  activity: Activity
}

export default observer(function ActivityDetailedHeader({ activity }: Props) {
  const {
    activityStore: { updateAttendance, updateCancelation, loading },
  } = useStore()
  return (
    <Segment.Group>
      <Segment basic attached='top' style={{ padding: '0' }}>
        {activity.isCancelled && (
          <Label
            style={{ position: 'absolute', zIndex: 1000, left: -14, top: 20 }}
            ribbon
            color='red'
            content='Cancelled'
          />
        )}
        <Image
          src={`/assets/categoryImages/${activity.category}.jpg`}
          fluid
          style={activityImageStyle}
        />
        <Segment style={activityImageTextStyle} basic>
          <Item.Group>
            <Item>
              <Item.Content>
                <Header size='huge' content={activity.title} style={{ color: 'white' }} />
                <p>{format(activity.date!, 'dd MMM yyyy hh:mm aa')}</p>
                <p>
                  Hosted by{' '}
                  <strong>
                    <Link to={`/profiles/${activity.host?.userName}`}>
                      {activity.host?.displayName}
                    </Link>
                  </strong>
                </p>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
      </Segment>
      <Segment clearing attached='bottom'>
        {!activity.isGoing && !activity.isHost && (
          <Button
            disabled={activity.isCancelled}
            color='teal'
            onClick={updateAttendance}
            loading={loading}
          >
            Join Activity
          </Button>
        )}
        {activity.isGoing && !activity.isHost && (
          <Button onClick={updateAttendance} loading={loading}>
            Cancel attendance
          </Button>
        )}
        {activity.isHost && (
          <>
            <Button
              color={activity.isCancelled ? 'green' : 'red'}
              floated='left'
              basic
              content={activity.isCancelled ? 'Reactivate activity' : 'Cancel activity'}
              onClick={updateCancelation}
              loading={loading}
            />
            <Button
              disabled={activity.isCancelled}
              as={Link}
              to={`/manage/${activity.id}`}
              color='orange'
              floated='right'
            >
              Manage Event
            </Button>
          </>
        )}
      </Segment>
    </Segment.Group>
  )
})
