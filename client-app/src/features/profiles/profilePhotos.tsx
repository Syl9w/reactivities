import { observer } from 'mobx-react-lite'
import { Button, Card, Grid, Header, Image, Tab } from 'semantic-ui-react'
import { Photo, Profile } from '../../app/models/profile'
import { useStore } from '../../app/stores/store'
import { MouseEvent, SyntheticEvent, useState } from 'react'
import PhotoUploadWidget from '../../app/common/photoUpload/photoUploadWidget'

interface Props {
  profile: Profile
}

export default observer(function ProfilePhotos({ profile }: Props) {
  const {
    profileStore: {
      isCurrentUser,
      uploadPhoto,
      uploadingPhoto,
      setMainPhoto,
      loadingPhoto,
      deletePhoto,
    },
  } = useStore()
  const [addPhotoMode, setAddPhotoMode] = useState(false)
  const [target, setTarget] = useState('')

  function handlePhotoUpload(file: Blob) {
    uploadPhoto(file).then(() => setAddPhotoMode(false))
  }

  function handleSetMainPhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
    setTarget(e.currentTarget.name)
    setMainPhoto(photo)
  }

  function handledeletePhoto(photo: Photo, e: MouseEvent<HTMLButtonElement>) {
    setTarget(e.currentTarget.name)
    deletePhoto(photo)
  }

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header floated='left' icon={'image'} content='Photos' />
          {isCurrentUser && (
            <Button
              floated='right'
              basic
              content={addPhotoMode ? 'Cancel' : 'Add photo'}
              onClick={() => setAddPhotoMode(!addPhotoMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {addPhotoMode ? (
            <PhotoUploadWidget uploadingPhoto={uploadingPhoto} uploadPhoto={handlePhotoUpload} />
          ) : (
            <Card.Group itemsPerRow={5}>
              {profile.photos?.map((photo) => (
                <Card key={photo.id}>
                  <Image src={photo.url} />
                  {isCurrentUser && (
                    <Button.Group fluid widths={2}>
                      <Button
                        basic
                        color='green'
                        content='main'
                        name={'main'+photo.id}
                        disabled={photo.isMain}
                        loading={target === 'main'+photo.id && loadingPhoto}
                        onClick={(e) => handleSetMainPhoto(photo, e)}
                      />
                      <Button
                        basic
                        color='red'
                        icon='trash'
                        name={photo.id}
                        disabled={photo.isMain}
                        loading={target === photo.id && loadingPhoto}
                        onClick={(e) => handledeletePhoto(photo, e)}
                      />
                    </Button.Group>
                  )}
                </Card>
              ))}
            </Card.Group>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  )
})
