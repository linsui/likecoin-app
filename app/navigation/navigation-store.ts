import { Instance, types } from "mobx-state-tree"
import { RootNavigator } from "./root-navigator"
import { NavigationActions, NavigationAction, NavigationNavigateActionPayload } from "react-navigation"
import { NavigationEvents } from "./navigation-events"
import { setAnalyticsCurrentScreen } from "../utils/firebase"

const DEFAULT_STATE = RootNavigator.router.getStateForAction(NavigationActions.init(), null)

/**
 * Finds the current route.
 *
 * @param navState the current nav state
 */
function findCurrentRoute(navState) {
  const route = navState.routes[navState.index]
  if (route.routes) {
    return findCurrentRoute(route)
  }
  return route
}

const logCurrentScreen = (prevState, currentState) => {
  const currentRouteName = findCurrentRoute(currentState).routeName
  const previousRouteName = findCurrentRoute(prevState).routeName
  if (previousRouteName !== currentRouteName) {
    // the line below uses the @react-native-firebase/analytics tracker
    // change the tracker here to use other Mobile analytics SDK.
    setAnalyticsCurrentScreen(currentRouteName)
  }
}

/**
 * Tracks the navigation state for `react-navigation` as well as providers
 * the actions for changing that state.
 */
export const NavigationStoreModel = NavigationEvents.named("NavigationStore")
  .props({
    /**
     * the navigation state tree (Frozen here means it is immutable.)
     */
    state: types.optional(types.frozen(), DEFAULT_STATE),
  })
  .preProcessSnapshot(snapshot => {
    if (!snapshot || !snapshot.state) return snapshot

    try {
      // make sure react-navigation can handle our state
      RootNavigator.router.getPathAndParamsForState(snapshot.state)
      return snapshot
    } catch (e) {
      // otherwise restore default state
      return { ...snapshot, state: DEFAULT_STATE }
    }
  })
  .actions(self => ({
    /**
     * Return all subscribers
     */
    actionSubscribers() {
      return self.subs
    },

    /**
     * Fires when navigation happens.
     *
     * Our job is to update the state for this new navigation action.
     *
     * @param action The new navigation action to perform
     * @param shouldPush Should we push or replace the whole stack?
     */
    dispatch(action: NavigationAction, shouldPush = true) {
      const previousNavState = shouldPush ? self.state : null
      self.state = RootNavigator.router.getStateForAction(action, previousNavState) || self.state
      self.fireSubscribers(action, previousNavState, self.state)
      logCurrentScreen(previousNavState, self.state)
      return true
    },

    /**
     * Resets the navigation back to the start.
     */
    reset() {
      self.state = DEFAULT_STATE
    },

    /**
     * Finds the current route.
     */
    findCurrentRoute() {
      return findCurrentRoute(self.state)
    },
  }))
  .actions(self => ({
    /**
     * Navigate to another place.
     *
     * @param options Navigation options.
     */
    navigateTo(options: NavigationNavigateActionPayload) {
      self.dispatch(NavigationActions.navigate(options))
    },
  }))

export type NavigationStore = Instance<typeof NavigationStoreModel>
