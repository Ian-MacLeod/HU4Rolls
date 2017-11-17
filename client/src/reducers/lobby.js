import {
  SELECT_TABLE,
  UPDATE_TABLE_LIST,
} from '../actions';

const initialState = {
  tableList: [],
  selectedTable: null,
};

const lobby = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_TABLE:
      return { ...state, selectedTable: action.name };
    case UPDATE_TABLE_LIST: {
      const newState = {};
      newState.tableList = action.tableList;
      if (newState.tableList.filter(table => table.name === state.selectedTable).length === 0) {
        newState.selectedTable = newState.tableList.length > 0 ?
          newState.tableList[0].name :
          null;
      }
      return { ...state, ...newState };
    }
    default:
      return state;
  }
};

export default lobby;
