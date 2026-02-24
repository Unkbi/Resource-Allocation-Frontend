// Follow Action Types
export const FETCH_FOLLOWS = 'FETCH_FOLLOWS';
export const FETCH_FOLLOWS_SUCCESS = 'FETCH_FOLLOWS_SUCCESS';
export const FETCH_FOLLOWS_FAILURE = 'FETCH_FOLLOWS_FAILURE';

export const CREATE_FOLLOW = 'CREATE_FOLLOW';
export const CREATE_FOLLOW_SUCCESS = 'CREATE_FOLLOW_SUCCESS';
export const CREATE_FOLLOW_FAILURE = 'CREATE_FOLLOW_FAILURE';

export const UPDATE_FOLLOW_PREFERENCES = 'UPDATE_FOLLOW_PREFERENCES';
export const UPDATE_FOLLOW_PREFERENCES_SUCCESS = 'UPDATE_FOLLOW_PREFERENCES_SUCCESS';
export const UPDATE_FOLLOW_PREFERENCES_FAILURE = 'UPDATE_FOLLOW_PREFERENCES_FAILURE';

export const UNFOLLOW = 'UNFOLLOW';
export const UNFOLLOW_SUCCESS = 'UNFOLLOW_SUCCESS';
export const UNFOLLOW_FAILURE = 'UNFOLLOW_FAILURE';

// Action Creators
export const fetchFollows = (userId) => ({
  type: FETCH_FOLLOWS,
  payload: userId,
});

export const fetchFollowsSuccess = (follows) => ({
  type: FETCH_FOLLOWS_SUCCESS,
  payload: follows,
});

export const fetchFollowsFailure = (error) => ({
  type: FETCH_FOLLOWS_FAILURE,
  payload: error,
});

export const createFollow = (payload) => ({
  type: CREATE_FOLLOW,
  payload,
});

export const createFollowSuccess = (follow) => ({
  type: CREATE_FOLLOW_SUCCESS,
  payload: follow,
});

export const createFollowFailure = (error) => ({
  type: CREATE_FOLLOW_FAILURE,
  payload: error,
});

export const updateFollowPreferences = (payload) => ({
  type: UPDATE_FOLLOW_PREFERENCES,
  payload,
});

export const updateFollowPreferencesSuccess = (follow) => ({
  type: UPDATE_FOLLOW_PREFERENCES_SUCCESS,
  payload: follow,
});

export const updateFollowPreferencesFailure = (error) => ({
  type: UPDATE_FOLLOW_PREFERENCES_FAILURE,
  payload: error,
});

export const unfollowAction = (payload) => ({
  type: UNFOLLOW,
  payload,
});

export const unfollowSuccess = (followId) => ({
  type: UNFOLLOW_SUCCESS,
  payload: followId,
});

export const unfollowFailure = (error) => ({
  type: UNFOLLOW_FAILURE,
  payload: error,
});
