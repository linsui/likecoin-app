import * as React from "react"

import {
  GlobalSuperLikedFeedScreenProps as Props,
} from "./global-superliked-feed-screen.props"
import {
  GlobalSuperLikedFeedScreenStyle as Style,
} from "./global-superliked-feed-screen.style"

import {
  SuperLikeContentList,
} from "../../components/content-list"
import {
  wrapContentListScreen,
} from "../../components/content-list-screen"
import { Header } from "../../components/header"
import { Screen } from "../../components/screen"

import { color } from "../../theme"

class GlobalSuperLikedFeedScreenBase extends React.Component<Props> {
  componentDidMount() {
    this.props.readerStore.fetchGlobalSuperLikedFeed()
  }

  private fetchMore = () => {
    this.props.readerStore.fetchGlobalSuperLikedFeed({ isMore: true })
  }

  private goBack = () => {
    this.props.navigation.goBack()
  }

  render() {
    return (
      <Screen
        style={Style.Root}
        preset="fixed"
      >
        <Header
          headerTx="GlobalSuperLikedFeedScreen.Title"
          leftIcon="back"
          onLeftPress={this.goBack}
        />
        {this.renderList()}
      </Screen>
    )
  }

  private renderList = () => {
    return (
      <SuperLikeContentList
        data={this.props.readerStore.globalSuperLikedFeed}
        creators={this.props.readerStore.creators}
        isLoading={this.props.readerStore.globalSuperLikedFeedStatus === "fetching"}
        isFetchingMore={this.props.readerStore.globalSuperLikedFeedStatus === "fetching-more"}
        hasFetched={this.props.readerStore.globalSuperLikedFeedStatus === "fetched"}
        hasFetchedAll={this.props.readerStore.globalSuperLikedFeedStatus === "fetched-more"}
        lastFetched={this.props.readerStore.globalSuperLikedFeedLastFetchedDate.getTime()}
        backgroundColor={color.palette.lightGreen}
        underlayColor={color.palette.darkerGreen}
        skeletonPrimaryColor={color.palette.darkerGreen}
        skeletonSecondaryColor={color.palette.greyBlue}
        isShowFollowToggle={true}
        onFetchMore={this.fetchMore}
        onPressItem={this.props.onPressSuperLikeItem}
        onToggleBookmark={this.props.onToggleBookmark}
        onToggleFollow={this.props.onToggleFollow}
        onRefresh={this.props.readerStore.fetchGlobalSuperLikedFeed}
        style={Style.List}
      />
    )
  }
}

export const GlobalSuperLikedFeedScreen = wrapContentListScreen(
  GlobalSuperLikedFeedScreenBase
)
