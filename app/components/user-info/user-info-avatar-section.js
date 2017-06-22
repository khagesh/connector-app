import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import Divider from '../divider'
import { ListItem, ListItemData } from '../info-section-list'
import { BadgeAvatar, Avatar } from '../avatar'
import { ItemDividerLabel } from '../../styled-components/common-styled'
import { addButtonText } from './user-info-common-components'
import Alert from '../alert'
import { avatarTapped, resetAvatarTapCount, sendUserInfo } from '../../store'

/**
 * TODO:KS
 * - Create common component for Divider label
 * - Add styles so that images can wrap in another line if not enough space
 * - Add vertical spacing to avatars instead of ListItem so that 
 *    when we wrap photos in multiple lines, we get desired spacing from everyside
 */
const avatarDividerLeft = <ItemDividerLabel>AVATAR PHOTOS</ItemDividerLabel>

export default class UserInfoAvatarSection extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      avatarTapped,
      avatarTapCount,
      sendUserInfo,
      resetAvatarTapCount,
    } = this.props
    return (
      <View>
        <Divider left={avatarDividerLeft} right={addButtonText} />
        <ListItem>
          <ListItemData>
            <BadgeAvatar
              count={76}
              small
              src={require('../../invitation/images/inviter.jpeg')}
              onPress={avatarTapped}
            />
          </ListItemData>
        </ListItem>
        {avatarTapCount === 3 &&
          <Alert
            onClose={sendUserInfo}
            reset={resetAvatarTapCount}
            config={this.props.config}
          />}
      </View>
    )
  }
}
