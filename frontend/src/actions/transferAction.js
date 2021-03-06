import axios from 'axios';
import {SERVER_URL} from '../constant/server_url';
import {getUser} from './profileAction';
import {getHistoryById} from './historyAction';
import {GET_ERRORS, CLEAR_ERRORS} from './type';

export const transfer = (
  owneraddress,
  toaddress,
  flag,
  amount,
  id,
  onShowModal,
  setLoading,
) => {
  return async dispatch => {
    await axios
      .post(SERVER_URL + '/transfer', {owneraddress, toaddress, flag, amount})
      .then(res => {
        if (res.data.msg === 'success') {
          onShowModal(toaddress, flag, amount);
          dispatch(getUser(id));
          dispatch({type: CLEAR_ERRORS});
          dispatch(getHistoryById(owneraddress));
        }
      })
      .catch(err => {
        setLoading(false);
        dispatch({type: GET_ERRORS, payload: err.response.data});
      });
  };
};
