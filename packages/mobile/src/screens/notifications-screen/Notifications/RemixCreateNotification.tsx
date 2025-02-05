import { useCallback } from 'react'

import type {
  EntityType,
  TrackEntity,
  RemixCreateNotification as RemixCreateNotificationType
} from '@audius/common'
import { useProxySelector, notificationsSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import IconRemix from 'app/assets/images/iconRemix.svg'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'
import { EventNames } from 'app/types/analytics'
import { getTrackRoute } from 'app/utils/routes'

import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink,
  NotificationTwitterButton
} from '../Notification'
const { getNotificationEntities, getNotificationUser } = notificationsSelectors

const messages = {
  title: 'New Remix of Your Track',
  by: 'by',
  shareTwitterText: (trackTitle: string, handle: string) =>
    `New remix of ${trackTitle} by ${handle} on @AudiusProject #Audius`
}

type RemixCreateNotificationProps = {
  notification: RemixCreateNotificationType
}

export const RemixCreateNotification = (
  props: RemixCreateNotificationProps
) => {
  const { notification } = props
  const { childTrackId, parentTrackId } = notification
  const navigation = useNotificationNavigation()
  const user = useSelector((state) => getNotificationUser(state, notification))
  const tracks = useProxySelector(
    (state) => getNotificationEntities(state, notification),
    [notification]
  ) as EntityType[]

  const childTrack = tracks?.find(
    (track): track is TrackEntity =>
      'track_id' in track && track.track_id === childTrackId
  )

  const parentTrack = tracks?.find(
    (track): track is TrackEntity =>
      'track_id' in track && track.track_id === parentTrackId
  )
  const parentTrackTitle = parentTrack?.title

  const handlePress = useCallback(() => {
    if (childTrack) {
      navigation.navigate(notification)
    }
  }, [childTrack, navigation, notification])

  const handleTwitterShareData = useCallback(
    (handle: string | undefined) => {
      if (parentTrackTitle && handle) {
        const shareText = messages.shareTwitterText(parentTrackTitle, handle)
        const analytics = {
          eventName: EventNames.NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE,
          text: shareText
        } as const
        return { shareText, analytics }
      }
      return null
    },
    [parentTrackTitle]
  )

  if (!user || !childTrack || !parentTrack) return null

  const twitterUrl = getTrackRoute(parentTrack, true)

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconRemix}>
        <NotificationTitle>
          {messages.title} <EntityLink entity={parentTrack} />
        </NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        <EntityLink entity={childTrack} /> {messages.by}{' '}
        <UserNameLink user={user} />
      </NotificationText>
      <NotificationTwitterButton
        type='dynamic'
        url={twitterUrl}
        handle={user.handle}
        shareData={handleTwitterShareData}
      />
    </NotificationTile>
  )
}
