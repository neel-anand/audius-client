import { ChangeEvent, useMemo } from 'react'

import {
  ID,
  Collection,
  SmartCollection,
  Variant,
  Status,
  User,
  CollectionTrack,
  CollectionPageTrackRecord,
  CollectionsPageType
} from '@audius/common'

import {
  CollectiblesPlaylistTableColumn,
  CollectiblesPlaylistTable
} from 'components/collectibles-playlist-table/CollectiblesPlaylistTable'
import CollectionHeader from 'components/collection/desktop/CollectionHeader'
import Page from 'components/page/Page'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'
import { computeCollectionMetadataProps } from 'pages/collection-page/store/utils'

import styles from './CollectionPage.module.css'

const messages = {
  emptyPage: {
    owner:
      'Find a track you want to add and click the ••• button to add it to your playlist',
    visitor: 'This Playlist is Empty...'
  },
  type: {
    playlist: 'Playlist',
    album: 'Album'
  },
  remove: 'Remove from this'
}

const EmptyPage = (props: { text?: string | null; isOwner: boolean }) => {
  const text =
    props.text ||
    (props.isOwner ? messages.emptyPage.owner : messages.emptyPage.visitor)
  return (
    <div className={styles.emptyWrapper}>
      <div>{text}</div>
    </div>
  )
}

export type CollectionPageProps = {
  title: string
  description: string
  canonicalUrl: string
  structuredData?: Object
  playlistId: ID
  playing: boolean
  getPlayingUid: () => string | null
  type: CollectionsPageType
  collection: {
    status: string
    metadata: Collection | SmartCollection | null
    user: User | null
  }
  tracks: {
    status: string
    entries: CollectionTrack[]
  }
  columns?: any
  userId?: ID | null
  userPlaylists?: any
  isQueued: () => boolean
  onHeroTrackClickArtistName: () => void
  onPlay: (record: CollectionPageTrackRecord) => void
  onHeroTrackShare: (record: CollectionPageTrackRecord) => void
  onHeroTrackSave?: (record: CollectionPageTrackRecord) => void
  onClickRow: (record: CollectionPageTrackRecord, index: number) => void
  onClickSave?: (record: CollectionPageTrackRecord) => void
  allowReordering: boolean
  getFilteredData: (
    trackMetadata: CollectionTrack[]
  ) => [CollectionPageTrackRecord[], number]
  onFilterChange: (evt: ChangeEvent<HTMLInputElement>) => void
  onHeroTrackEdit: () => void
  onPublish: () => void
  onHeroTrackRepost?: any
  onClickTrackName: (record: CollectionPageTrackRecord) => void
  onClickArtistName: (record: CollectionPageTrackRecord) => void
  onClickRepostTrack: (record: CollectionPageTrackRecord) => void
  onSortTracks: (sorters: any) => void
  onReorderTracks: (source: number, destination: number) => void
  onClickRemove: (
    trackId: number,
    index: number,
    uid: string,
    timestamp: number
  ) => void
  onFollow: () => void
  onUnfollow: () => void
  onClickReposts?: () => void
  onClickFavorites?: () => void
  onClickDescriptionExternalLink: (e: any) => void
  onClickDescriptionInternalLink: (e: any) => void
}

