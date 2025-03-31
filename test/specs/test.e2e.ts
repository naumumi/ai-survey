import { expect, browser, $ } from '@wdio/globals';

describe('SurveyScreen Tests', () => {
    before(async () => {
        // Wait for the app to load
        await browser.pause(3000);

        // Print page source to check what's on screen
        const pageSource = await browser.getPageSource();
        console.log('CURRENT PAGE SOURCE:', pageSource);

        // Navigate from Login to Survey screen

        // Locate login fields using Android resource-id locators.
        const identifierInput = await $('android=new UiSelector().resourceId("identifier")');
        await identifierInput.setValue('testumut@example.com');

        const passwordInput = await $('android=new UiSelector().resourceId("password")');
        await passwordInput.setValue('123');

        // Locate the login button using the content-desc value "LOGIN"
        const loginButton = await $('android=new UiSelector().description("LOGIN")');
        await loginButton.click();

        // Wait for navigation to complete
        await browser.pause(2000);
    });

    it('should display all required fields on the SurveyScreen', async () => {
        // Verify the presence of the Name input field using its resource-id.
        const nameInput = await $('android=new UiSelector().resourceId("SurveyScreen_NameInput")');
        await expect(nameInput).toBeDisplayed();

        // Verify the presence of the Birth Date input field.
        const birthDateInput = await $('android=new UiSelector().resourceId("SurveyScreen_BirthDateInput")');
        await expect(birthDateInput).toBeDisplayed();

        // Verify the presence of the Education input field.
        const educationInput = await $('android=new UiSelector().resourceId("SurveyScreen_EducationInput")');
        await expect(educationInput).toBeDisplayed();

        // Verify the presence of the City input field.
        const cityInput = await $('android=new UiSelector().resourceId("SurveyScreen_CityInput")');
        await expect(cityInput).toBeDisplayed();

        // Verify the presence of the Gender input field.
        const genderInput = await $('android=new UiSelector().resourceId("SurveyScreen_GenderInput")');
        await expect(genderInput).toBeDisplayed();

        // Verify the presence of the "Send" button.
        const sendButton = await $('android=new UiSelector().resourceId("SurveyScreen_SendButton")');
        await expect(sendButton).toBeDisplayed();
    });
});