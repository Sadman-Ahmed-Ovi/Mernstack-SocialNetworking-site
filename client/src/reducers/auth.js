import { REGISTER_SUCCESS, REGISTER_FAIL, AUTH_ERROR, USER_LOADED,
    LOGIN_SUCCESS, LOGIN_FAIL,LOGOUT, DELETE_ACCOUNT} from '../actions/types';

const initialState = {
    isAuthenticated: false,
    user: null,
    loading:true,
    token:localStorage.getItem('token')
};

export default function (state = initialState, action) {
    switch (action.type) {
        case USER_LOADED: return {
            ...state,
            user:action.payload,
            isAuthenticated: true,
            loading: false
        };

        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem('token',action.payload.token)
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading:false
            };
        case REGISTER_FAIL:
        case AUTH_ERROR: 
        case LOGIN_FAIL : 
        case LOGOUT:
        case DELETE_ACCOUNT:    
            localStorage.removeItem('token')
            return {
                ...state,
                token:null,
                isAuthenticated: false,
                loading: false
            };
        default:
            return state;
    }
}