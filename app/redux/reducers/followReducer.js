import {
  FETCH_FOLLOWS,
  FETCH_FOLLOWS_SUCCESS,
  FETCH_FOLLOWS_FAILURE,
  CREATE_FOLLOW,
  CREATE_FOLLOW_SUCCESS,
  CREATE_FOLLOW_FAILURE,
  UPDATE_FOLLOW_PREFERENCES,
  UPDATE_FOLLOW_PREFERENCES_SUCCESS,
  UPDATE_FOLLOW_PREFERENCES_FAILURE,
  UNFOLLOW,
  UNFOLLOW_SUCCESS,
  UNFOLLOW_FAILURE,
} from '../actions/followActions';

const initialState = {
  follows: [],
  loading: false,
  error: null,
  // Map for quick lookup: { objectId: followData }
  followsByObjectId: {},
  // Map for quick lookup: { followId: followData }
  followsById: {},
};

const followReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FOLLOWS:
    case CREATE_FOLLOW:
    case UPDATE_FOLLOW_PREFERENCES:
    case UNFOLLOW:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_FOLLOWS_SUCCESS: {
      // Handle both response formats: direct array or wrapped in follows property
      let followsArray = [];
      
      if (Array.isArray(action.payload)) {
        followsArray = action.payload;
      } else if (action.payload?.follows && Array.isArray(action.payload.follows)) {
        followsArray = action.payload.follows;
      } else {
        followsArray = [];
      }
      
      // Build new lookup maps from scratch (complete replacement)
      const followsByObjectId = {};
      const followsById = {};
      
      followsArray.forEach((follow) => {
        // Use Id as FollowId if FollowId doesn't exist
        const followId = follow.FollowId || follow.Id;
        
        if (follow.ObjectId) {
          followsByObjectId[follow.ObjectId] = { ...follow, FollowId: followId };
        }
        
        if (followId) {
          followsById[followId] = { ...follow, FollowId: followId };
        }
      });

      return {
        follows: followsArray.map(f => ({ ...f, FollowId: f.FollowId || f.Id })),
        followsByObjectId,
        followsById,
        loading: false,
        error: null,
      };
    }

    case CREATE_FOLLOW_SUCCESS: {
      // Extract Follow object if wrapped, or use payload directly
      const followData = action.payload?.Follow || action.payload;
      const followId = followData.FollowId || followData.Id;
      
      if (!followData.ObjectId) {
        return state;
      }
      
      const newFollow = { ...followData, FollowId: followId };
      
      const updatedFollows = [...state.follows, newFollow];
      const updatedFollowsByObjectId = {
        ...state.followsByObjectId,
        [newFollow.ObjectId]: newFollow,
      };
      const updatedFollowsById = {
        ...state.followsById,
        [followId]: newFollow,
      };

      return {
        ...state,
        follows: updatedFollows,
        followsByObjectId: updatedFollowsByObjectId,
        followsById: updatedFollowsById,
        loading: false,
        error: null,
      };
    }

    case UPDATE_FOLLOW_PREFERENCES_SUCCESS: {
      // Extract Follow object if wrapped, or use payload directly
      const followData = action.payload?.Follow || action.payload;
      const followId = followData.FollowId || followData.Id;
      
      const updatedFollow = { ...followData, FollowId: followId };
      
      const updatedFollows = state.follows.map(follow =>
        (follow.FollowId || follow.Id) === followId ? updatedFollow : follow
      );
      const updatedFollowsByObjectId = {
        ...state.followsByObjectId,
        [updatedFollow.ObjectId]: updatedFollow,
      };
      const updatedFollowsById = {
        ...state.followsById,
        [followId]: updatedFollow,
      };

      return {
        ...state,
        follows: updatedFollows,
        followsByObjectId: updatedFollowsByObjectId,
        followsById: updatedFollowsById,
        loading: false,
        error: null,
      };
    }

    case UNFOLLOW_SUCCESS: {
      const followId = action.payload;
      const followToRemove = state.followsById[followId];
      
      if (!followToRemove) {
        return {
          ...state,
          loading: false,
        };
      }

      const updatedFollows = state.follows.filter(
        follow => follow.FollowId !== followId
      );
      const { [followToRemove.ObjectId]: _, ...updatedFollowsByObjectId } = state.followsByObjectId;
      const { [followId]: __, ...updatedFollowsById } = state.followsById;

      return {
        ...state,
        follows: updatedFollows,
        followsByObjectId: updatedFollowsByObjectId,
        followsById: updatedFollowsById,
        loading: false,
        error: null,
      };
    }

    case FETCH_FOLLOWS_FAILURE:
    case CREATE_FOLLOW_FAILURE:
    case UPDATE_FOLLOW_PREFERENCES_FAILURE:
    case UNFOLLOW_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default followReducer;
