// LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Alert, 
  StyleSheet 
} from 'react-native';
import axios from 'axios';

// Google Sign-In
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// If using React Navigation:
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  // Add other screens if needed
};
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Configure Google Sign-In once on mount
  useEffect(() => {
    GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        webClientId: '410162307205-2ca2b5jhf1i65uisnldav89grnqdfu9t.apps.googleusercontent.com',
    });
  }, []);

  // Handle classic email/phone + password login
  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Email/Phone and Password are required');
      return;
    }

    try {
      const response = await axios.post('http://10.0.2.2:5000/api/login', {
        identifier,
        password,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Login successful!');
        // Navigate or do something else
        // navigation.navigate('SomeOtherScreen', { user: identifier });
      } else {
        Alert.alert('Login Failed', response.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  // Handle Google Sign-In from the mobile app
  const handleGoogleSignIn = async () => {
    try {
        console.log('Attempting Google Sign-In...');
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log(JSON.stringify(userInfo, null, 2));
        // get the idToken from the userInfo object
        const idToken = userInfo.data.idToken;
      if (!idToken) {
        Alert.alert('Google Sign-In Error', 'No idToken returned');
        return;
      }

      // Send the token to your Flask backend
      const response = await axios.post(
        'http://10.0.2.2:5000/api/google_signin_mobile',
        { idToken }
      );

      if (response.data.success) {
        Alert.alert('Google Login', 'Success! Welcome: ' + response.data.email);
        // Navigate or do something else
      } else {
        Alert.alert('Error', response.data.message || 'Google sign-in failed');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available
        Alert.alert('Error', 'Google Play Services not available or outdated');
      } else {
        // some other error happened
        console.error('Google Sign-In Error:', error);
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email or Phone"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={{ marginVertical: 16 }}>OR</Text>

      {/* Google Sign-In Button */}
      <GoogleSigninButton
        style={{ width: 230, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />

      <Text style={{ marginTop: 30 }}>
        Don’t have an account?
      </Text>
      <Button 
        title="Go to Register" 
        onPress={() => navigation.navigate('Register')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26, 
    marginBottom: 20 
  },
  input: {
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
});
