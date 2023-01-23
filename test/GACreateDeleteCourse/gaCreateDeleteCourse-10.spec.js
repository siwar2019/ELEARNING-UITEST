const playwright = require('playwright');
const chai = require('chai');

const fnc = require('../../utils/utils');
const { fromUnixTime } = require('date-fns');

let page;
let browser;
let regLink = '';
let username = '';
let passwordUser1 = '';
let emailUser1 = '';
let usernameUser1 = '';
let courseTitle;
let account;

describe.only("gaCreateDeleteCourse-10", () => {
  before(async function fn() {
    this.timeout(30000);
    browser = await playwright[process.env.TEST_BROWSER].launch({
      headless: false,
      slowMo: 10
    });
    const context = await browser.newContext();
    page = await context.newPage();
    //set page viewport
    // await page.setViewport({
    //   width: parseInt(process.env.TEST_WIDTH),
    //   height: parseInt(process.env.TEST_HEIGHT)
    // })
    await page
      .goto(process.env.TEST_URL + "login", {
        waitUntil: "networkidle0",
      })
      .catch(() => {
      });
    await fnc.login({ password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page });
    courseTitle = process.env.COURSE_TITLE + getRandomInt(1000, 9999);

    account = await fnc.createAccount(page);

  });
  afterEach(async function afterFn() {
    console.log('%cAdmin-role.spec.js line:46 afterEach', 'color: #007acc;');
    this.timeout(200000);
    if (this.currentTest.state === 'failed') {
        console.log('%cAdmin-role.spec.js line:49 ifFailed Admin', 'color: #007acc;');
        await fnc.deleteAllRemain(page)

    }
});

after(async () => {
      await fnc.logout(page);
     await fnc.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
    await fnc.deleteAllRemain(page)

    browser.close();

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
  it("create account ", async () => {

    //*******Arrange******* */
    await delay(1000);
    await fnc.goToAdminNavigation(page) ;
    await page.click('.navbar div:nth-child(2)');
    await delay(1000);
    //courses-list/
    //checkUrl courses nav 
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists    
    await page.click('.navbar div:last-child');
    await delay(1000);

    //admin/

    await fnc.checkUrl('admin/', page);

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
    const link = await page.$eval('.menu a:nth-child(1)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);
    const link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);
    const link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);
    const link4 = await page.$eval('.menu a:nth-child(4)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);
    const link5 = await page.$eval('.menu a:nth-child(5)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);
    const link6 = await page.$eval('.menu a:nth-child(6)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    const link7 = await page.$eval('.menu a:nth-child(7)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[6]).to.equal(link7);
    const link8 = await page.$eval('.menu a:nth-child(8)', e => e.href);
    chai.expect(process.env.TEST_URL + expectedlinks[7]).to.equal(link8);

    await page.click('.menu a:nth-child(8)');
    await page.waitForSelector("input[class='el-input__inner']");
    await delay(1000);

    //*******Act******** */

    await page.click('"Account anlegen"');
    await delay(1000);

    const date = Date.now();
    // id account-name
    username = `testaccount-${date}`;
    await page.type('[id=account-name]', username);
    await delay(1000);

    await page.click('.btn.btn--success');
    await page.waitForSelector("input[class='el-input__inner']");
    // wait for success message
    await page.waitForSelector('.success');
    const content2 = await page.$eval('.success .content .text ', e => e.textContent);
    await delay(1000);

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

    // await page.click('"Admin"');*
    await page.click('.navbar div:last-child');

    await delay(1000);
    await page.click('.menu a:nth-child(9)');
    await delay(1000);

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
    const link = await page.$eval('.menu a:nth-child(1)', e => e.href);
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

    await delay(3000);

    // wait for success message
    await page.waitForSelector('.success');
    const content2 = await page.$eval('.success .content .text ', e => e.textContent);
    chai.expect(content2).to.equal('Kurs wurde angelegt');

    await page.click('.material-icons.close');

    //*********assertions

    //verify that course has been added to the list of courses 
    await fnc.goToAdminNavigation(page);


    await page.click('.menu a:nth-child(2)');
    await page.type('[class=el-input__inner]', courseTitle);
    await page.waitForSelector('text=1');
  }).timeout(360000);


  // it("deletecourse", async () => {
  //   //*********Arrange******** */
  //   await fnc.goToAdminNavigation(page)
  //   await page.click('a[href="/admin/courses"]');

  //   await page.type('[class=el-input__inner]', courseTitle);
  //   //el-icon-delete
  //   const deleteBtn = await page.$$(".el-icon-delete");
  //   chai.expect(deleteBtn.length).to.equal(1);
  //   //********Act**** */
  //   await page.click('.el-icon-delete');

  //   await delay(100);
  //   await page.waitForSelector('.delete-modal');
  //   //modal
  //   const content3 = await page.$eval('.modal .header', e => e.textContent);
  //   chai.expect(content3).to.equal('Kurs löschen');
  //   await page.click('.btn--error');
  //   // here there is no message for course deletion
  //   console.log('here there is no message for course deletion');

  // }).timeout(360000);


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

    await delay(1000);
    await page.click('.navbar div:nth-child(2)');
    await delay(1000);
    //courses-list/
    //checkUrl courses nav 
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists    
    await page.click('.navbar div:last-child');
    await delay(1000);

    //admin/

    await fnc.checkUrl('admin/', page);

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
    await delay(1000);

    //******Act*********


    // await page.click('"Admin"');
    await page.click('.navbar div:last-child');
    await delay(1000);

    await page.click('.menu a:nth-child(9)');
    await delay(1000);

    await page.waitForSelector("input[class='el-input__inner']");
    await delay(1000);

    // check url
    await fnc.checkUrl('admin/signup-keys', page);
    await delay(1000);

    await page.click('.admin-header .flex-row ');
    await delay(1000);

    await page.waitForSelector('.modal.create-modal');
    // modal text
    await delay(1000);

    const content3 = await page.$eval('.modal h1', e => e.textContent);
    chai.expect(content3).to.equal('Registrierungsschlüssel hinzufügen');
    await delay(1000);

    await page.click('.el-select');
    //fill form Add Registration key
    await delay(1000);

    //search-dropdown__search
    await page.type('.el-select .el-input__inner', username);
    await delay(1000);
    //select drop down element
    await page.click(`li:has-text("${username}")`);

    // create reg key
    const rand = getRandomInt(1000000, 9999999);
    await delay(1000);

    await page.type('[class=m-0]', `testregistrationkey` + rand);
    await delay(1000);

    await page.click('"Hinzufügen"');
    await delay(1000);
    //search for it
    await page.type('[class=el-input__inner]', username);
    await delay(3000);
    //Assertion (Creation of registration key )

    //check the link in table to much the created link
    const content4 = await page.$eval('tr td:nth-child(3) a', e => e.href);
    regLink = process.env.TEST_URL + 'registration?key=testregistrationkey' + rand;
    chai.expect(content4).to.equal(regLink);
    await delay(1000);

    await fnc.goToAdminNavigation(page);
    await delay(1000);

    await page.click('"Nutzermanagement"');
    //check url
    await fnc.checkUrl('admin/user', page);
    await delay(1000);

    await page.click('"Nutzer erstellen"');
    //check url
    await delay(1000);
    await fnc.checkUrl('admin/user/edit', page);
    await delay(1000);
    //go to regLink inscription
    await fnc.logout(page);
    await page
      .goto(regLink, {
        waitUntil: "networkidle0",
      })
      .catch(() => {
      });
    //fil the inscription form
    const email = "TESTACCOUNT" + getRandomInt(1000, 9999) + "@GMAIL.COM";
    await page.fill('[placeholder="E-Mail"]', email);
    await page.fill('[placeholder="Vorname"]', "HAMZA");
    await page.fill('[placeholder="Nachname"]', "EL GHOUL");
    await page.fill('.el-date-editor [autocomplete="off"]', "1990-05-18");
    await page.fill('[placeholder="Adresse"]', "HEIDELBERGer Str.");
    await page.fill('[placeholder="Postleitzahl"]', "55");
    await page.fill('[placeholder="Stadt"]', "Heidelberg");
    await page.click('.country-picker')
    await page.click(`li:has-text("Tunisia")`);
    await delay(500);
    await page.fill('[placeholder="Telefonnummer"]', `${getRandomInt(1000000000, 9999999999)}`);
    await page.fill('[placeholder="Company"]', "ALIGHT");
    const password = 'Passs' + getRandomInt(10000, 99999);

    await page.fill('[placeholder="Passwort"]', password);
    await page.fill('[placeholder="Passwort wiederholen"]', password);
    await page.evaluate(() => {
      document.getElementsByClassName('checkbox-input')[0].click()
      document.getElementsByClassName('checkbox-input')[1].click()
    });

    await page.click('"Nutzer erstellen"');
    await fnc.login({ password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page });

    // await fnc.logout(page) ;

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

    //courses-list/
    await fnc.delay(2000);
    await page.click('.navbar div:nth-child(2)');
    let url = await page.url();
    chai.expect(process.env.TEST_URL + 'courses-list/').to.equal(url);
    // make sure that Admin nav exists
    await fnc.delay(2000);
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
    delay(2000);

    chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
    delay(2000);

    await page.click('.menu a:nth-child(9)');
    await page.waitForSelector("input[class='el-input__inner']");
    delay(2000);

    await page.type('[class=el-input__inner]', username);
    delay(2000);

    //******Act******* */

    //check the link in table to much the created link
    const content4 = await page.$eval('tr td:nth-child(3) div', e => e.textContent);
    chai.expect(content4).to.equal(regLink);

    await page.evaluate(() => {
      document.getElementsByClassName('el-icon-delete')[0].click()
    });
    await fnc.delay(20000);
  }).timeout(360000);
 
  /*
         Test Case ID: #TestCase06
         Test Scenario: profil Navigate
         Test Steps:
             *Go to admin panel
             *click on user profil
             *check details
         Prerequisites: an account already created  
         Test Data: Account.
         ExpectedResults:profil details .
     */
  it("profilNavigate", async () => {
    //*****Arrange*********
    // click on profil
    await fnc.goToAdminNavigation(page);
    await page.click('.user-menu__title');
    await fnc.delay(2000);

    // make sure logout btn exists
    const profil = await page.$eval('.user-action-list .user-action-list__item:first-child', e => e.textContent);
    chai.expect(profil).to.equal('Nutzerprofil');
    //*****Act**** */

    //click on Nutzerprofil

    await page.click('"Nutzerprofil"', {
      waitFor: "visible",
    });
   // await page.click('"Speichern"');
  }).timeout(360000);
})

function getDateAfter(days) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  dd = dd + days;
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}