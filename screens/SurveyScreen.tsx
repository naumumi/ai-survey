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

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    console.log("Submission values:", {
        name,
        birthDate: getFormattedDate(birthDateObject),
        education,
        city,
        gender,
        selectedModels,
        modelCons,
        useCase,
        suspicious: isAnyInputSuspicious(),
        canSubmit: canSubmit()
      });
      


      if (isAnyInputSuspicious()) {
        // Commented out:
        // Alert.alert('Error','Input contains suspicious or disallowed content. Please revise.');
      
        // Add a visible error message instead:
        setErrorMessage('Input contains suspicious or disallowed content.');
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
        //Alert.alert('Success', 'Survey submitted successfully!');
        // Clear inputs on success
            setErrorMessage(''); // 
            setSuccessMessage('Survey submitted successfully!');
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
  
        {/* Identifier Field */}
        <TextInput
          placeholder="User Identifier (email or phone)"
          value={name}
          editable={false}
          style={[styles.input, { backgroundColor: '#f0f0f0' }]}
          testID="SurveyScreen_NameInput"
          accessibilityLabel='SurveyScreen_NameInput'
          accessible={true}
        />
  
        {/* Birth Date Field */}
        <TextInput
  placeholder="Birth Date (YYYY-MM-DD)"
  value={birthDateObject ? getFormattedDate(birthDateObject) : ''}
  onChangeText={(text) => {
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
      setBirthDateObject(parsed);
    } else {
      setBirthDateObject(null);
    }
  }}
  style={styles.input}
  testID="SurveyScreen_BirthDateInput"
  accessibilityLabel='SurveyScreen_BirthDateInput'
  accessible={true}
/>

  
        {/* Education Field */}
        <TextInput
          placeholder="Education Level"
          value={education}
          onChangeText={setEducation}
          style={styles.input}
          testID="SurveyScreen_EducationInput"
            accessibilityLabel='SurveyScreen_EducationInput'
            accessible={true}
        />
  
        {/* City Field */}
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          style={styles.input}
          testID="SurveyScreen_CityInput"
            accessibilityLabel='SurveyScreen_CityInput'
            accessible={true}
        />
  
        {/* Gender Field */}
        <TextInput
          placeholder="Gender"
          value={gender}
          onChangeText={setGender}
          style={styles.input}
          testID="SurveyScreen_GenderInput"
            accessibilityLabel='SurveyScreen_GenderInput'
            accessible={true}
        />
  
        {/* AI Models */}
        {aiModels.map((model) => (
  <TouchableOpacity
    key={model}
    style={styles.checkboxContainer}
    onPress={() => toggleModel(model)}
    testID={`SurveyScreen_ModelCheckbox_${model}`}
    accessibilityLabel={`SurveyScreen_ModelCheckbox_${model}`}
    accessible={true}
  >
    <Checkbox
      status={selectedModels.includes(model) ? 'checked' : 'unchecked'}
      onPress={() => toggleModel(model)}
    />
    <Text>{model}</Text>
  </TouchableOpacity>
))}
  
        {/* Cons for each selected model */}
                {selectedModels.map((model) => (
        <TextInput
            key={model}
            placeholder={`Cons of ${model}`}
            value={modelCons[model] || ''}
            onChangeText={(text) => setModelCons({ ...modelCons, [model]: text })}
            style={styles.input}
            testID={`SurveyScreen_ConsInput_${model}`} //
            accessibilityLabel={`SurveyScreen_ConsInput_${model}`}
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
  testID="SurveyScreen_UseCaseInput" // <---- EKLE
  accessibilityLabel="SurveyScreen_UseCaseInput"
/>
  
        {/* Submit Button */}
        <TouchableOpacity
  onPress={handleSubmit}
  //disabled={!canSubmit()}
  testID="SurveyScreen_SendButton"
  accessibilityLabel="SurveyScreen_SendButton"
  style={[
    styles.sendButton,
    { backgroundColor: canSubmit() ? '#2196F3' : '#aaa' }
  ]}
>
  <Text style={styles.sendButtonText}>Send</Text>
</TouchableOpacity>

{errorMessage !== '' && (
  <Text
    style={{ color: 'red', marginTop: 10, textAlign: 'center' }}
    testID="SurveyScreen_ErrorMessage"
    accessibilityLabel="SurveyScreen_ErrorMessage"
  >
    {errorMessage}
  </Text>
)}

{successMessage !== '' && (
  <Text
    style={{ color: 'green', marginTop: 10, textAlign: 'center' }}
    testID="SurveyScreen_SuccessMessage"
    accessibilityLabel="SurveyScreen_SuccessMessage"
  >
    {successMessage}
  </Text>
)}

  
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
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 60,
    },
    heading: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 10,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginBottom: 8,
    },
    label: {
      marginTop: 10,
      fontWeight: '500',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    warning: {
      textAlign: 'center',
      color: '#999',
      marginTop: 8,
      fontSize: 13,
    },
    sendButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    sendButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    }
  });
  