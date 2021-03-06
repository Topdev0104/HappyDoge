import React, {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity, ScrollView} from 'react-native';
import {Input} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import {ActivityIndicator} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';
import {getUser} from '../../actions/profileAction';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {TransferModal} from '../../components/TransferModal';
import Header from '../../components/Header';
import styles from './styles';
import {message} from '../../constant/message';
import isEmpty from '../../utils/isEmpty';

const celldata = ['ETH', 'HDT'];
const Transfer = ({navigation, props}) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('eth');
  const [error, setError] = useState({});
  const [amount, setAmount] = useState(0);
  const [modalData, setModalData] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [address, setAddress] = useState('');
  const store = useSelector(state => state.auth);
  const socket = useSelector(state => state.socket);
  const errors = useSelector(state => state.errors);
  const send = async () => {
    // setLoading(true);
    if (isEmpty(address)) {
      setError({address: 'Please input address'});
    } else if (amount === 0) {
      setError({amount: 'Please input correct balance'});
    } else if (isNaN(amount)) {
      setError({amount: 'Please only input number'});
    } else {
      const data = {
        owneraddress: store.user.address,
        toaddress: address,
        flag: selected,
        amount: Number(amount),
        id: store.user.id,
      };
      await socket.socket.emit('transfer', data);
    }
  };
  const onShowModal = async (toaddress, flag, amount) => {
    const modalData = {
      message: message[0].message,
      address: toaddress,
      flag: flag,
      amount: amount,
    };

    await setModalData(modalData);
    await setVisible(!visible);
    await setAddress('');
    await setAmount(0);
    await setError({});
    await setLoading(false);
  };

  useEffect(async () => {
    await setAddress('');
    await setAmount(0);
    await setError({});
  }, [isFocused, props]);
  useEffect(() => {
    setError(errors);
  }, [errors, isFocused, props]);
  useEffect(() => {
    socket.socket.on('sent_money', async item => {
      await dispatch(getUser(item.id));
      await onShowModal(item.owner, item.method, item.amount);
    });
    socket.socket.on('failed_transfer', item => {
      setError(item);
    });
  }, [socket, isFocused, props]);
  return (
    <>
      <TransferModal
        item={modalData}
        visible={visible}
        setVisible={setVisible}
      />
      <Header text="TRANSFER" navigation={navigation} />
      <ScrollView>
        <View style={styles.container}>
          <View>
            <Text style={styles.headText}>TRANSFER</Text>
          </View>
          <View>
            <View style={styles.userDiv}>
              <Text style={styles.labelText}>From</Text>
              <Input
                placeholder="Please input address"
                value={
                  store.user.address
                    ? store.user.address.substring(0, 6) +
                      '....' +
                      store.user.address.substring(
                        store.user.address.length - 6,
                        store.user.address.length,
                      )
                    : ''
                }
                disabled
              />
            </View>
            <View>
              <Text style={styles.labelText}>To</Text>
              <Input
                value={
                  address
                    ? address.substring(0, 6) +
                      '....' +
                      address.substring(address.length - 6, address.length)
                    : ''
                }
                placeholder="Please input address"
                onChangeText={message => {
                  setAddress(message);
                }}
                errorStyle={{color: 'red'}}
                errorMessage={error.address}
              />
            </View>

            <View>
              <Text style={styles.labelText}>Balance</Text>
              <Input
                value={amount.toString()}
                placeholder="Please input blance"
                onChangeText={message => {
                  setAmount(message);
                }}
                errorStyle={{color: 'red'}}
                keyboardType="numeric"
                errorMessage={error.amount}
                rightIcon={
                  <SelectDropdown
                    data={celldata}
                    rowStyle={{
                      height: 40,
                      color: 'white',
                    }}
                    renderDropdownIcon={() => {
                      return (
                        <FontAwesome
                          name="chevron-down"
                          color={'#444'}
                          size={18}
                        />
                      );
                    }}
                    buttonStyle={{
                      color: 'white',
                      backgroundColor: 'white',
                      textAlign: 'left',
                      borderWidth: 1,
                      borderRadius: 5,
                      height: 40,
                      width: 90,
                    }}
                    rowTextStyle={{color: 'black'}}
                    onSelect={(selectedItem, index) => {
                      if (selectedItem === 'HDT') {
                        setSelected('hdt');
                      } else if (selectedItem === 'ETH') {
                        setSelected('eth');
                      }
                    }}
                    defaultButtonText={celldata[0]}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      // text represented after item is selected
                      // if data array is an array of objects then return selectedItem.property to render after item is selected
                      return selectedItem;
                    }}
                    dropdownIconPosition="right"
                    rowTextForSelection={(item, index) => {
                      // text represented for each item in dropdown
                      // if data array is an array of objects then return item.property to represent item in dropdown
                      return item;
                    }}
                  />
                }
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButtonStyle}
            disabled={loading ? true : false}
            activeOpacity={0.5}
            onPress={() => {
              send();
            }}>
            <Text style={styles.TextStyle}>Send</Text>
            {loading ? (
              <ActivityIndicator animating={true} size={13} color={'white'} />
            ) : (
              <></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};
export default Transfer;
