# AI Survey App - README

## Project Overview

This is a React Native mobile application built with Expo that collects survey data about AI usage. The app includes Google authentication and a survey form with various input fields for demographic information and AI model preferences.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) 
- [Android Studio](https://developer.android.com/studio) (for Android development and emulation)
- JDK 11 or newer
- [Appium](https://appium.io/) (for running tests)
- [Python](https://www.python.org/) (v3.8 or newer)
- [pip](https://pip.pypa.io/en/stable/) (Python package manager)

## Installation

1. Clone or download the project zip file
2. Navigate to the project directory:
   ```
   cd ai-survey
   ```
3. Install dependencies using npx:
   ```
   npx expo install
   ```

## Required Dependencies

The project uses the following key dependencies (install using `npx expo install`):

- `@react-native-google-signin/google-signin`
- `expo-status-bar`
- `react-native`

For testing:
- `@wdio/globals`
- WebdriverIO dependencies (Appium)

For backend: navigate to the /backend folder:
- `cd backend`

Create virtual environment:
- `python -m venv venv`

Activate the virtual environment:
- `venv\Scripts\activate` (windows)

Install required dependencies:
- `pip install -r requirements.txt` 


## Running the Application

## Backend

1. Run the backend server:
- `python app.py` 

### Android

To run the application on an Android emulator or connected device:

1. Start an Android emulator or connect an Android device via USB (with debugging enabled)

2. Run the following command:
   ```bash
   npx expo run:android
   ```

If you encounter any build issues, try cleaning the project first:
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

## Testing

### WebdriverIO Configuration

Before running the tests, you need to configure WebdriverIO. Make sure your `wdio.conf.ts` file contains the following capabilities configuration:

```typescript
capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Android GoogleAPI Emulator',
    'appium:platformVersion': '14.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': '/path/to/your/ai-survey/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:noReset': true
}],
```

**Note:** Replace `/path/to/your/` with the actual path to your project directory.

### Running Tests

To run the end-to-end tests:

1. Make sure you have an Android emulator running or a device connected
2. Build the app in debug mode:
   ```bash
   npx expo run:android
   ```
3. Run:
   ```
   npx appium
   ```
3. Run the tests with WebdriverIO:
   ```bash
   npx wdio run ./wdio.conf.ts
   ```

## Important Note:
For testing the email sending functionality, you may change the email address which the email will be sent to.

## Project Structure

- `/components` - React Native components including Auth.tsx for Google authentication
- `/android` - Android-specific configuration and build files
- `/screens` - Related screens including Login and Survey screen
- `/test` - End-to-end tests using WebdriverIO
- App.tsx - Main application component
- index.ts - Entry point registering the root component

## Troubleshooting

### Common Issues

1. **Android Build Errors**:
   - Ensure Android SDK tools are properly installed
   - Create a `local.properties` file in the `android` directory with `sdk.dir=/path/to/your/Android/sdk`
   - Try updating Gradle version if necessary

2. **Testing Issues**:
   - Ensure Appium is properly installed and running
   - Verify your emulator matches the configuration in `wdio.conf.ts`
   - Check that the path to the APK file is correct in your WebdriverIO configuration


## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [Appium Documentation](https://appium.io/docs/en/about-appium/intro/)
