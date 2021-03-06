import React, {useState, useEffect} from 'react';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import {Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import styles from './styles';
import animal from '../../assets/img/animal.png';
import {userLogin, clearErrors} from '../../actions/authAction';
import {useTheme} from '@react-navigation/native';
const Login = ({navigation, props}) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [username, setUsername] = useState('jacky');
  const [password, setPassword] = useState('111111');
  const onLogin = () => {
    dispatch(userLogin(username, password, navigation));
  };
  const errors = useSelector(state => state.errors);
  // const store = useSelector(state => state.auth);
  // const {color} = useTheme();
  useEffect(() => {
    dispatch(clearErrors());
    // if (store.isAuthenticated) {
    //   navigation.navigate('Main');
    // }
  }, [isFocused, props]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          <Text style={styles.headText}>WELCOME!</Text>
        </View>
        <View style={styles.imgDiv}>
          <Image source={animal} />
        </View>
        <View>
          <Text style={styles.imgText}>HAPPY DOGE</Text>
        </View>
        <View style={styles.userDiv}>
          <Input
            value={username}
            placeholder="Username"
            onChangeText={message => {
              setUsername(message);
            }}
            errorStyle={{color: 'red'}}
            errorMessage={errors.name}
            textAlign={'center'}
            multiline={true}
          />

          <Input
            value={password}
            placeholder="Password"
            onChangeText={message => {
              setPassword(message);
            }}
            secureTextEntry={true}
            errorStyle={{color: 'red'}}
            errorMessage={errors.password}
            textAlign={'center'}
            // multiline={true}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButtonStyle}
          activeOpacity={0.5}
          onPress={onLogin}>
          <Text style={styles.TextStyle}>LOG IN</Text>
        </TouchableOpacity>
        <View style={styles.footertext}>
          <Text>New User Registration</Text>
          <Text
            style={styles.signDiv}
            onPress={() => navigation.navigate('Signup')}>
            Sign Up
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
