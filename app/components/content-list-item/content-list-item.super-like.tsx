import * as React from "react"
import { TouchableHighlight, View, ViewStyle } from "react-native"
import { SwipeRow } from "react-native-swipe-list-view"
import { observer } from "mobx-react"

import { SuperLikedContentListItemProps as Props } from "./content-list-item.props"
import { SuperLikeContentListItemStyle as Style } from "./content-list-item.super-like.style"
import { ContentListItemState as State } from "./content-list-item.state"
import { ContentListItemStyle as LegacyStyle } from "./content-list-item.style"
import { ContentListItemSkeleton } from "./content-list-item.skeleton"
import { ContentListItemBack } from "./content-list-item.back"

import { Button } from "../button"
import { Icon } from "../icon"
import { I18n } from "../i18n"
import { Text } from "../text"

import { translate } from "../../i18n"
import { color } from "../../theme"

@observer
export class SuperLikeContentListItem extends React.Component<Props, State> {
  swipeRowRef = React.createRef<SwipeRow<{}>>()

  isPrevFollow = this.props.content.liker.isFollowing

  constructor(props: Props) {
    super(props)

    this.state = {
      isRowOpen: false,
      offsetX: 0,
    }
  }

  static defaultProps = {
    isShowBookmarkIcon: true,
  } as Partial<Props>

  componentDidMount() {
    if (this.props.content.content.shouldFetchDetails) {
      this.props.content.content.fetchDetails()
    }
    this.fetchCreatorDependedDetails()
  }

  componentDidUpdate() {
    this.fetchCreatorDependedDetails()
  }

  private getSwipeRowWidth() {
    return -(this.props.content.liker ? 128 : 64)
  }

  private fetchCreatorDependedDetails() {
    if (this.props.content.content.shouldFetchLikeStat) {
      this.props.content.content.fetchLikeStat()
    }
    if (this.props.content.content.shouldFetchCreatorDetails) {
      this.props.content.content.creator.fetchDetails()
    }
    if (!this.props.content.liker.hasFetchedDetails) {
      this.props.content.liker.fetchDetails()
    }
  }

  private onRowOpen = () => {
    if (this.props.onSwipeOpen) {
      this.props.onSwipeOpen(this.props.content.content.url, this.swipeRowRef)
    }
    this.setState({ isRowOpen: true })
  }

  private onRowClose = () => {
    if (this.props.onSwipeClose) {
      this.props.onSwipeClose(this.props.content.content.url)
    }
    this.setState({ isRowOpen: false })
  }

  private onToggleBookmark = () => {
    this.swipeRowRef.current.closeRow()
    if (this.props.onToggleBookmark) {
      this.props.onToggleBookmark(this.props.content.content.url)
    }
  }

  private onToggleFollow = () => {
    this.swipeRowRef.current.closeRow()
    if (this.props.onToggleFollow) {
      this.props.onToggleFollow(this.props.content.liker)
    }
  }

  private onPressMoreButton = () => {
    if (this.state.isRowOpen) {
      this.swipeRowRef.current.closeRow()
    } else {
      this.swipeRowRef.current.manuallySwipeRow(this.getSwipeRowWidth())
    }
  }

  private onPress = () => {
    if (this.props.onPress) {
      this.props.onPress(this.props.content)
    }
  }

  private onPressUndoButton = () => {
    if (this.props.onPressUndoUnfollowButton) {
      this.props.onPressUndoUnfollowButton(this.props.content.liker)
    }
  }

