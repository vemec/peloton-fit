import { useMedia } from './MediaManager'
import MediaBar from './MediaBar'
import MediaViewer from './MediaViewer'

export default function MediaBarContainer() {
  const {
    media,
    downloadMedia,
    deleteMedia,
    openMediaViewer,
    closeMediaViewer,
    selectedMedia,
    isMediaViewerOpen
  } = useMedia()

  return (
    <>
      {/* Media bar - only shows when there are media items */}
      <MediaBar
        media={media}
        onDownload={downloadMedia}
        onDelete={deleteMedia}
        onSelect={openMediaViewer}
      />

      {/* Media viewer - full screen overlay */}
      {isMediaViewerOpen && selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={closeMediaViewer}
        />
      )}
    </>
  )
}
