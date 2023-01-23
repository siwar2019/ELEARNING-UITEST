const playwright = require('playwright');
const chai = require('chai');
const fn = require('../../utils/utils')

let page;
let browser;
let regLink = '';
let account = '';
let username = '';
let courseTitle = '';
let emailUser1 = 'autotestga@inctec.de';
let password2User1 = 'tgAT6574_zu_2010';
let usernameUser1 = 'autotestga@inctec.de';
var log = console.log;
console.log = function () {
  log.apply(console, arguments);
  // Print the stack trace
  console.trace();
};
describe("gaTestRegistrationLinksRemainingAfterAccountDeletion-36", () => {
  before(async function fnc() {
    this.timeout(30000);
    browser = await playwright[process.env.TEST_BROWSER].launch({
      headless: false,
      slowMo: 10
    });
    const context = await browser.newContext({
      acceptDownloads: true
    });
    page = await context.newPage();
    await page
      .goto(process.env.TEST_URL + "login", {
        waitUntil: "networkidle0",
      })
      .catch(() => {
        courseTitle
      });
    await fn.login({ password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page });
    courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(1000, 9999);

    account = await fn.createAccount(page);
  });
  afterEach(async function afterFn() {
    this.timeout(200000);
    if (this.currentTest.state === 'failed') {
      await fn.deleteAllRemain(page)
    }
  });
  after(async () => {
    await fn.deleteAllRemain(page)

    if (!page.isClosed()) {

      browser.close();
    }
  });
  /*
 Test Case ID: #TestCase01
 Test Scenario: create account
 Test Steps:
     *make sure that Admin nav exists  
     *Define links 
     *Click on button create account
     *edit course to be event
     *affectTrainer to it
 Prerequisites:  have to be login in
 Test Data: Account details 
 ExpectedResults: Account created.
*/
  it("create account", async () => {

    //*******Arrange******* */
    await fn.delay(1000);
    await fn.goToAdminNavigation(page);
    await page.click('.navbar div:nth-child(2)');
    await fn.delay(1000);
    //courses-list/
    //checkUrl courses nav 
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists    
    await page.click('.navbar div:last-child');
    await fn.delay(1000);

    //admin/

    await fn.checkUrl('admin/', page);

    await page.waitForSelector(".menu");
    const elements = await page.$$(".menu a");
    const expectedlinks = [
      'admin/learning',
      'admin/courses',
      'admin/user',
      'admin/user-state',
      'admin/event',
      'admin/questionnaire',
      'admin/organization',
      'admin/account',
      'admin/signup-keys',
    ];
    let link = await page.$eval('.menu a:nth-child(1)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);
    let link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);
    let link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);
    let link4 = await page.$eval('.menu a:nth-child(4)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);
    let link5 = await page.$eval('.menu a:nth-child(5)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);
    let link6 = await page.$eval('.menu a:nth-child(6)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    let link7 = await page.$eval('.menu a:nth-child(7)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[6]).to.equal(link7);
    let link8 = await page.$eval('.menu a:nth-child(8)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[7]).to.equal(link8);



    await page.click('.menu a:nth-child(8)');
    await page.waitForSelector("input[class='el-input__inner']");
    await fn.delay(1000);

    //*******Act******** */

    await page.click('"Account anlegen"');
    await fn.delay(1000);

    const date = Date.now();
    // id account-name
    username = `testaccount-${date}`;
    await page.type('[id=account-name]', username);
    await fn.delay(1000);

    await page.click('.btn.btn--success');
    await page.waitForSelector("input[class='el-input__inner']");
    // wait for success message
    await page.waitForSelector('.success');
    const content2 = await page.$eval('.success .content .text ', e => e.textContent);
    await fn.delay(1000);

    chai.expect(content2).to.equal('Account wurde hinzugefügt');
    await page.click('.material-icons.close');
    // check url
    url = await page.url();
    chai.expect(process.env.TEST_URL + 'admin/account').to.equal(url);

    //********Assertion*********** 

    //search for Account 
    await page.type('[class=el-input__inner]', username);
    //el-icon-delete
    const deleteBtn = await page.$$(".el-icon-delete");
    chai.expect(deleteBtn.length).to.equal(1);

    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');

    await fn.delay(1000);
    await page.click('.menu a:nth-child(9)');
    await fn.delay(1000);

  }).timeout(360000);
  /*
       Test Case ID: #TestCase01
       Test Scenario: Create course
       Test Steps:
           *Login to account 
           * make sure that Admin nav exists
           *Select "ADMIN"  in navbar panel 
           *click on button "Create course"
         
       Prerequisites: have an account with the role access 
       Test Data: Legitimate E-mail and password.
       ExpectedResults: User could create an event course and link it to an account.
   */
  it("createCourse", async () => {

    //*******Arrange******* */

    // make sure that Admin nav exists
    const content1 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
    chai.expect(content1).to.equal('Admin');
    // redirect to admin
    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');
    //admin/
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'admin/').to.equal(url);
    await page.waitForSelector(".menu");
    const elements = await page.$$(".menu a");
    const expectedlinks = [
      'admin/learning',
      'admin/courses',
      'admin/user',
      'admin/questionnaire',
      'admin/organization',
      'admin/signup-keys',
    ];
    let link = await page.$eval('.menu a:nth-child(1)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);

    let link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);

    let link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);

    let link4 = await page.$eval('.menu a:nth-child(6)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);

    let link5 = await page.$eval('.menu a:nth-child(7)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);

    let link6 = await page.$eval('.menu a:nth-child(9)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    await page.click('.menu a:nth-child(2)');
    await page.waitForSelector("input[class='el-input__inner']");

    //*******Act******** */

    await page.click('"Kurs erstellen"');
    // check url
    url = await page.url();
    chai.expect(process.env.TEST_URL + 'admin/courses/edit').to.equal(url);
    await page.waitForSelector("input[id='course-title']");
    // const courseTitle = process.env.COURSE_TITLE + getRandomInt(1000, 9999);
    await page.type('[id=course-title]', courseTitle);
    // await page.click('"Kurs erstellen"');
    await page.click('.btn.btn--error');

    await fn.delay(3000);

    // wait for success message
    await page.waitForSelector('.success');
    const content2 = await page.$eval('.success .content .text ', e => e.textContent);
    chai.expect(content2).to.equal('Kurs wurde angelegt');

    await page.click('.material-icons.close');

    //*********assertions

    //verify that course has been added to the list of courses 
    await fn.goToAdminNavigation(page);


    await page.click('.menu a:nth-child(2)');
    await page.type('[class=el-input__inner]', courseTitle);
    await page.waitForSelector('text=1');
  }).timeout(360000);
      /*
    Test Case ID: #TestCase03
    Test Scenario: publishAndAssignCourse
    Test Steps:
        *search for course
        *wait for notification search 
        *Click on selected search result from table
        *click on publish
        *check for account to select
        *select drop down element
    Prerequisites: a course already created  
    Test Data: course.
    ExpectedResults:Course published .
    */
  it("publishAndAssignCourse", async () => {

    //*******Arrange******* */

    // search for course
    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(2)');
    await fn.checkUrl('admin/courses', page);
    await fn.delay(10000);
    await page.type('[class=el-input__inner]', courseTitle);
    // wait for notification search
    await page.waitForSelector('text=1');
    // click on selected search result from table
    await page.click('.el-table__body tr:first-child');
    await fn.delay(10000);

    //event
    await page.click('"Kursinhalt"');
    await page.waitForSelector('.el-radio-group');
    await page.evaluate(() => {
      document.querySelector('.admin-form-item label:nth-child(5)').click();
    });
    await fn.delay(10000);

    //  await page.click('.add-event-course div:nth-child(5) div a:nth-child(2)');
    await page.evaluate(() => {
      document.querySelector('.horizontal-row a:nth-child(2)').click();
    });
    await fn.delay(10000);

    // click on page publish

    //*******Act****** */

    await page.click('"Veröffentlichung bearbeiten"');
    // check for account to select
    if (account) {
      // search for account
      await page.evaluate(() => {

        document.querySelectorAll('.el-select')[4].click();
      });
      console.log('%cgaAssignUser-11.spec.js line:309 account', 'color: #007acc;', account);
      await fn.delay(10000);
      await page.type('.is-focus .el-input__inner', account);
      // select drop down element
      await fn.delay(10000);
      await page.click('.el-select-dropdown__item:visible');
    } else {
      console.log('%cgaAssignUser-11.spec.js line:311 else', 'color: #007acc;');

      // select all accounts
      await page.click('.publish-type-picker div:nth-child(2)');
    }

    // click button

    await page.click('.btn--success');
    await fn.delay(20000);

    //*********Assertion***************
    console.log('%cgaAssignUser-11.spec.js line:299 assertion_publish', 'color: #007acc;');
    await fn.delay(20000);

    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(2)');
    await fn.delay(20000);
    await page.type('[class=el-input__inner]', courseTitle);
    await fn.delay(20000);
    await page.waitForSelector('text=1');
    //if published colonne=yes so it is really published,else, got  error and test crush

    const Published = "Ja"
    const confirmPublish = await page.$eval('.el-table__body tr:first-child td:nth-child(5) div span', e => e.textContent);
    chai.expect(confirmPublish).to.equal(Published);


  }).timeout(360000);
    /*
        Test Case ID: #TestCase05
        Test Scenario: create Login Via Self Registration And Generate Link
        Test Steps:
            *make sure that Admin nav exists
            *Go to admin nav
            *Create a random sign up key 
            *Confirm sign up key creation 
            *login as new user created via regLink
            *fill the form 
        Prerequisites: to create a user you should create a regLink  
        Test Data: account and reglink.
        ExpectedResults:User get connected via regLink .
    */

  it("createLoginViaSelfRegistrationAndGenerateLink", async () => {

    //*****Arrange****** */

    await fn.delay(1000);
    await fn.goToAdminNavigation(page);
    await page.click('.navbar div:nth-child(2)');
    await fn.delay(1000);
    //courses-list/
    //checkUrl courses nav 
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists    
    await page.click('.navbar div:last-child');
    await fn.delay(1000);

    //admin/

    await fn.checkUrl('admin/', page);

    await page.waitForSelector(".menu");
    const elements = await page.$$(".menu a");
    const expectedlinks = [
      'admin/learning',
      'admin/courses',
      'admin/user',
      'admin/user-state',
      'admin/event',
      'admin/questionnaire',
      'admin/organization',
      'admin/account',
      'admin/signup-keys',
    ];
    let link = await page.$eval('.menu a:nth-child(1)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);
    let link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);
    let link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);
    let link4 = await page.$eval('.menu a:nth-child(4)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);
    let link5 = await page.$eval('.menu a:nth-child(5)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);
    let link6 = await page.$eval('.menu a:nth-child(6)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    let link7 = await page.$eval('.menu a:nth-child(7)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[6]).to.equal(link7);
    let link8 = await page.$eval('.menu a:nth-child(8)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[7]).to.equal(link8);
    await page.click('.menu a:nth-child(8)');
    await page.waitForSelector("input[class='el-input__inner']");
    await fn.delay(1000);
    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');

    await fn.delay(1000);

    await page.click('.menu a:nth-child(9)');
    await fn.delay(1000);

    await page.waitForSelector("input[class='el-input__inner']");
    await fn.delay(1000);

    // check url
    await fn.checkUrl('admin/signup-keys', page);
    await fn.delay(1000);

    await page.click('.admin-header .flex-row ');
    await fn.delay(1000);

    await page.waitForSelector('.modal.create-modal');
    // modal text
    await fn.delay(1000);

    const content3 = await page.$eval('.modal h1', e => e.textContent);
    chai.expect(content3).to.equal('Registrierungsschlüssel hinzufügen');
    await fn.delay(1000);

    await page.click('.el-select');
    //fill form Add Registration key
    await fn.delay(1000);

    //search-dropdown__search
    await page.type('.el-select .el-input__inner', username);
    await fn.delay(1000);
    //select drop down element
    await page.click(`li:has-text("${username}")`);

    // create reg key
    const rand = fn.getRandomInt(1000000, 9999999);
    await fn.delay(1000);

    await page.type('[class=m-0]', `testregistrationkey` + rand);
    await fn.delay(1000);

    await page.click('"Hinzufügen"');
    await fn.delay(1000);
    //search for it
    await page.type('[class=el-input__inner]', username);
    await fn.delay(3000);
    //Assertion (Creation of registration key )

    //check the link in table to much the created link
    const content4 = await page.$eval('tr td:nth-child(3) a', e => e.href);
    regLink = process.env.TEST_URL + 'registration?key=testregistrationkey' + rand;
    chai.expect(content4).to.equal(regLink);
    await fn.delay(1000);

    await fn.goToAdminNavigation(page);
    await fn.delay(1000);

    await page.click('"Nutzermanagement"');
    //check url
    await fn.checkUrl('admin/user', page);
    await fn.delay(1000);

    await page.click('"Nutzer erstellen"');
    //check url
    await fn.delay(1000);
    await fn.checkUrl('admin/user/edit', page);
    await fn.delay(1000);
    //go to regLink inscription
    await fn.logout(page);
    await page
      .goto(regLink, {
        waitUntil: "networkidle0",
      })
      .catch(() => {
      });
    //fil the inscription form
    const email = "TESTACCOUNT" + fn.getRandomInt(1000, 9999) + "@GMAIL.COM";
    await page.fill('[placeholder="E-Mail"]', email);
    await page.fill('[placeholder="Vorname"]', "HAMZA");
    await page.fill('[placeholder="Nachname"]', "EL GHOUL");
    await page.fill('.el-date-editor [autocomplete="off"]', "1990-05-18");
    await page.fill('[placeholder="Adresse"]', "HEIDELBERGer Str.");
    await page.fill('[placeholder="Postleitzahl"]', "55");
    await page.fill('[placeholder="Stadt"]', "Heidelberg");
    await page.click('.country-picker')
    await page.click(`li:has-text("Tunisia")`);
    await fn.delay(500);
    await page.fill('[placeholder="Telefonnummer"]', `${fn.getRandomInt(1000000000, 9999999999)}`);
    await page.fill('[placeholder="Company"]', "ALIGHT");
    const password = 'Passs' + fn.getRandomInt(10000, 99999);

    await page.fill('[placeholder="Passwort"]', password);
    await page.fill('[placeholder="Passwort wiederholen"]', password);
    await page.evaluate(() => {
      document.getElementsByClassName('checkbox-input')[0].click()
      document.getElementsByClassName('checkbox-input')[1].click()
    });

    await page.click('"Nutzer erstellen"');
    await fn.login({ password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page });

    // await fn.logout(page) ;

  }).timeout(360000);

      /*
    Test Case ID: #TestCase06
    Test Scenario: navigate Search And Delete
    Test Steps:
        *Go to courses list
        *check link 
        *make sure that Admin nav exists
        *check the link in table to much the created link
        *click on delete button
      
    Prerequisites: an account already created  
    Test Data: account and reglink.
    ExpectedResults:navigate and check the account created then delete it  .
    */

  it("navigateSearchAndDelete", async () => {
    //******Arrange***** */
    await fn.goToAdminNavigation(page);

    //courses-list/
    await fn.delay(2000);
    await page.click('.navbar div:nth-child(2)');
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists
    await fn.delay(2000);
    const content1 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
    chai.expect(content1).to.equal('Admin');
    // redirect to admin
    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');

    //admin/
    url = await page.url();
    chai.expect(process.env.TEST_URL + 'admin/').to.equal(url);
    await page.waitForSelector(".menu");
    const elements = await page.$$(".menu a");
    const expectedlinks = [
      'admin/learning',
      'admin/courses',
      'admin/user',
      'admin/questionnaire',
      'admin/organization',
      'admin/signup-keys',
    ];
    let link = await page.$eval('.menu a:nth-child(1)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);

    let link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);

    let link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);

    let link4 = await page.$eval('.menu a:nth-child(6)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);

    let link5 = await page.$eval('.menu a:nth-child(7)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);

    let link6 = await page.$eval('.menu a:nth-child(9)', e => e.href);
    fn.delay(2000);

    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    fn.delay(2000);

    await page.click('.menu a:nth-child(9)');
    await page.waitForSelector("input[class='el-input__inner']");
    fn.delay(2000);

    await page.type('[class=el-input__inner]', username);
    fn.delay(2000);

    //******Act******* */

    //check the link in table to much the created link
    const content4 = await page.$eval('tr td:nth-child(3) div', e => e.textContent);
    chai.expect(content4).to.equal(regLink);

    await page.evaluate(() => {
      document.getElementsByClassName('el-icon-delete')[0].click()
    });
    await fn.delay(20000);
  }).timeout(360000);


  /*
    Test Case ID: #TestCase84
    Test Scenario: update User
    Test Steps:
        *Go to admin 
        *search for user
        *edit data
 
    Prerequisites: User should be connected  
    Test Data: user.
    ExpectedResults:edit user details .
*/
  it("updateUser", async () => {
    const content3 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
    chai.expect(content3).to.equal('Admin');
    // redirect to Completed
    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');
    await fn.checkUrl('admin/', page);
    await page.waitForSelector(".menu");
    await page.click('.menu a:nth-child(3)');
    await page.waitForSelector("input[class='el-input__inner']");
    await page.type('[class=el-input__inner]', usernameUser1);
    const content5 = await page.$eval('tr td:nth-child(2) div', e => e.textContent);
    chai.expect(content5).to.equal(usernameUser1);
    await page.waitForSelector('text="1"');
    await page.click('.el-table__row.clickable');
    const randomStringValue = randomString(3);
    await page.waitForSelector('[id=username]');
    await page.fill('[id=firstname]', randomString(8));
    await page.fill('[id=lastname]', randomString(8));
    await page.type('[id=email]', randomStringValue);
    await page.fill('[placeholder="Telefonnummer"]', `${fn.getRandomInt(1000000000, 9999999999)}`);
    await page.fill('[placeholder="Adresse"]', randomString(7) + process.env.EMAIL_SUFFIX);
    await page.fill('[placeholder="Postleitzahl"]', fn.getRandomInt(10, 99) + process.env.EMAIL_SUFFIX);
    await page.fill('[placeholder="Stadt"]', randomString(10));
    await page.evaluate(() => {
      document.getElementsByClassName('el-select')[1].click();
    })
    await page.click('.el-select-dropdown__item:visible');
    await page.fill('.el-date-editor [autocomplete="off"]', "1990-05-18");

    await page.fill('[placeholder="Firma"]', "Alight");
    await page.evaluate(() => {
      document.getElementsByClassName('btn btn--success')[0].click();
    });
    await fn.waitForSuccessMessage('Nutzer wurde aktualisiert', page);
    return usernameUser1;
  }).timeout(36000);
  it("updateAccount", async () => {
    await page.click('.navbar div:last-child');
    await page.click('.menu a:nth-child(8)');
    await page.waitForSelector("input[class='el-input__inner']");
    await page.type('[class=el-input__inner]', account);
    //check the link in table to much the created link
    const content4 = await page.$eval('tr td:nth-child(2) div', e => e.textContent);
    chai.expect(content4).to.equal(account);
    await page.waitForSelector('text="1"');
    await page.click('.el-table__row.clickable');
    // account
    await page.fill('[placeholder="Strasse Hausnr."]', randomString(7) + process.env.EMAIL_SUFFIX);
    await page.fill('[placeholder="Stadt"]', randomString(7) + process.env.EMAIL_SUFFIX);
    await page.fill('[placeholder="Postleitzahl"]', fn.getRandomInt(10, 99) + process.env.EMAIL_SUFFIX);
    await page.evaluate(() => {
      document.getElementsByClassName('el-select')[1].click();
    })
    const email = "TESTACCOUNT" + fn.getRandomInt(1000, 9999) + "@inctec.de";
    await page.fill('[placeholder="E-Mail"]', email);
    await page.fill('[placeholder="Telefonnummer"]', `${fn.getRandomInt(1000000000, 9999999999)}`);
    await page.evaluate(() => {
      document.getElementsByClassName('btn btn--success')[0].click();
    });
    await fn.waitForSuccessMessage('Account wurde aktualisiert', page);
  }).timeout(36000);
  /*
          Test Case ID: #TestCase84
          Test Scenario: open Profil ,Download And Check Response
          Test Steps:
              *click on user profil
              *Click on Sonstiges
              *Go to  Certificates
              *CLick on download data related to me as .txt 
              *fill the form

          Prerequisites: User should be connected  
          Test Data: personal data.
          ExpectedResults:download document on local machine .
      */
  it("openProfilDownloadAndCheckResponse", async () => {
    // click on profil
    await page.click('[class=user-menu__title]');
    // make sure logout btn exists
    const profil = await page.$eval('.user-action-list .user-action-list__item:first-child', e => e.textContent);
    chai.expect(profil).to.equal('Nutzerprofil');
    //click on Nutzerprofil
    await page.evaluate(() => {
      document.getElementsByClassName('user-action-list__item')[0].click();
    });
    await page.waitForSelector('.modal');
    //modal
    const content3 = await page.$eval('.header', e => e.textContent);
    chai.expect(content3).to.equal('Nutzerprofil');
    await page.click('"Sonstiges"');
    await page.click('"Gespeicherte Daten herunterladen"')
    await page.click('.modal svg')

  }).timeout(360000)
  /*
          Test Case ID: #TestCase85
          Test Scenario: upload PDF
          Test Steps:
              *Go to admin panel 
              *click on user profil
              *Click on Sonstiges
              *Go to  Certificates
              *CLick on upload certificate 

          Prerequisites: User should be connected  
          Test Data: certificate document.
          ExpectedResults:upload certificate  .
      */
  it("uploadPDF", async () => {
    // click on profil
    await fn.goToAdminNavigation(page);
    await page.click('[class=user-menu__title]');
    await fn.delay(2000);

    // make sure logout btn exists
    const profil = await page.$eval('.user-action-list .user-action-list__item:first-child', e => e.textContent);
    chai.expect(profil).to.equal('Nutzerprofil');

    //click on Nutzerprofil

    await page.click('"Nutzerprofil"', {
      waitFor: "visible",
    });
    await page.click('"Sonstiges"');
    await page.click('"Zertifikate"');
    await page.click('"Zertifikat hochladen"');
    await page.click(".modal svg")


    // const [download] = await Promise.all([
    //   page.waitForEvent('download'), // wait for download to start
    //   page.click('"Zertifikat drucken"')
    // ]);
    // // wait for download to complete
    // const path = await download.path();

    // // await fn.delay(3000)
    // await page
    //   .goto(process.env.TEST_URL, {
    //     waitUntil: "networkidle0",
    //   });


  }).timeout(36000);
}) ;
       /*
          Test Case ID: #TestCase80
          Test Scenario: Change password
          Test Steps:
              *Go to profile panel 
              *Type actual password 
              *Create a random new password 
          Prerequisites: User should be connected  
          Test Data: account and password.
          ExpectedResults:Password edited  .
        */

  it("gaChangePassword", async () => {
            // await fn.login({email: process.env.TEST_GLOBAL_ADMIN_USER, password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, page});
            await fn.delay(1000);
            await fn.goToAdminNavigation(page);
            await page.click('.navbar div:nth-child(2)');
            await fn.checkUrl('courses-list/', page);
            await fn.goToAdminNavigation(page);
            await fn.waitAndCheckIfMenuLinksExists(page);
            // search for emailUser1
            await page.click('"Nutzermanagement"');
            await fn.checkUrl('admin/user', page);
            await page.waitForSelector("input[class='el-input__inner']");
            await page.type('[class=el-input__inner]', emailUser1);
            await page.waitForSelector('text="1"');
            const content5 = await page.$eval('tr td:nth-child(2) div', e => e.textContent);
            chai.expect(content5).to.equal(usernameUser1);
            await page.click('.el-table__row.clickable');
            await page.click('#tab-password');
            await page.waitForSelector("input[type='password']");
            const randomStringValue = password2User1 + randomString(3);
            await page.type("input[type='password']", randomStringValue);
            await page.type(".passwordRepeat input[type='password']", randomStringValue);
            await page.click('#tab-password');
            await page.click('#pane-password .btn');
            await fn.waitForSuccessMessage('Passwort wurde geändert', page);
            await fn.logout(page);
        
            return randomStringValue;
        
        
        
  }).timeout(360000);

// async function checkRegLink(regLink) {
//   // await page.click('"Admin"');
//   await page.click('.navbar div:last-child');
//   await page.click('.menu a:nth-child(9)');
//   await page.waitForSelector("input[class='el-input__inner']");
//   await page.type('[class=el-input__inner]', regLink.split('?')[1]);
//   const deleteBtn = await page.$$(".el-icon-delete");
//   return deleteBtn.length;
// }

// async function deleteReglink() {
//   await page.evaluate(() => {
//     document.getElementsByClassName('el-icon-delete')[0].click()
//   });
// }



async function downloadPDF() {
  const [download] = await Promise.all([
    page.waitForEvent('download'), // wait for download to start
    page.click('"Zertifikat drucken"')
  ]);
  // wait for download to complete
  const path = await download.path();

  // await fn.delay(3000)
  await page
    .goto(process.env.TEST_URL, {
      waitUntil: "networkidle0",
    });
}




function randomString(length) {
  var result = [];
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }
  return result.join('');
}