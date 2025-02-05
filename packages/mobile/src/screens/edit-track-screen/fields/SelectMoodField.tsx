import { useCallback } from 'react'

import { Image, View } from 'react-native'

import type { ContextualSubmenuProps } from 'app/components/core'
import { Pill, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { moodMap } from 'app/utils/moods'

import { ContextualSubmenuField } from './ContextualSubmenuField'

const messages = {
  mood: 'Mood'
}

type SelectMoodFieldProps = Partial<ContextualSubmenuProps>

const useStyles = makeStyles(({ spacing }) => ({
  value: {
    alignItems: 'flex-start',
    marginTop: spacing(4)
  },
  emoji: {
    height: spacing(4),
    width: spacing(4),
    marginRight: spacing(2)
  },
  text: {
    textTransform: 'uppercase'
  }
}))

export const SelectMoodField = (props: SelectMoodFieldProps) => {
  const styles = useStyles()

  const renderValue = useCallback(
    (value: string) => {
      return (
        <View style={styles.value}>
          <Pill>
            <Image source={moodMap[value]} style={styles.emoji} />
            <Text fontSize='small' weight='demiBold' style={styles.text}>
              {value}
            </Text>
          </Pill>
        </View>
      )
    },
    [styles]
  )

  return (
    <ContextualSubmenuField
      name='mood'
      submenuScreenName='SelectMood'
      label={messages.mood}
      renderValue={renderValue}
      {...props}
    />
  )
}
