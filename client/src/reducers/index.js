import { combineReducers } from 'redux';
import lobby from './lobby';
import table from './table';

export default combineReducers({
  lobby,
  table
});
