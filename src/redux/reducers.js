import { combineReducers } from 'redux';
import auth from '../auth/auth.reducer';
import reservation from '../reservation/reservation.reducer';
import ratings from '../rating/rating.reducer';

function root(state = null, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default combineReducers({ root, auth, reservation, ratings });
