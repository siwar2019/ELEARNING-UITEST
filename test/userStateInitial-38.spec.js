const format = require('date-fns/format');
const playwright = require('playwright');
const chai = require('chai');
const fn = require('../utils/utils')

let page;
let browser;
let regLink = '';
let account = '';
var log = console.log;
const ROLE_AO="Account Owner";
const ROLE_USER ="User" ;
const ROLE_AUSM="Account User State Manager" ;
const ROLE_ARU="Account Reporting User";
const ROLE_ACM="Account Content Manager" ;
const ROLE_GUSM="Global User State Manager" ;
console.log = function () {
  log.apply(console, arguments);
  // Print the stack trace
  console.trace();
};
describe("userStateInitial-38", () => {
  before(async function fn() {
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
      });
  });

  after(() => {
    if (!page.isClosed()) {
      browser.close();
    }
  });
  it("create account and generate link", async () => {

    const {
      regLink,
      passwordUser1,
      emailUser1,
      usernameUser1,
      passwordUser2,
      emailUser2,
      usernameUser2,
      passwordUser3,
      emailUser3,
      usernameUser3,
    } = await createAccountUsers();

    await loginAndAgreePolicyAndUploadCertification({
      regLink,
      passwordUser1,
      emailUser1,
      usernameUser1,
      passwordUser2,
      emailUser2,
      usernameUser2,
      passwordUser3,
      emailUser3,
      usernameUser3,
    });
    await loginAndAgreePolicyAndUserState({
      regLink,
      passwordUser1,
      emailUser1,
      usernameUser1,
      passwordUser2,
      emailUser2,
      usernameUser2,
      passwordUser3,
      emailUser3,
      usernameUser3,
    });
    await navigateSearchAndDelete({
      regLink,
      passwordUser1,
      emailUser1,
      usernameUser1,
      passwordUser2,
      emailUser2,
      usernameUser2,
      passwordUser3,
      emailUser3,
      usernameUser3
    });

  }).timeout(360000);
});

async function createAccountUsers() {
  await fn.login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.TEST_GLOBAL_ADMIN_USER, page});
  account = await fn.createAccount(page);
  // await addRegLink();
  const {
    passwordUser: passwordUser1,
    emailUser: emailUser1,
    usernameUser: usernameUser1
  } = await fn.createUserInAccount(account, page);
  const {
    passwordUser: passwordUser2,
    emailUser: emailUser2,
    usernameUser: usernameUser2
  } = await fn.createUserInAccount(account, page);
  const {
    passwordUser: passwordUser3,
    emailUser: emailUser3,
    usernameUser: usernameUser3
  } = await fn.createUserInAccount(account, page);
  // assignRole U1
  await fn.goToRoles(usernameUser2, page);
  await fn.assignRolesToUser([ROLE_AUSM], page,1)
  // await fn.checkIfRolesAssigned([ROLE_AUSM], page, 1);
  // assignRole U2
  await fn.goToRoles(usernameUser3, page);
  await fn.assignRolesToUser([ROLE_GUSM], page,1)
  // await fn.checkIfRolesAssigned([ROLE_GUSM], page, 1);
  await fn.goToAdminNavigation(page);
  await fn.waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(2)');
  await publishAndAssignCourse();
  await fn.logout(page);
  return {
    regLink,
    passwordUser1,
    emailUser1,
    usernameUser1,
    passwordUser2,
    emailUser2,
    usernameUser2,
    passwordUser3,
    emailUser3,
    usernameUser3
  }
}

