import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }: any) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const payload: any = { password };
    if (method === 'email') {
      if (!email.trim()) {
        Alert.alert("Error", "Email is required.");
        return;
      }
      payload.email = email.trim();
    } else {
      if (!phone.trim()) {
        Alert.alert("Error", "Phone is required.");
        return;
      }
      payload.phone = phone.trim();
    }

    try {
        console.log("Registering with payload:", payload);
      const res = await axios.post('http://10.0.2.2:5000/api/register', payload)

      console.log("Registration response:", res);
      if (res.data.success) {
        Alert.alert("Success", "Registration successful! Redirecting to login...");
        navigation.navigate('Login');
      } else {
        Alert.alert("Registration Failed", res.data.message || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Button
          title="Use Email"
          onPress={() => setMethod('email')}
        />
        <View style={{ width: 10 }} />
        <Button
          title="Use Phone"
          onPress={() => setMethod('phone')}
        />
      </View>

      {method === 'email' && (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      )}

      {method === 'phone' && (
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
        />
      )}

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirm Password"
        value={confirm}
        onChangeText={setConfirm}
      />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24, 
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
    padding: 10,
  },
});
