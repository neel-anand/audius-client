import { Client } from '@audius/common'
import cn from 'classnames'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { getClient } from 'utils/clientUtil'

import styles from './Navigator.module.css'
import LeftNav from './desktop/LeftNav'
import ConnectedNavBar from './mobile/ConnectedNavBar'

interface OwnProps {
  className?: string
}

type NavigatorProps = OwnProps & RouteComponentProps

// Navigation component that renders the NavBar for mobile
// and LeftNav for desktop
const Navigator = ({ className }: NavigatorProps) => {
  const client = getClient()

  const isMobile = client === Client.MOBILE

  return (
    <div
      className={cn(styles.navWrapper, className, {
        [styles.leftNavWrapper]: !isMobile
      })}
    >
      {isMobile ? (
        <ConnectedNavBar />
      ) : (
        <LeftNav isElectron={client === Client.ELECTRON} />
      )}
    </div>
  )
}

export default withRouter(Navigator)
