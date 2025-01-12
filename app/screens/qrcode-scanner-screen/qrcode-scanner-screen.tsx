import * as React from "react"
import { SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { inject } from "mobx-react"
import { RNCamera } from "react-native-camera"
import { NavigationStackScreenProps } from "react-navigation-stack"
import throttle from "lodash.throttle"

import { Button } from "../../components/button"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"

import { ExperimentalFeatureStore } from "../../models/experimental-feature-store"
import { WalletConnectStore } from "../../models/wallet-connect-store"

import { validateAccountAddress } from "../../services/cosmos/cosmos.utils"

import { color, spacing } from "../../theme"

import ScanFrame from "./scan-frame.svg"

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: color.primary,
}
const SCREEN: ViewStyle = {
  flexGrow: 1,
}
const CAMERA: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}
const SCAN_FRAME: ViewStyle = {
  position: "relative",
  width: 244,
  aspectRatio: 1,
}
const HINT_TEXT: TextStyle = {
  position: "absolute",
  top: "100%",
  width: "100%",
  marginTop: spacing[5],
  fontSize: 18,
}
const BOTTOM_BAR: ViewStyle = {
  alignItems: "center",
  width: "100%",
  padding: spacing[3],
  backgroundColor: color.palette.white,
}
const FOOTER_VIEW: ViewStyle = {
  position: "absolute",
  bottom: 0,
  alignItems: "center",
  padding: spacing[5],
}
const NEXT: ViewStyle = {
  minWidth: 256,
}

export interface QrcodeScannerScreenProps extends NavigationStackScreenProps<{}> {
  walletConnectStore: WalletConnectStore
  experimentalFeatureStore: ExperimentalFeatureStore
}

@inject(
  "experimentalFeatureStore",
  "walletConnectStore",
)
export class QrcodeScannerScreen extends React.Component<QrcodeScannerScreenProps, {}> {
  constructor(props: QrcodeScannerScreenProps) {
    super(props)
    this.onRead = throttle(this.onRead, 2000)
  }

  private onRead = (event: any) => {
    if (typeof event.data !== "string") return
    if (
      this.props.experimentalFeatureStore.isWalletConnectActivated
      && event.data.includes("wc:")
    ) {
      this.props.navigation.goBack()
      this.props.walletConnectStore.handleNewSessionRequest(event.data)
    } else if (event.data[0] === "{") {
      try {
        const {
          address,
          likerId,
          coins = {},
          memo,
          skipToConfirm = true,
        } = JSON.parse(event.data)
        this.props.navigation.replace("Transfer", {
          address,
          likerId,
          amount: coins.amount,
          memo,
          skipToConfirm,
        })
      } catch (err) {
        console.error(err)
      }
    } else if (validateAccountAddress(event.data)) {
      this.props.navigation.replace("Transfer", { address: event.data })
    }
  }

  private onPressCloseButton = () => {
    this.props.navigation.goBack()
  }

  private onPressFooterViewButton = () => {
    this.props.navigation.navigate("Receive")
  }

  render () {
    return (
      <View style={ROOT}>
        <Screen
          preset="fixed"
          backgroundColor={color.transparent}
          style={SCREEN}
        >
          <RNCamera
            captureAudio={false}
            onBarCodeRead={this.onRead}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            style={CAMERA}
          >
            {this.renderScanFrame()}
            {this.renderFooterView()}
          </RNCamera>
        </Screen>
        <SafeAreaView style={BOTTOM_BAR}>
          <Button
            preset="icon"
            icon="close"
            color="likeGreen"
            onPress={this.onPressCloseButton}
          />
        </SafeAreaView>
      </View>
    )
  }

  private renderScanFrame = () => {
    return (
      <View style={SCAN_FRAME}>
        <ScanFrame />
        <Text
          tx="qrcodeScannerScreen.hintText"
          color="white"
          weight="600"
          align="center"
          style={HINT_TEXT}
        />
      </View>
    )
  }

  private renderFooterView = () => {
    return (
      <View style={FOOTER_VIEW}>
        <Button
          preset="primary"
          tx="qrcodeScannerScreen.showMyQRCode"
          style={NEXT}
          onPress={this.onPressFooterViewButton}
        />
      </View>
    )
  }
}
