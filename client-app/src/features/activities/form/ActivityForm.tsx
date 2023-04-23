import { useEffect, useState } from 'react'
import { Button, Header, Segment } from 'semantic-ui-react'
import { useStore } from '../../../app/stores/store'
import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router'
import { ActivityFormValues } from '../../../app/models/activity'
import LoadingComponent from '../../../app/layout/LoadingComponent'
import { v4 as uuid } from 'uuid'
import { Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import CustomTextInput from '../../../app/common/form/CustomTextInput'
import CustomTextArea from '../../../app/common/form/CustomTextArea'
import CustomSelectInput from '../../../app/common/form/CustomSelectInput'
import { categoryOptions } from '../../../app/common/options/categoryOptions'
import CustomDateInput from '../../../app/common/form/CustomDateInput'

export default observer(function ActivityForm() {
  const { id } = useParams()
  const { activityStore } = useStore()
  const { createActivity, updateActivity, loadActivity, loadingInitial } = activityStore

  const navigate = useNavigate()

  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues())

  const activitySchema = Yup.object().shape({
    title: Yup.string().required('The activity title is required'),
    description: Yup.string().required('The activity description is required'),
    category: Yup.string().required('The activity category is required'),
    date: Yup.string().required('The activity date is required'),
    venue: Yup.string().required('The activity venue is required'),
    city: Yup.string().required('The activity city is required'),
  })

  useEffect(() => {
    if (id) loadActivity(id).then((activity) => setActivity(new ActivityFormValues(activity)))
  }, [id, loadActivity])

  function handleFormSubmit(activity: ActivityFormValues) {
    if (activity.id) updateActivity(activity).then(() => navigate(`/activities/${activity.id}`))
    else {
      activity.id = uuid()
      createActivity(activity).then(() => navigate(`/activities/${activity.id}`))
    }
  }

  if (loadingInitial) return <LoadingComponent content='Loading an activity...' />

  return (
    <Segment clearing>
      <Header content='Activity Details' sub color='teal' />
      <Formik
        enableReinitialize
        initialValues={activity}
        onSubmit={values => handleFormSubmit(values)}
        validationSchema={activitySchema}
      >
        {({ handleSubmit, isValid, isSubmitting, dirty }) => (
          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
            <CustomTextInput name={'title'} placeholder='Titile' />
            <CustomTextArea rows={4} placeholder='Description' name='description' />
            <CustomSelectInput options={categoryOptions} placeholder='Category' name='category' />
            <CustomDateInput
              placeholderText='Date'
              name='date'
              showTimeSelect
              timeCaption='time'
              dateFormat='MMMM dd, yyyy hh:mm aa'
            />

            <Header content='Location Details' sub color='teal' />

            <CustomTextInput placeholder='City' name='city' />
            <CustomTextInput placeholder='Venue' name='venue' />
            <Button
              disabled={isSubmitting || !isValid || !dirty}
              loading={isSubmitting}
              floated='right'
              positive
              type='submit'
              content='Submit'
            />
            <Button
              as={Link}
              to={`/activities/${activity.id}`}
              floated='right'
              type='button'
              content='Cancel'
            />
          </Form>
        )}
      </Formik>
    </Segment>
  )
})
