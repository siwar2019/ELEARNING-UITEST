const playwright = require('playwright');
const fn = require('../utils/utils')

let page;
let browser;
let account = '';
const ROLE_ADMIN="Admin" ;
const ROLE_GCA="Global Content Admin" ;
const ROLE_GA="Global Admin" ;
const ROLE_USER="User" ;
const ROLE_AUSM="Account User State Manager" ;
const ROLE_AO="Account Owner" ;
const ROLE_ARU="Account Reporting User ";
const ROLE_ACM="Account Content Manager" ;
const ROLE_GUSM="Global User State Manager" ;
describe("roleAssignmentGlobalRoles-35", () => {
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

    await createAccountsUsersAndAssignRoles();

  }).timeout(360000);
});

async function createAccountsUsersAndAssignRoles() {
  await fn.login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.TEST_GLOBAL_ADMIN_USER, page});
  account = await fn.createAccount(page);
  const {
    passwordUser: passwordUser1,
    emailUser: emailUser1,
    usernameUser: usernameUser1
  } = await fn.createUserInAccount(account, page);
  const roles = [
    ROLE_AO,
    ROLE_AUSM,
    ROLE_ARU,
    ROLE_ACM
  ];
  await fn.goToRoles(usernameUser1, page);
  await fn.assignRolesToUser(roles, page,1);
  // await fn.checkIfRolesAssigned(roles, page,1);
  await deleteRolesFromUser(roles);
  await fn.checkIfRolesAssigned([ROLE_USER], page);

  const globalRoles = [
    ROLE_GUSM,
    ROLE_GCA,
    ROLE_GA
  ];
  await fn.assignRolesToUser(globalRoles, page,1);
  // await fn.checkIfRolesAssigned(globalRoles, page, 1);
  await deleteRolesFromUser(globalRoles);
  await fn.checkIfRolesAssigned([ROLE_USER], page);

  const available = await checkIfRoleAdminAvailable();
  if (available) {
    await fn.assignRolesToUser([ROLE_ADMIN], page);
  }
  const assignmentAdminSuccess = await checkIfRoleAdminAssigned();
  if (assignmentAdminSuccess) {
    await deleteRolesFromUser([ROLE_ADMIN]);
  }
  await fn.checkIfRolesAssigned([ROLE_USER], page);
  await fn.deleteUser(usernameUser1, page);
  await fn.deleteAccount(account, page);
  await fn.logout(page);
}

async function checkIfRoleAdminAvailable() {
  await page.evaluate(() => {
    document.getElementsByClassName('el-select')[4].click()
  });
  // [x-placement="top-start"]
  await page.evaluate(() => {
    document.getElementsByClassName("el-input__inner")[6].value = "";
  });

  const contents = await page.$$eval('[x-placement="top-start"] .el-select-dropdown__item', names => {
    return names.map(name => name.textContent)
  });
  // console.log(contents)
  return contents.indexOf(ROLE_ADMIN) !== -1;
}

async function deleteRolesFromUser(roles) {
  for (i = 0; i < roles.length; i++) {
    const contents = await page.$$eval('.assing-item .name', names => {
      return names.map(name => name.textContent)
    });
    index = contents.indexOf(roles[i]);
    if (index !== -1) {
      await Promise.all([
        page.waitForResponse(response => response.status() === 200),
        await page.evaluate((index) => {
          document.getElementsByClassName('material-icons icon')[index].click();
        }, index)
      ]);
    }
  }
}

async function checkIfRoleAdminAssigned() {

  const contents = await page.$$eval('.assign-list .content .assing-item .name', names => {
    return names.map(name => name.textContent)
  });
  for (i = 0; i < contents.length; i++) {
    if (contents[i] === ROLE_ADMIN)
      return true
  }
  return false
}