const CollectionPage = ({
  title,
  description: pageDescription,
  canonicalUrl,
  structuredData,
  playlistId,
  allowReordering,
  playing,
  type,
  collection: { status, metadata, user },
  columns,
  tracks,
  userId,
  userPlaylists,
  getFilteredData,
  isQueued,
  onHeroTrackClickArtistName,
  onFilterChange,
  onPlay,
  onHeroTrackEdit,
  onPublish,
  onHeroTrackShare,
  onHeroTrackSave,
  onHeroTrackRepost,
  onClickRow,
  onClickSave,
  onClickTrackName,
  onClickArtistName,
  onClickRepostTrack,
  onSortTracks,
  onReorderTracks,
  onClickRemove,
  onFollow,
  onUnfollow,
  onClickReposts,
  onClickFavorites,
  onClickDescriptionExternalLink,
  onClickDescriptionInternalLink
}: CollectionPageProps) => {
  // TODO: Consider dynamic lineups, esp. for caching improvement.
  const [dataSource, playingIndex] =
    tracks.status === Status.SUCCESS
      ? getFilteredData(tracks.entries)
      : [[], -1]
  const collectionLoading = status === Status.LOADING
  const queuedAndPlaying = playing && isQueued()
  const tracksLoading = tracks.status === Status.LOADING

  const coverArtSizes =
    metadata && metadata?.variant !== Variant.SMART
      ? metadata._cover_art_sizes
      : null
  const duration =
    tracks.entries?.reduce(
      (duration: number, entry: CollectionTrack) =>
        duration + entry.duration || 0,
      0
    ) ?? 0

  const playlistOwnerName = user?.name ?? ''
  const playlistOwnerHandle = user?.handle ?? ''
  const playlistOwnerId = user?.user_id ?? null
  const isOwner = userId === playlistOwnerId
  const isFollowing = user?.does_current_user_follow ?? false
  const isSaved =
    metadata?.has_current_user_saved || playlistId in (userPlaylists ?? {})

  const variant = metadata?.variant ?? null
  const gradient =
    (metadata?.variant === Variant.SMART && metadata.gradient) ?? ''
  const icon = (metadata?.variant === Variant.SMART && metadata.icon) ?? null
  const imageOverride =
    (metadata?.variant === Variant.SMART && metadata.imageOverride) ?? ''
  const typeTitle =
    metadata?.variant === Variant.SMART ? metadata?.typeTitle ?? type : type
  const customEmptyText =
    metadata?.variant === Variant.SMART ? metadata?.customEmptyText : null

  const isNftPlaylist = typeTitle === 'Audio NFT Playlist'

  const {
    isEmpty,
    lastModified,
    playlistName,
    description,
    isPrivate,
    isAlbum,
    isPublishing,
    playlistSaveCount,
    playlistRepostCount,
    isReposted
  } = computeCollectionMetadataProps(metadata)

  const topSection = (
    <CollectionHeader
      collectionId={playlistId}
      userId={playlistOwnerId}
      loading={isNftPlaylist ? tracksLoading : collectionLoading}
      tracksLoading={tracksLoading}
      type={typeTitle}
      title={playlistName}
      artistName={playlistOwnerName}
      artistHandle={playlistOwnerHandle}
      coverArtSizes={coverArtSizes}
      description={description}
      isOwner={isOwner}
      isAlbum={isAlbum}
      numTracks={tracks.entries.length}
      modified={lastModified}
      duration={duration}
      isPublished={!isPrivate}
      isPublishing={isPublishing}
      isReposted={isReposted}
      isSaved={isSaved}
      isFollowing={isFollowing}
      reposts={playlistRepostCount}
      saves={playlistSaveCount}
      playing={queuedAndPlaying}
      // Actions
      onClickArtistName={onHeroTrackClickArtistName}
      onFilterChange={onFilterChange}
      onPlay={onPlay}
      onEdit={onHeroTrackEdit}
      onPublish={onPublish}
      onShare={onHeroTrackShare}
      onSave={onHeroTrackSave}
      onRepost={onHeroTrackRepost}
      onFollow={onFollow}
      onUnfollow={onUnfollow}
      onClickReposts={onClickReposts}
      onClickFavorites={onClickFavorites}
      onClickDescriptionExternalLink={onClickDescriptionExternalLink}
      onClickDescriptionInternalLink={onClickDescriptionInternalLink}
      // Smart collection
      variant={variant}
      gradient={gradient}
      icon={icon}
      imageOverride={imageOverride}
    />
  )

  const TableComponent = useMemo(() => {
    return isNftPlaylist ? CollectiblesPlaylistTable : TracksTable
  }, [isNftPlaylist])

  const tracksTableColumns = useMemo<
    (TracksTableColumn | CollectiblesPlaylistTableColumn)[]
  >(
    () =>
      isNftPlaylist
        ? ['playButton', 'collectibleName', 'chain', 'length', 'spacer']
        : [
            'playButton',
            'trackName',
            'artistName',
            isAlbum ? 'date' : 'addedDate',
            'length',
            'plays',
            'overflowActions'
          ],
    [isAlbum, isNftPlaylist]
  )

  return (
    <Page
      title={title}
      description={pageDescription}
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
      containerClassName={styles.pageContainer}
      scrollableSearch
    >
      <div className={styles.bodyWrapper}>
        <div className={styles.topSectionWrapper}>{topSection}</div>
        {!collectionLoading && isEmpty ? (
          <EmptyPage isOwner={isOwner} text={customEmptyText} />
        ) : (
          <div className={styles.tableWrapper}>
            <TableComponent
              // @ts-ignore
              columns={tracksTableColumns}
              wrapperClassName={styles.tracksTableWrapper}
              key={playlistName}
              loading={isNftPlaylist ? collectionLoading : tracksLoading}
              userId={userId}
              playing={playing}
              playingIndex={playingIndex}
              data={dataSource}
              onClickRow={onClickRow}
              onClickFavorite={onClickSave}
              onClickTrackName={onClickTrackName}
              onClickArtistName={onClickArtistName}
              onClickRemove={isOwner ? onClickRemove : undefined}
              onClickRepost={onClickRepostTrack}
              onReorderTracks={onReorderTracks}
              onSortTracks={onSortTracks}
              isReorderable={
                userId !== null &&
                userId === playlistOwnerId &&
                allowReordering &&
                !isAlbum
              }
              removeText={`${messages.remove} ${
                isAlbum ? messages.type.album : messages.type.playlist
              }`}
            />
          </div>
        )}
      </div>
    </Page>
  )
}

export default CollectionPage
