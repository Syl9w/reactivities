import React, { useEffect } from 'react'
import { Grid } from 'semantic-ui-react'
import { UseStore } from '../../../app/stores/store'
import LoadingComponent from '../../../app/layout/LoadingComponent'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import ActivityDetailedHeader from './ActivityDetailedHeader'
import ActivityDetailedSidebar from './ActivityDetailedSidebar'
import ActivityDetailedInfo from './ActivityDetailedInfo'
import ActivityDetailedChat from './ActivityDetailedChat'

export default observer(function ActivityDetails() {
  const { activityStore } = UseStore()
  const {
    selectedActivity: activity,
    loadActivity,
    loadingInitial,
  } = activityStore
  const { id } = useParams()

  useEffect(() => {
    if (id) loadActivity(id)
  }, [id, loadActivity])

  if (loadingInitial || !activity) return <LoadingComponent />

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={activity}/>
        <ActivityDetailedInfo activity={activity}/>
        <ActivityDetailedChat/>
      </Grid.Column>
      <Grid.Column width={4}>
        <ActivityDetailedSidebar/>
      </Grid.Column>
    </Grid>
  )
})