import React, { ChangeEvent, useEffect, useState } from 'react'
import { Button, Form, Segment } from 'semantic-ui-react'
import { useStore } from '../../../app/stores/store'
import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router'
import { Activity } from '../../../app/models/activity'
import LoadingComponent from '../../../app/layout/LoadingComponent'
import { v4 as uuid } from 'uuid'
import { Link } from 'react-router-dom'

export default observer(function ActivityForm() {
  const { id } = useParams()
  const { activityStore } = useStore()
  const { loading, createActivity, updateActivity, loadActivity, loadingInitial } = activityStore

  const navigate = useNavigate()

  const [activity, setActivity] = useState<Activity>({
    id: '',
    title: '',
    category: '',
    description: '',
    date: '',
    city: '',
    venue: '',
  })

  useEffect(() => {
    if (id) loadActivity(id).then((activity) => setActivity(activity!))
  }, [id, loadActivity])

  function handleSubmit() {
    if (activity.id) updateActivity(activity).then(()=>navigate(`/activities/${activity.id}`))
    else {
      activity.id = uuid()
      createActivity(activity).then(()=>navigate(`/activities/${activity.id}`))
    }
  }

  function handleInputOnChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setActivity({ ...activity, [name]: value })
  }

  if (loadingInitial) return <LoadingComponent content="Loading an activity..." />

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Form.Input
          placeholder="Title"
          value={activity.title}
          name="title"
          onChange={handleInputOnChange}
        />
        <Form.TextArea
          placeholder="Description"
          value={activity.description}
          name="description"
          onChange={handleInputOnChange}
        />
        <Form.Input
          placeholder="Category"
          value={activity.category}
          name="category"
          onChange={handleInputOnChange}
        />
        <Form.Input
          type="date"
          placeholder="Date"
          value={activity.date}
          name="date"
          onChange={handleInputOnChange}
        />
        <Form.Input
          placeholder="City"
          value={activity.city}
          name="city"
          onChange={handleInputOnChange}
        />
        <Form.Input
          placeholder="Venue"
          value={activity.venue}
          name="venue"
          onChange={handleInputOnChange}
        />
        <Button
          loading={loading}
          onClick={handleSubmit}
          floated="right"
          positive
          type="submit"
          content="Submit"
        />
        <Button as={Link} to={`/activities/${activity.id}`} floated="right" type="button" content="Cancel" />
      </Form>
    </Segment>
  )
})
