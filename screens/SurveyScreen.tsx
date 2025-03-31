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
  Platform,
  TouchableOpacity
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker';

type RootStackParamList = { Survey: { user: string } };
type SurveyRouteProp = RouteProp<RootStackParamList, 'Survey'>;

const aiModels = ['ChatGPT', 'Bard', 'Claude', 'Copilot'];

// A simple function to check for suspicious patterns.
// In production, rely primarily on backend checks.
const containsSuspiciousContent = (input: string): boolean => {
  const suspiciousPatterns = [
    '--', ';', '/*', '*/', 'DROP ', 'SELECT ', 'INSERT ', 'DELETE ', 'UPDATE ',
    '$where', '{', '}', '<script', '</script>'
  ];
  return suspiciousPatterns.some(pattern => input.toLowerCase().includes(pattern));
};

const SurveyScreen = () => {
  const route = useRoute<SurveyRouteProp>();
  const userParam = route.params.user;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDateObject, setBirthDateObject] = useState<Date | null>(null);

  const [name, setName] = useState(userParam || '');
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

  // Validate date (ensure the birth date is not in the future)
  const isValidBirthDate = (date: Date | null) => {
    if (!date) return false;
    return date <= new Date();
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type !== 'dismissed' && selectedDate) {
      setBirthDateObject(selectedDate);
    }
  };

  const getFormattedDate = (date: Date | null) => {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Combined front-end validations
  const canSubmit = (): boolean => {
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedGender = gender.trim();
    const validModelsSelected = selectedModels.length > 0;
    const allConsFilled = validModelsSelected
      ? selectedModels.every(m => modelCons[m]?.trim())
      : false;
    const validDate = isValidBirthDate(birthDateObject);
    const trimmedUseCase = useCase.trim();

    if (!trimmedName || !birthDateObject || !education.trim() || 
        !trimmedCity || !trimmedGender || !trimmedUseCase) {
      return false;
    }

    if (!validModelsSelected || !allConsFilled) {
      return false;
    }

    return validDate;
  };

  // Check for suspicious input in all fields
  const isAnyInputSuspicious = (): boolean => {
    const fieldsToCheck = [
      name,
      education,
      city,
      gender,
      useCase,
      ...Object.values(modelCons)
    ];
    return fieldsToCheck.some(containsSuspiciousContent);
  };

  const handleSubmit = async () => {
    // Check for suspicious input and show pop-up if found.
    if (isAnyInputSuspicious()) {
      Alert.alert(
        'Error',
        'Input contains suspicious or disallowed content. Please revise.'
      );
      return;
    }

    if (!canSubmit()) {
      Alert.alert(
        'Error',
        'Please fill all fields correctly before submitting.'
      );
      return;
    }

    const payload = {
      user: userParam,
      name: name.trim(),
      birthDate: getFormattedDate(birthDateObject),
      education: education.trim(),
      city: city.trim(),
      gender: gender.trim(),
      models: selectedModels,
      modelCons,
      useCase: useCase.trim(),
    };

    try {
      const response = await axios.post('http://10.0.2.2:5000/api/submit_survey', payload);
      if (response.data.success) {
        Alert.alert('Success', 'Survey submitted successfully!');
        // Clear inputs on success
        setName(userParam || '');
        setBirthDateObject(null);
        setEducation('');
        setCity('');
        setGender('');
        setSelectedModels([]);
        setModelCons({});
        setUseCase('');
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

        {/* Name Field */}
        <TextInput
          placeholder="Name Surname"
          value={name}
          onChangeText={setName}
          style={styles.input}
          testID="SurveyScreen_NameInput" // Added testID
        />

        {/* Birth Date Field (Date Picker) */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <View pointerEvents="none">
            <TextInput
              placeholder="Birth Date"
              value={getFormattedDate(birthDateObject)}
              style={styles.input}
              editable={false}
              testID="SurveyScreen_BirthDateInput" // Added testID
            />
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDateObject || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()} // Prevents selection of future dates
            onChange={onDateChange}
          />
        )}

        {/* Education Field */}
        <TextInput
          placeholder="Education Level"
          value={education}
          onChangeText={setEducation}
          style={styles.input}
          testID="SurveyScreen_EducationInput" // Added testID
        />

        {/* City Field */}
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          style={styles.input}
          testID="SurveyScreen_CityInput" // Added testID
        />

        {/* Gender Field */}
        <TextInput
          placeholder="Gender"
          value={gender}
          onChangeText={setGender}
          style={styles.input}
          testID="SurveyScreen_GenderInput" // Added testID
        />

        {/* AI Models */}
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

        {/* Cons for each selected model */}
        {selectedModels.map((model) => (
          <TextInput
            key={model}
            placeholder={`Cons of ${model}`}
            value={modelCons[model] || ''}
            onChangeText={(text) => setModelCons({ ...modelCons, [model]: text })}
            style={styles.input}
          />
        ))}

        {/* Use Case Field */}
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
          testID="SurveyScreen_SendButton" // Added testID
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