  render() {
    const { isBookmarked, isLoading } = this.props.content.content

    if (isLoading) {
      return (
        <ContentListItemSkeleton
          primaryColor={this.props.skeletonPrimaryColor}
          secondaryColor={this.props.skeletonSecondaryColor}
        />
      )
    } else if (
      this.props.content.liker &&
      this.props.onPressUndoUnfollowButton &&
      this.isPrevFollow &&
      !this.props.content.liker.isFollowing
    ) {
      return this.renderUndo()
    }

    return (
      <SwipeRow
        ref={this.swipeRowRef}
        rightOpenValue={this.getSwipeRowWidth()}
        stopLeftSwipe={0}
        onRowOpen={this.onRowOpen}
        onRowClose={this.onRowClose}
      >
        <ContentListItemBack
          isShowFollowToggle={!!this.props.content.liker}
          isBookmarked={isBookmarked}
          isFollowingCreator={this.props.content.liker.isFollowing}
          onToggleBookmark={this.onToggleBookmark}
          onToggleFollow={this.onToggleFollow}
        />
        {this.renderFront()}
      </SwipeRow>
    )
  }

  private renderFront() {
    const { backgroundColor, content, style } = this.props

    const { normalizedTitle } = content.content

    const rootStyle = {
      ...LegacyStyle.Root,
      ...style,
      transform: [{ translateX: this.state.offsetX }],
    } as ViewStyle

    if (backgroundColor) {
      rootStyle.backgroundColor = backgroundColor
    }

    return (
      <TouchableHighlight
        underlayColor={this.props.underlayColor || color.palette.greyf2}
        style={rootStyle}
        onPress={this.onPress}
      >
        <View style={Style.Inset}>
          <View style={Style.HeaderView}>
            <I18n
              tx="readerScreen.SuperLikeFromLabel"
              style={Style.ShareByLabel}
            >
              <Text
                color="likeGreen"
                size="default"
                weight="600"
                text={content.liker.displayName}
                place="liker"
              />
            </I18n>
            <Button
              preset="plain"
              icon="three-dot-horizontal"
              size="tiny"
              color="grey4a"
              style={Style.MoreButton}
              onPress={this.onPressMoreButton}
            />
          </View>
          <Text text={normalizedTitle} style={Style.Title} />
          <View style={Style.FooterView}>
            <Text
              text={content.content.creatorDisplayName}
              size="small"
              color="grey9b"
            />
            <View style={Style.AccessoryView}>
              {this.props.isShowFollowToggle &&
                this.renderFollowToggle(content.liker.isFollowing)}
              {this.renderBookmarkButton(content.content.isBookmarked)}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  private renderFollowToggle(isFollowing: boolean) {
    const buttonPreset = isFollowing ? "primary" : "secondary"
    const tx = `common.${isFollowing ? "Following" : "follow"}`
    return (
      <Button
        preset={buttonPreset}
        size="tiny"
        tx={tx}
        style={Style.AccessoryButton}
        onPress={this.onToggleFollow}
      />
    )
  }

  private renderBookmarkButton(isBookmarked: boolean) {
    const iconName = isBookmarked ? "bookmark-filled" : "bookmark-outlined"
    const buttonPreset = isBookmarked ? "primary" : "secondary"
    return (
      <Button
        preset={buttonPreset}
        size="tiny"
        icon={iconName}
        style={Style.AccessoryButton}
        onPress={this.onToggleBookmark}
      />
    )
  }

  private renderUndo() {
    return (
      <View style={LegacyStyle.RootUndo}>
        <Icon name="seen" width={24} height={24} fill={color.palette.grey9b} />
        <View style={LegacyStyle.UndoTextWrapper}>
          <Text
            text={translate("common.unfollowSuccess", {
              creator: this.props.content.liker.displayName,
            })}
            weight="600"
            color="grey9b"
            numberOfLines={1}
            ellipsizeMode="middle"
          />
        </View>
        <Button
          preset="plain"
          tx="common.undo"
          fontSize="default"
          append={
            <Icon
              name="undo"
              width={16}
              height={16}
              fill={color.primary}
              style={LegacyStyle.UndoButtonIcon}
            />
          }
          style={LegacyStyle.UndoButton}
          onPress={this.onPressUndoButton}
        />
      </View>
    )
  }
}