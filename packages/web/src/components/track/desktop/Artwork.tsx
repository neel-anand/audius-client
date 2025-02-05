import { memo } from 'react'

import {
  ID,
  SquareSizes,
  CoverArtSizes,
  useLoadImageWithTimeout,
  FeatureFlags
} from '@audius/common'
import {
  PbIconPlay as IconPlay,
  PbIconPause as IconPause,
  IconLock
} from '@audius/stems'
import cn from 'classnames'
import Lottie from 'react-lottie'

import loadingSpinner from 'assets/animations/loadingSpinner.json'
import CoSign from 'components/co-sign/CoSign'
import { Size } from 'components/co-sign/types'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { useFlag } from 'hooks/useRemoteConfig'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'

import styles from './Artwork.module.css'

enum PlayStatus {
  Buffering = 'Buffering',
  Playing = 'Playing',
  Paused = 'Paused'
}

type TileArtworkProps = {
  id: ID
  coverArtSizes: CoverArtSizes
  size: any
  isBuffering: boolean
  isPlaying: boolean
  showArtworkIcon: boolean
  showSkeleton: boolean
  artworkIconClassName?: string
  coSign?: {
    has_remix_author_saved: boolean
    has_remix_author_reposted: boolean
    user: { name: string; is_verified: boolean; user_id: ID }
  }
  callback: () => void
  doesUserHaveAccess?: boolean
}

const ArtworkIcon = ({
  playStatus,
  artworkIconClassName,
  doesUserHaveAccess,
  isTrack
}: {
  playStatus: PlayStatus
  artworkIconClassName?: string
  doesUserHaveAccess?: boolean
  isTrack?: boolean
}) => {
  const { isEnabled: isGatedContentEnabled } = useFlag(
    FeatureFlags.GATED_CONTENT_ENABLED
  )

  let artworkIcon
  if (isGatedContentEnabled && isTrack && !doesUserHaveAccess) {
    artworkIcon = <IconLock />
  } else if (playStatus === PlayStatus.Buffering) {
    artworkIcon = (
      <div className={styles.loadingAnimation}>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingSpinner
          }}
        />
      </div>
    )
  } else if (playStatus === PlayStatus.Playing) {
    artworkIcon = <IconPause />
  } else {
    artworkIcon = <IconPlay />
  }
  return (
    <div
      className={cn(styles.artworkIcon, {
        [artworkIconClassName!]: !!artworkIconClassName
      })}
    >
      {artworkIcon}
    </div>
  )
}

type ArtworkProps = TileArtworkProps & {
  image: any
  label?: string
  isTrack?: boolean
}

const Artwork = memo(
  ({
    size,
    showSkeleton,
    showArtworkIcon,
    artworkIconClassName,
    isBuffering,
    isPlaying,
    image,
    coSign,
    label,
    doesUserHaveAccess,
    isTrack
  }: ArtworkProps) => {
    const playStatus = isBuffering
      ? PlayStatus.Buffering
      : isPlaying
      ? PlayStatus.Playing
      : PlayStatus.Paused
    const imageElement = (
      <DynamicImage
        wrapperClassName={cn(styles.artworkWrapper, {
          [styles.artworkInset]: !coSign,
          [styles.small]: size === 'small',
          [styles.large]: size === 'large'
        })}
        className={styles.artwork}
        image={showSkeleton ? '' : image}
        aria-label={label}
      >
        {showArtworkIcon && (
          <ArtworkIcon
            playStatus={playStatus}
            artworkIconClassName={artworkIconClassName}
            doesUserHaveAccess={doesUserHaveAccess}
            isTrack={isTrack}
          />
        )}
      </DynamicImage>
    )
    return coSign ? (
      <CoSign
        size={Size.MEDIUM}
        hasFavorited={coSign.has_remix_author_saved}
        hasReposted={coSign.has_remix_author_reposted}
        coSignName={coSign.user.name}
        userId={coSign.user?.user_id ?? 0}
        className={cn(styles.artworkInset, {
          [styles.small]: size === 'small',
          [styles.large]: size === 'large'
        })}
      >
        {imageElement}
      </CoSign>
    ) : (
      imageElement
    )
  }
)

export const TrackArtwork = memo((props: TileArtworkProps) => {
  const { callback } = props
  const image = useTrackCoverArt(
    props.id,
    props.coverArtSizes,
    SquareSizes.SIZE_150_BY_150,
    ''
  )

  useLoadImageWithTimeout(image, callback)

  return <Artwork {...props} image={image} isTrack />
})

export const CollectionArtwork = memo((props: TileArtworkProps) => {
  const { callback } = props
  const image = useCollectionCoverArt(
    props.id,
    props.coverArtSizes,
    SquareSizes.SIZE_150_BY_150
  )

  useLoadImageWithTimeout(image, callback)

  return <Artwork {...props} image={image} />
})