async function loginAndAgreePolicyAndUserState({passwordUser2, emailUser2, usernameUser1, usernameUser2, usernameUser3}) {
  await fn.login({email: emailUser2, password: passwordUser2, page});
  await page.click('"Mein Programm"');
  // make sure that program nav item is active
  const program = await page.$eval('.router-link-active', e => e.textContent);
  chai.expect(program).to.equal('Mein Programm');
  await fn.verifyCourseExistsMyProgram(process.env.EXISTENT_COURSE_TITLE_2, page);
  await fn.startCourseMyProgram(process.env.EXISTENT_COURSE_TITLE_2, page);
  await gotoUserStateAndCheckUsers(usernameUser1, usernameUser2, usernameUser3);
  await checkTraficLightForUsers(usernameUser1, usernameUser2, usernameUser3);
  await setAccessToUser(usernameUser1);
  await fn.delay(2000);
  await checkIfAccessCardDisabledToUser(usernameUser1);
  await page
    .goto(process.env.TEST_URL + 'admin/user-state', {
      waitUntil: "networkidle0",
    });
  await checkIfAccessExistToUser(usernameUser1);
  await checkIfAccessCardDontExistToUser(usernameUser1);
  const [response] = await Promise.all([
    page.waitForResponse(response => response.status() === 200),
    await page.click('"Bericht herunterladen"')
  ]);
  await fn.delay(200);
  //chai.expect(response._headers['content-disposition']).to.equal('attachment; filename="report.xlsx"');
  await fn.logout(page);
}

async function setAccessToUser(username) {
  await page
    .goto(process.env.TEST_URL + 'admin/user-state', {
      waitUntil: "networkidle0",
    });
  await page.fill('[class=el-input__inner]', username);
  await page.waitForSelector('.el-loading-parent--relative')
  await page.click('tr td:nth-child(7) div div div div');
  await fn.delay(2000);
}

async function checkIfAccessExistToUser(username) {
  await page.fill('[class=el-input__inner]', username);
  await page.waitForSelector('.el-loading-parent--relative')
  await fn.delay(200);
  const content4 = await page.$eval('tr td:nth-child(7) div div div div', e => e.className);
  chai.expect(content4.indexOf('active')).to.not.equal(-1);
}

async function checkIfAccessCardDontExistToUser(username) {
  const content4 = await page.$eval('tr td:nth-child(8) div div div div', e => e.className);
  chai.expect(content4.indexOf('disabled')).to.not.equal(-1);
}

async function checkIfAccessCardDisabledToUser(username) {
  // //check if it exists
  const content4 = await page.$eval('tr td:nth-child(8) div div div div', e => e.className);
  chai.expect(content4).to.equal('checkbox-input disabled');
}

async function gotoUserStateAndCheckUsers(usernameUser1, usernameUser2, usernameUser3) {
  await page
    .goto(process.env.TEST_URL + 'admin/user-state', {
      waitUntil: "networkidle0",
    });
  await checkUserInUserState(usernameUser1);
  await checkUserInUserState(usernameUser2);
  await checkUserInUserState(usernameUser3);
}

async function checkUserInUserState(username) {
  await page.fill('[class=el-input__inner]', username);
  //check if it exists
  await page.waitForSelector('.el-loading-parent--relative')
  await fn.delay(300);
  const content4 = await page.$eval('tr td:nth-child(1) div span', e => e.textContent);
  chai.expect(content4).to.equal(username);
}

async function checkTraficLightForUsers(usernameUser1, usernameUser2, usernameUser3) {
  checktraficLightGreenForUser(usernameUser1);
  checktraficLightRedForUser(usernameUser2);
  checktraficLightRedForUser(usernameUser3);
}

async function checktraficLightGreenForUser(username) {
  //el-icon-success
  await page.fill('[class=el-input__inner]', username);
  //check the link in table to much the created link
  await page.waitForSelector('.el-loading-parent--relative')
  await fn.delay(200);
  //el-icon-delete
  const icons = await page.$$(".el-icon-success");
  chai.expect(icons.length).to.equal(1);
}

