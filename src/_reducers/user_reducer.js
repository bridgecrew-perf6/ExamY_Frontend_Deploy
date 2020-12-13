import{
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  FETCH_EXAM,
  FETCH_QUESTIONS
} from '../_actions/type';

export default function(state = {}, action){
  
  switch (action.type) {
    case LOGIN_USER:
        return{ ...state, loginSuccess: action.payload }
      break;
    
    case REGISTER_USER:
        return{ ...state, register: action.payload}
      break;
      
    case AUTH_USER:
        return{ ...state, userData: action.payload}    
      break;

    case FETCH_EXAM:
        return{ ...state, fetchSuccess: action.payload}
      break;
    
    case FETCH_QUESTIONS:
        return{ ...state, fetchSuccess: action.payload}
      break;
      
    default:
      return state;
  }
}