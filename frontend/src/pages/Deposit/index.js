import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Text, View, TouchableOpacity} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import {Input} from 'react-native-elements';
import {Picker} from '@react-native-community/picker';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import {DepositModal} from '../../components/DepositModal';
import {ErrorModal} from '../../components/ErrorModal';
import {message} from '../../constant/message';
import {BigNumber, ethers} from 'ethers';
import {hdtABI, usdtABI} from '../../constant/ABI';
const Tx = require('ethereumjs-tx').Transaction;
import styles from './styles';
const Deposit = ({navigation, props}) => {
  const isFocused = useIsFocused();
  const adminaddress = '0x9C817E9A34ED3f6da12B09B4fcB6B90da461bAc6';
  const hdtContractAddress = '0x08895697055b82890a312dfc9f52df907d8fd001';
  const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myBalance, setMyBalance] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [selected, setSelected] = useState('eth');
  const [visible, setVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [modalData, setModalData] = useState('');
  const [errorData, setErrorData] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState({});
  const store = useSelector(state => state.auth);
  const profile = useSelector(state => state.profile);
  const errors = useSelector(state => state.errors);
  const web3 = useSelector(state => state.web3);
  const socket = useSelector(state => state.socket);
  const onCopyText = flag => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };
  const copyToClipboard = (value, flag) => {
    onCopyText(flag);
    Clipboard.setString(value);
  };
  const onSubmit = async () => {
    if (Number(myBalance) === 0) {
      setError({amount: 'Please input correct balance'});
    } else {
      setLoading(true);

      if (selected === 'eth') {
        if (Number(maxValue) === 0) {
          setError({amount: 'Please input correct balance'});
        } else {
          const amount = await web3.web3.utils.toWei(
            maxValue.toString(),
            'ether',
          );
          const transactionObject = {
            from: profile.profiledata.address,
            to: adminaddress,
            value: amount,
          };
          var estimatedGas = await web3.web3.eth.estimateGas(transactionObject);
          const tx = {
            from: profile.profiledata.address,
            to: adminaddress,
            value: amount,
            gas: estimatedGas,
          };

          const privatekey = profile.profiledata.privateKey.substring(
            2,
            profile.profiledata.privateKey.length,
          );

          web3.web3.eth.accounts
            .signTransaction(tx, privatekey)
            .then(signedTx => {
              const sentTx = web3.web3.eth.sendSignedTransaction(
                signedTx.raw || signedTx.rawTransaction,
              );
              sentTx.on('receipt', async receipt => {
                const data = {
                  id: store.user.id,
                  address: profile.profiledata.address,
                  flag: selected,
                  amount: amount / 10 ** 18,
                };

                await socket.socket.emit('deposit', data);
                await showModal(selected, Number(amount / 10 ** 18));
                await setBalance(profile, web3, selected);
              });
              sentTx.on('error', err => {
                showErrorModal(err.message);
                // do something on transaction error
              });
            });
        }

        // var tx = new Tx(rawTransaction, {chain: 'ropsten'});

        // var privKey = Buffer.from(privatekey, 'hex');
        // console.log(privKey);
        // tx.sign(privKey);

        // const serializedTx = `0x${tx.serialize().toString('hex')}`;
        // const tran = web3.web3.eth.sendSignedTransaction(serializedTx);

        // tran.on('transactionHash', async hash => {});

        // tran.on('receipt', async receipt => {
        //   const data = {
        //     id: store.user.id,
        //     address: profile.profiledata.address,
        //     flag: selected,
        //     amount: maxVal / 10 ** 18,
        //   };

        //   await socket.socket.emit('deposit', data);
        //   await showModal(selected, Number(maxVal / 10 ** 18));
        //   await setBalance(profile, web3, selected);
        // });

        // tran.on('error', err => {
        //   console.log(err);
        //   // ;
        // });
      } else if (selected === 'hdt') {
        ////////////////////////////
        const myAddress = '0xE34440801560549F7d575Aa449562536346c0777';
        const destAddress = '0x9C817E9A34ED3f6da12B09B4fcB6B90da461bAc6';
        const privatekey =
          'e1aa9022d303c6bedd2503b24d92be7bd28d1f84a48bd3f56608ff9264926354';

        web3.web3.eth.accounts.wallet.add(privatekey);
        const contract = new web3.web3.eth.Contract(
          usdtABI,
          usdtContractAddress,
        );
        const gasLimit = await contract.methods
          .transfer(destAddress, 10 ** 6 * 10) // the contract function
          .estimateGas({from: myAddress}); // the transaction object

        contract.method
          .transfer(destAddress, 10 ** 6 * 10)
          .send({from: myAddress, gas: gasLimit}, function (error, result) {
            //get callback from function which is your transaction key
            if (!error) {
              console.log(result);
            } else {
              console.log(error);
            }
          });
        //Finally, you can check if usdt tranaction success through this code.
        // tokenInst.methods.balanceOf(receiver).call().then(console.log)
        // .catch(console.error);
        // var count = await web3.web3.eth.getTransactionCount(myAddress);
        // var transfer = contract.methods.transfer(destAddress, 10 ** 6 * 10);
        // var encodedABI = transfer.encodeABI();
        // var gasPrice = await web3.web3.eth.getGasPrice();
        // const gasLimit = await contract.methods
        //   .transfer(destAddress, 10 ** 6 * 10) // the contract function
        //   .estimateGas({from: myAddress}); // the transaction object
        // console.log(gasLimit);
        // var rawTransaction = {
        //   from: myAddress,
        //   to: hdtContractAddress,
        //   data: encodedABI,
        //   nonce: '0x' + count.toString(16),
        //   gasPrice: gasPrice,
        //   gas: gasLimit,
        //   // chainId: 1,
        // };

        // web3.web3.eth.accounts
        //   .signTransaction(rawTransaction, privatekey)
        //   .then(async signedTx => {
        //     await web3.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        //   })
        //   .then(function (receipt) {
        //     console.log('Transaction receipt: ', receipt);
        //   })
        //   .then(async req => {
        //     /* The trx was done. Write your acctions here. For example getBalance */
        //     const balance = await contract.methods
        //       .balanceOf(destAddress)
        //       .call();
        //     await setBalance(profile, web3, selected);
        //     return true;
        //   });

        ////////////////////////
      } else if (selected === 'usdt') {
      }
    }
  };

  const showModal = async (flag, amount) => {
    const modalData = {
      message: message[2].message,
      content: message[2].content,
      flag: flag,
      amount: amount,
    };
    await setModalData(modalData);
    await setVisible(!visible);
    await setError({});
  };
  const showErrorModal = async message => {
    const modalData = {
      message: message,
    };
    await setErrorData(modalData);
    await setErrorVisible(!errorVisible);
    await setError({});
    await setLoading(false);
  };

  useEffect(() => {
    setError(errors);
  }, [errors]);
  useEffect(async () => {
    let isMount = true;
    if (isMount) {
      if (profile.profiledata && web3) {
        await setBalance(profile, web3, selected);
        await setMaxBalance(profile, web3, selected);
      }
    }
    return () => {
      isMount = false;
    };
  }, [web3, profile, props, isFocused]);
  const setBalance = async (profile, web3, selected) => {
    if (selected === 'eth') {
      const price = await web3.web3.eth.getBalance(profile.profiledata.address);
      await setMyBalance(ethers.utils.formatEther(BigNumber.from(price)));
      await setLoading(false);
    } else if (selected === 'hdt') {
      const contract = new web3.web3.eth.Contract(hdtABI, hdtContractAddress);
      const result = await contract.methods
        .balanceOf('0x17b546D3179ca33b542eD6BD9fE6656fb5D5b70E')
        .call(); // 29803630997051883414242659
      const format = web3.web3.utils.fromWei(result); // 29803630.997051883414242659

      await setMyBalance(format);
      await setLoading(false);
    }
  };
  const setMaxBalance = async (profile, web3, selected) => {
    if (selected === 'eth') {
      web3.web3.eth
        .getBalance(profile.profiledata.address)
        .then(async wei => {
          const balance = web3.web3.utils.fromWei(wei, 'ether');
          const transactionObject = {
            from: profile.profiledata.address,
            to: adminaddress,
            value: wei,
          };
          var estimatedGas = await web3.web3.eth.estimateGas(transactionObject);
          const gasPrice = await web3.web3.eth.getGasPrice();
          var maxVal = Math.max(
            0,
            balance - (await web3.web3.utils.fromWei(gasPrice)) * estimatedGas,
          );

          setMaxValue(maxVal);
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  return (
    <>
      <DepositModal
        item={modalData}
        visible={visible}
        setVisible={setVisible}
      />
      <ErrorModal
        item={errorData}
        visible={errorVisible}
        setVisible={setErrorVisible}
      />
      <Header text="DEPOSIT" navigation={navigation} />

      <View style={styles.container}>
        <View>
          <Text style={styles.headText}>Deposit</Text>
        </View>

        <View style={styles.userDiv}>
          <Text style={styles.txt}>Wallet Address</Text>
          <Input
            value={
              profile.profiledata.address
                ? profile.profiledata.address.substring(0, 6) +
                  '....' +
                  profile.profiledata.address.substring(
                    profile.profiledata.address.length - 6,
                    profile.profiledata.address.length,
                  )
                : ''
            }
            disabled
            onChangeText={message => {
              setAddress(message);
            }}
            rightIcon={
              <Icon
                name={isCopied ? 'check' : 'copy'}
                onPress={() => {
                  copyToClipboard(profile.profiledata.address, 'address');
                }}
                size={24}
                color="gray"
              />
            }
          />
          <Text style={styles.txt}>Wallet Balance</Text>
          <Input
            value={Number(myBalance).toFixed(2).toString()}
            disabled
            rightIcon={
              <Picker
                style={{width: 100}}
                selectedValue={selected}
                onValueChange={async itemValue => {
                  await setLoading(true);
                  await setSelected(itemValue);
                  await setBalance(profile, web3, itemValue);
                }}>
                <Picker.Item label="ETH" value="eth" />
                <Picker.Item label="HDT" value="hdt" />
              </Picker>
            }
            errorMessage="Please deposit on the above eth address and wait for the network confirmation to upload funds"
          />
        </View>
        <TouchableOpacity
          style={styles.submitButtonStyle}
          disabled={loading ? true : false}
          activeOpacity={0.5}
          onPress={() => {
            onSubmit();
          }}>
          <Text style={styles.TextStyle}>Upload Funds</Text>
          {loading ? (
            <ActivityIndicator animating={true} size={13} color={'white'} />
          ) : (
            <></>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};
export default Deposit;
