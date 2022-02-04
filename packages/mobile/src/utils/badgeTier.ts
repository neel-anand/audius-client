import { User } from 'audius-client/src/common/models/User'
import BN from 'bn.js'

export const WEI = new BN('1000000000000000000')

export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'
export const badgeTiers: { tier: BadgeTier; minAudio: BN }[] = [
  {
    tier: 'platinum',
    minAudio: new BN('100000')
  },
  {
    tier: 'gold',
    minAudio: new BN('10000')
  },
  {
    tier: 'silver',
    minAudio: new BN('100')
  },
  {
    tier: 'bronze',
    minAudio: new BN('10')
  },
  {
    tier: 'none',
    minAudio: new BN('0')
  }
]

export const tierLevels: BadgeTier[] = [
  'none',
  'bronze',
  'silver',
  'gold',
  'platinum'
]

export const getTierLevel = (tier: BadgeTier) => {
  return tierLevels.indexOf(tier)
}

export const getBadgeTier = (
  user: Pick<User, 'balance' | 'associated_wallets_balance'>
) => {
  const totalBalance = new BN(user.balance ?? '0')
    .add(new BN(user.associated_wallets_balance ?? '0'))
    .div(WEI)

  const index = badgeTiers.findIndex(t => {
    return t.minAudio.lte(totalBalance)
  })

  const tier = index === -1 ? 'none' : badgeTiers[index].tier
  return tier
}

export default getBadgeTier
