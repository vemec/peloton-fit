import { usePhotos } from './PhotoManager'
import PhotoBar from './PhotoBar'
import PhotoViewer from './PhotoViewer'

export default function PhotoBarContainer() {
  const {
    photos,
    downloadPhoto,
    deletePhoto,
    openPhotoViewer,
    closePhotoViewer,
    selectedPhoto,
    isPhotoViewerOpen
  } = usePhotos()

  return (
    <>
      {/* Photo bar - only shows when there are photos */}
      <PhotoBar
        photos={photos}
        onDownload={downloadPhoto}
        onDelete={deletePhoto}
        onSelect={openPhotoViewer}
      />

      {/* Photo viewer - full screen overlay */}
      {isPhotoViewerOpen && selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          onClose={closePhotoViewer}
        />
      )}
    </>
  )
}
