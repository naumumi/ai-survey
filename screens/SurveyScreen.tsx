// screens/SurveyScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import * as MailComposer from 'expo-mail-composer';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios'; // at the top if not imported

type RootStackParamList = { Survey: { user: string } };
type SurveyRouteProp = RouteProp<RootStackParamList, 'Survey'>;

const aiModels = ['ChatGPT', 'Bard', 'Claude', 'Copilot'];

const SurveyScreen = () => {
  const route = useRoute<SurveyRouteProp>();
  const user = route.params.user;

  const [name, setName] = useState(user || '');
  const [birthDate, setBirthDate] = useState('');
  const [education, setEducation] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelCons, setModelCons] = useState<{ [key: string]: string }>({});
  const [useCase, setUseCase] = useState('');

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
      const updatedCons = { ...modelCons };
      delete updatedCons[model];
      setModelCons(updatedCons);
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const canSubmit = () => {
    return (
      name.trim() &&
      birthDate.trim() &&
      education.trim() &&
      city.trim() &&
      gender.trim() &&
      selectedModels.length > 0 &&
      selectedModels.every((m) => modelCons[m]?.trim()) &&
      useCase.trim()
    );
  };

  const handleSubmit = async () => {
    const payload = {
      user,
      name,
      birthDate,
      education,
      city,
      gender,
      models: selectedModels,
      modelCons,
      useCase,
    };
  
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/submit_survey', payload);
  
      if (response.data.success) {
        Alert.alert('Success', 'Survey submitted successfully!');
        console.log('Survey payload:', payload);
      } else {
        Alert.alert('Error', response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An error occurred while submitting the survey.');
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.heading}>AI Survey</Text>

        <TextInput
          placeholder="Name Surname"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Birth Date (e.g. 2000-01-01)"
          value={birthDate}
          onChangeText={setBirthDate}
          style={styles.input}
        />
        <TextInput
          placeholder="Education Level"
          value={education}
          onChangeText={setEducation}
          style={styles.input}
        />
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <TextInput
          placeholder="Gender"
          value={gender}
          onChangeText={setGender}
          style={styles.input}
        />

        <Text style={styles.label}>AI Models You Tried:</Text>
        {aiModels.map((model) => (
          <View key={model} style={styles.checkboxContainer}>
            <Checkbox
              status={selectedModels.includes(model) ? 'checked' : 'unchecked'}
              onPress={() => toggleModel(model)}
            />
            <Text onPress={() => toggleModel(model)}>{model}</Text>
          </View>
        ))}

        {selectedModels.map((model) => (
          <TextInput
            key={model}
            placeholder={`Cons of ${model}`}
            value={modelCons[model] || ''}
            onChangeText={(text) => setModelCons({ ...modelCons, [model]: text })}
            style={styles.input}
          />
        ))}

        <TextInput
          placeholder="Any use case of AI that is beneficial in daily life"
          value={useCase}
          onChangeText={setUseCase}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />

        <Button
          title="Send"
          onPress={handleSubmit}
          disabled={!canSubmit()}
          color={canSubmit() ? '#2196F3' : '#aaa'}
        />

        {!canSubmit() && (
          <Text style={styles.warning}>
            Please fill in all fields to enable submission.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SurveyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warning: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});
