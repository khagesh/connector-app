// @flow
import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { captureError } from '../services'
import type { Store } from '../store/type-store'
import { Request, Container } from '../components'
import type { ResponseTypes } from '../components/request/type-request'
import type {
  QrConnectionRequestProps,
  QrConnectionRequestState,
} from './type-qr-connection-request'
import { homeRoute } from '../common'
import { QR_CODE_SENDER_NAME } from '../services/api'
import { ResponseType } from '../components/request/type-request'
import { sendQrConnectionResponse } from './qr-connection-request-store'
import ConnectionSuccessModal from '../authentication/connection-success-modal'

export class QRConnectionRequest extends PureComponent<
  void,
  QrConnectionRequestProps,
  QrConnectionRequestState
> {
  state = {
    isSuccessModalVisible: false,
  }

  _showModal = () => this.setState({ isSuccessModalVisible: true })

  _hideModal = () => this.setState({ isSuccessModalVisible: false })

  onSuccessModalContinue = () => {
    this._hideModal()
    this.props.navigation.navigate(homeRoute)
  }

  onAction = (response: ResponseTypes) => {
    this.props.sendQrConnectionResponse({ response })
  }

  componentWillReceiveProps(nextProps: QrConnectionRequestProps) {
    if (nextProps.request.payload !== this.props.request.payload) {
      // a new qr connection request was received
      this._hideModal()
    } else {
      if (nextProps.request.isFetching === false) {
        if (nextProps.request.error) {
          // TODO:KS we got error from API response, what to do now
          if (nextProps.request.error != this.props.request.error) {
            captureError(nextProps.request.error, this.props.showErrorAlerts)
          }
        } else {
          // api response was successful, but now we have to check
          // if user accepted or declined the request
          if (nextProps.request.status === ResponseType.accepted) {
            this._showModal()
          } else {
            // user declined the request and that response was successfully sent to agent
            this.props.navigation.navigate(homeRoute)
          }
        }
      } else {
        // TODO:KS show loading indicator, API request was sent
      }
    }
  }

  render() {
    const { title, message, senderLogoUrl, payload } = this.props.request

    let connectionName = ''
    if (payload) {
      connectionName = payload[QR_CODE_SENDER_NAME]
    }

    return (
      <Container>
        <Request
          title={title}
          message={message}
          senderLogoUrl={senderLogoUrl}
          onAction={this.onAction}
          showErrorAlerts={this.props.showErrorAlerts}
        />
        <ConnectionSuccessModal
          isModalVisible={this.state.isSuccessModalVisible}
          showConnectionSuccessModal={this.onSuccessModalContinue}
          name={connectionName}
          logoUrl={senderLogoUrl}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  request: state.qrConnection,
  showErrorAlerts: state.config.showErrorAlerts,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({ sendQrConnectionResponse }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(QRConnectionRequest)
