import { expect, browser, $ } from '@wdio/globals';

describe('SurveyScreen Tests', () => {
  before(async () => {
    await browser.pause(3000);

    const identifierInput = await $('android=new UiSelector().resourceId("identifier")');
    await identifierInput.setValue('kerem.tekik@ug.bilkent.edu.tr');

    const passwordInput = await $('android=new UiSelector().resourceId("password")');
    await passwordInput.setValue('123');

    const loginButton = await $('android=new UiSelector().description("LOGIN")');
    await loginButton.click();

    await browser.pause(3000);
  });

  it('UI Testing: should display all required fields on the SurveyScreen', async () => {
    const nameInput = await $('android=new UiSelector().resourceId("SurveyScreen_NameInput")');
    await expect(nameInput).toBeDisplayed();

    const birthDateInput = await $('android=new UiSelector().resourceId("SurveyScreen_BirthDateInput")');
    await expect(birthDateInput).toBeDisplayed();

    const educationInput = await $('android=new UiSelector().resourceId("SurveyScreen_EducationInput")');
    await expect(educationInput).toBeDisplayed();

    const cityInput = await $('android=new UiSelector().resourceId("SurveyScreen_CityInput")');
    await expect(cityInput).toBeDisplayed();

    const genderInput = await $('android=new UiSelector().resourceId("SurveyScreen_GenderInput")');
    await expect(genderInput).toBeDisplayed();

    const sendButton = await $('android=new UiSelector().resourceId("SurveyScreen_SendButton")');
    await expect(sendButton).toBeDisplayed();
  });

  it('Input Validation: name field should be readonly and valid inputs should allow submission', async () => {
    const nameInput = await $('android=new UiSelector().resourceId("SurveyScreen_NameInput")');
    const nameValue = await nameInput.getText();
    await expect(nameInput).toBeDisplayed();
    await expect(nameValue).toContain('@'); // basic check that it's email

    // Try to set name value — it should be blocked
    try {
      await nameInput.setValue('fakechange@example.com');
    } catch (err) {
      // Expected since editable={false}
    }
    const unchangedValue = await nameInput.getText();
    expect(unchangedValue).toBe(nameValue); // should not change
  });

  it('Injection Protection: should not accept suspicious input', async () => {
    const educationInput = await $('android=new UiSelector().resourceId("SurveyScreen_EducationInput")');
    await educationInput.setValue('DROP TABLE users;');

    const cityInput = await $('android=new UiSelector().resourceId("SurveyScreen_CityInput")');
    await cityInput.setValue('NormalCity');

    const genderInput = await $('android=new UiSelector().resourceId("SurveyScreen_GenderInput")');
    await genderInput.setValue('Male');

    const sendButton = await $('android=new UiSelector().resourceId("SurveyScreen_SendButton")');
    await sendButton.click();

    await browser.pause(1000);
    const pageSource = await browser.getPageSource();
    expect(pageSource).toContain('Input contains suspicious'); // frontend alert
  });

  it('Fast Clicking: should not crash on multiple rapid clicks on submit', async () => {
    const educationInput = await $('android=new UiSelector().resourceId("SurveyScreen_EducationInput")');
    await educationInput.setValue('University');

    const cityInput = await $('android=new UiSelector().resourceId("SurveyScreen_CityInput")');
    await cityInput.setValue('Ankara');

    const genderInput = await $('android=new UiSelector().resourceId("SurveyScreen_GenderInput")');
    await genderInput.setValue('Other');

    const useCaseInput = await $('android=new UiSelector().className("android.widget.EditText").instance(5)');
    await useCaseInput.setValue('Translation');

    const checkbox = await $('android=new UiSelector().text("ChatGPT")');
    await checkbox.click();

    const consInput = await $('android=new UiSelector().className("android.widget.EditText").instance(4)');
    await consInput.setValue('Sometimes makes up answers');

    const sendButton = await $('android=new UiSelector().resourceId("SurveyScreen_SendButton")');
    
    // Click rapidly 5 times
    for (let i = 0; i < 5; i++) {
      await sendButton.click();
    }

    await browser.pause(2000); // give backend time
    const successPage = await browser.getPageSource();
    expect(successPage).toContain('Survey submitted successfully!');
  });
});