async function checktraficLightRedForUser(username) {
  //el-icon-error
  await page.fill('.el-icon-error', username);
  //check the link in table to much the created link
  await page.waitForSelector('.el-loading-parent--relative')
  await fn.delay(200);
  //el-icon-delete
  const icons = await page.$$(".el-icon-error");
  chai.expect(icons.length).to.equal(1);
}

async function loginAndAgreePolicyAndUploadCertification({passwordUser1, emailUser1}) {
  // console.log(emailUser1, passwordUser1);
  await fn.login({email: emailUser1, password: passwordUser1, page});
  await page.click('"Mein Programm"');
  // make sure that program nav item is active
  const program = await page.$eval('.router-link-active', e => e.textContent);
  chai.expect(program).to.equal('Mein Programm');
  await fn.verifyCourseExistsMyProgram(process.env.EXISTENT_COURSE_TITLE_2, page);
  await fn.startCourseMyProgram(process.env.EXISTENT_COURSE_TITLE_2, page);
  await uploadCertification();
  await checkIfUploaded();
  await page
    .goto(process.env.TEST_URL, {
      waitUntil: "networkidle0",
    });
  await fn.logout(page);
}

async function navigateSearchAndDelete({usernameUser1, usernameUser2, usernameUser3}) {
  await fn.login({email: process.env.TEST_GLOBAL_ADMIN_USER, password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, page});
  //courses-list/
  await fn.checkUrl('courses-list/', page);
  await fn.goToAdminNavigation(page);
  await fn.waitAndCheckIfMenuLinksExists(page);
  // remove cource asseignment
  await fn.removeCourseAssignment(3, account, page);
  await fn.deleteUser(usernameUser1, page);
  await fn.deleteUser(usernameUser2, page);
  await fn.deleteUser(usernameUser3, page);
  await fn.unPublishCourse(account, page);
  // await updateAccount();
  await fn.deleteAccount(account, page);
  await fn.logout(page);
}

async function publishAndAssignCourse() {
  await page.evaluate(() => {
    document.getElementsByClassName("el-input__inner")[0].value = "";
  });
  await page.type('[class=el-input__inner]', process.env.EXISTENT_COURSE_TITLE_2);
  const deleteBtn = await page.$$(".el-icon-delete");
  chai.expect(deleteBtn.length).to.equal(1);
  await fn.publishCourse(account, page);
  await fn.assignCourse(3, account, page);
}

async function uploadCertification() {
  await page.click('"Zertifikat hochladen"');
  await page.waitForSelector('.modal');
  //modal
  const content3 = await page.$eval('.modal__header-wrapper .header', e => e.textContent);
  chai.expect(content3).to.equal('Zertifikat hochladen');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('.file-loader.file-upload')
  ]);
  await fileChooser.setFiles('/home/ghoul/Downloads/Exemplary_Teaching_Practices_Across_Educational_Co.pdf');
  await page.fill('#certificateUploadName', 'Exemplary_Teaching_Practices_Across_Educational_Co');
  await page.fill('#certificateUploadIssuer', 'Exemplary_Teaching_Practices_Across_Educational_Co_Issuer');
  await page.fill('#certificateUploadIssuedDate', format(new Date(), 'yyyy-MM-dd'));
  await page.type('#certificateUploadEcts', fn.getRandomInt(1, 9).toString());
  await page.fill('#certificateUploadPercent', fn.getRandomInt(1, 99).toString());
  await page.click('.el-switch__core');
  const [response] = await Promise.all([
    page.waitForResponse(response => response.status() === 201),
    await page.click('.modal__footer a:nth-child(2)')
  ]);
}

async function checkIfUploaded() {
  await page.goto(process.env.TEST_URL + "completed", {
    waitUntil: "networkidle0",
  });
  await page.waitForSelector('.completed-title')
  const contents = await page.$$eval('.completed-title', inputs => {
    return inputs.map(input => input.textContent)
  });
  await chai.expect(contents.indexOf('Exemplary_Teaching_Practices_Across_Educational_Co')).to.not.equal(-1);
}
