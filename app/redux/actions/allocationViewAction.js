import { changeView } from "../reducers/allocationViewReducer";


export const performChangeView = (newView) => async (dispatch) => {
  try {
    dispatch(changeView(newView));
    console.log(`View changed to ${newView}!`);
  } catch (error) {
    console.error('Failed to change view:', error);
  }
};