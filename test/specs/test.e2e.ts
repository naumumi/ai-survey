import { expect, browser, $ } from '@wdio/globals';

const pkg = 'com.naumumi.aisurvey';

describe('SurveyScreen Tests', () => {
  before(async () => {
    await browser.pause(3000);

    const identifierInput = await $('~identifier');
    await identifierInput.setValue('kerem.tekik@ug.bilkent.edu.tr');

    const passwordInput = await $('~password');
    await passwordInput.setValue('123');

    const loginButton = await $('android=new UiSelector().description("LOGIN")');
    await loginButton.click();

    // Wait for SurveyScreen to appear
    const nameField = await $('~SurveyScreen_NameInput');
    await nameField.waitForDisplayed({ timeout: 10000 });
  });

  it('UI Testing: should display all required fields on the SurveyScreen', async () => {
    await expect($('~SurveyScreen_NameInput')).toBeDisplayed();
    await expect($('~SurveyScreen_BirthDateInput')).toBeDisplayed();
    await expect($('~SurveyScreen_EducationInput')).toBeDisplayed();
    await expect($('~SurveyScreen_CityInput')).toBeDisplayed();
    await expect($('~SurveyScreen_GenderInput')).toBeDisplayed();
    await expect($('~SurveyScreen_UseCaseInput')).toBeDisplayed(); // Added
    await expect($('~SurveyScreen_ModelCheckbox_ChatGPT')).toBeDisplayed(); // Added
    await expect($('~SurveyScreen_SendButton')).toBeDisplayed();
  });

  it('User Validation: name field should be readonly and valid inputs should allow submission', async () => {
    const nameInput = await $('~SurveyScreen_NameInput');
    const nameValue = await nameInput.getText();
    await expect(nameInput).toBeDisplayed();
    await expect(nameValue).toContain('@');

    

    try {
      await nameInput.setValue('fakechange@example.com');
    } catch (_) {}

    const unchangedValue = await nameInput.getText();
    expect(unchangedValue).toBe(nameValue);
  });

  //  all valid inputs and a successful submission. name: Input validation
  it('Input Validation: should accept valid inputs and submit successfully', async () => {
    await $('~SurveyScreen_EducationInput').setValue('Bachelor');
    await $('~SurveyScreen_BirthDateInput').setValue('2000-01-01');
    await $('~SurveyScreen_CityInput').setValue('istanbul');
    await $('~SurveyScreen_GenderInput').setValue('Male');
    await $('~SurveyScreen_UseCaseInput').setValue('Fun');
  
    await $('~SurveyScreen_ModelCheckbox_ChatGPT').click();
  
    await browser.waitUntil(async () => {
      const el = await $('~SurveyScreen_ConsInput_ChatGPT');
      return await el.isDisplayed();
    }, {
      timeout: 7000,
      timeoutMsg: 'ConsInput_ChatGPT not visible in time'
    });
  
    await $('~SurveyScreen_ConsInput_ChatGPT').setValue('Slow');
  
    const sendButton = await $('~SurveyScreen_SendButton');
  
    await browser.waitUntil(async () => await sendButton.isEnabled(), {
      timeout: 5000,
      timeoutMsg: 'Send button never became enabled'
    });
  
    await sendButton.click();
  
    //  Wait for and assert success message
    const successText = await $('~SurveyScreen_SuccessMessage');
    await successText.waitForDisplayed({ timeout: 5000 });
    expect(await successText.getText()).toContain('Survey submitted successfully');
  });
  


  it('Injection Protection: should not accept suspicious input', async () => {
    await $('~SurveyScreen_EducationInput').setValue('DROP TABLE users;');
    await $('~SurveyScreen_BirthDateInput').setValue('2000-01-01');
    await $('~SurveyScreen_CityInput').setValue('NormalCity');
    await $('~SurveyScreen_GenderInput').setValue('Male');
    await $('~SurveyScreen_UseCaseInput').setValue('Assistant');
  
    await $('~SurveyScreen_ModelCheckbox_ChatGPT').click();
  
    await browser.waitUntil(async () => {
      try {
        const el = await $('~SurveyScreen_ConsInput_ChatGPT');
        return await el.isDisplayed();
      } catch {
        return false;
      }
    }, {
      timeout: 7000,
      timeoutMsg: 'ConsInput_ChatGPT not visible in time'
    });
  
    await $('~SurveyScreen_ConsInput_ChatGPT').setValue('Slow');
  
    const sendButton = await $('~SurveyScreen_SendButton');
    await sendButton.click();
  
    const errorText = await $('~SurveyScreen_ErrorMessage');
    await errorText.waitForDisplayed({ timeout: 5000 });
    expect(await errorText.getText()).toContain('suspicious');
  });
  
  
  // fast clicking test. should not crash on fast submitting.

  it('Fast Clicking: should not crash on fast submitting', async () => {
    await $('~SurveyScreen_EducationInput').setValue('Bachelor');
    await $('~SurveyScreen_BirthDateInput').setValue('2000-01-01');
    await $('~SurveyScreen_CityInput').setValue('ankara');
    await $('~SurveyScreen_GenderInput').setValue('Male');
    await $('~SurveyScreen_UseCaseInput').setValue('sana ne');
    
    await browser.waitUntil(async () => {
        const btn = await $('~SurveyScreen_SendButton');
        return await btn.isEnabled();
      }, {
        timeout: 5000,
        timeoutMsg: 'Send button never became enabled'
      });
      
  });
  
});
