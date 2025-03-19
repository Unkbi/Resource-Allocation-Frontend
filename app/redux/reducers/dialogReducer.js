const initialState = {
  isOpen: false,
  title: '',
  submitButtonText: '',
  cancelButtonText: '',
  formState: {
    formType: '',
  },
};

const dialogReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        isOpen: true,
        ...action.payload,
      };
    case 'CLOSE_DIALOG':
      return initialState;
    default:
      return state;
  }
};

export default dialogReducer;
