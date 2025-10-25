import { Types } from "../Types";

const initalState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  status: false,
};
const UserReducer = (state = initalState, action) => {
  switch (action.type) {
    case Types.User.Login: {
      return {
        user: action.payload,
        status: true,
      };
    }
    case Types.User.Logout: {
      return {
        user: null,
        status: false,
      };
    }
    case Types.User.Update:{
        return{
            ...state,user:
            {
                ...state.user,
                ...action.payload
            },
            status: true
        }
    }
    default:
      return state;
  }
};
export { UserReducer };
