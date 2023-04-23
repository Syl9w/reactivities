import React from 'react'
import { Item, Segment, ItemImage, Icon, Button, Label } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ActivityListItemAttendee from './ActivityListItemAttendee'

interface Props {
  activity: Activity
}

export default function ActivityListItem({ activity }: Props) {
  return (
    <Segment.Group>
      <Segment>
        {activity.isCancelled && (
          <Label
            style={{ position: 'absolute', zIndex: 1000, left: -14, top: 20 }}
            ribbon
            color='red'
            content='Cancelled'
          />
        )}
        <Item.Group>
          <Item>
            <ItemImage size='tiny' circular src='/assets/user.png' />
            <Item.Content>
              <Item.Header as={Link} to={`/activities/${activity.id}`}>
                {activity.title}
              </Item.Header>
              <Item.Description>Hosted by {activity.host?.displayName}</Item.Description>
              {activity.isHost && (
                <Item.Description>
                  <Label basic color='orange' content='You are hosting this activity' />
                </Item.Description>
              )}
              {activity.isGoing && !activity.isHost && (
                <Item.Description>
                  <Label basic color='green' content='You are going to this activity' />
                </Item.Description>
              )}
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <Segment>
        <span>
          <Icon name='clock' /> {format(activity.date!, 'dd MMM yyyy hh:mm aa')}
          <Icon name='marker' /> {activity.venue}
        </span>
      </Segment>
      <Segment secondary>
        <ActivityListItemAttendee attendees={activity.attendees!} />
      </Segment>
      <Segment clearing>
        <span>{activity.description}</span>
        <Button
          as={Link}
          to={`/activities/${activity.id}`}
          content='View'
          color='teal'
          floated='right'
        />
      </Segment>
    </Segment.Group>
  )
}
