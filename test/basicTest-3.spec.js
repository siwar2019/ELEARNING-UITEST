const playwright = require('playwright');
const chai = require('chai');

let page;
let browser;

describe("basicTest-3", () => {
  before(async function fn() {
    this.timeout(20000);
    browser = await playwright[process.env.TEST_BROWSER].launch({
      headless: false,
      slowMo: 10
    });
    const context = await browser.newContext();
    page = await context.newPage();
    await page
      .goto(process.env.TEST_URL + "login", {
        waitUntil: "networkidle0",
      })
      .catch((err) => {
      });
  });
  after(() => {
    if (!page.isClosed()) {
      browser.close();
    }
  });
  it("resolves", async () => {

    await login({password: process.env.TEST_PASSWORD, email: process.env.TEST_USER});

    await page.waitForSelector('.router-link-active');

    // expect active nav  to be Bibliothek
    const content = await page.$eval('div[class~="router-link-active"]', e => e.textContent);
    chai.expect(content).to.equal('Bibliothek');
    // make sure that program exists
    const content1 = await page.$eval('.navbar__item', e => e.textContent);
    chai.expect(content1).to.equal('Mein Programm');
    //make sure that Completed exists
    const content2 = await page.$eval('.navbar .navbar__item:nth-child(3)', e => e.textContent);
    chai.expect(content2).to.equal('Abgeschlossen');
    //make sure that Admin exists
    // const content3 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
    // chai.expect(content3).to.equal('Admin');
    // redirect to program
    await page.click('"Mein Programm"');
    // make sure that program nav item is active
    const program = await page.$eval('div[class~="router-link-active"]', e => e.textContent);
    chai.expect(program).to.equal('Mein Programm');
    // redirect to Completed
    await page.click('"Abgeschlossen"');
    // make sure that completed nav item is active
    const completed = await page.$eval('div[class~="router-link-active"]', e => e.textContent);
    chai.expect(completed).to.equal('Abgeschlossen');
    // click on profil
    await page.click('[class=user-menu__title]');
    // make sure logout btn exists
    const logout = await page.$eval('.user-action-list .user-action-list__item:last-child', e => e.textContent);
    chai.expect(logout).to.equal('Abmelden');
    //click on abmelden
    await page.click('"Abmelden"');
    // make sure we reached the loginimage in the login page
    await page.waitForSelector("img[class='loginimage center mb-3']");
  }).timeout(10000);
});

async function login({email, password}) {
  // wait for username and password label
  await page.waitForSelector("input[id='username']");
  await page.waitForSelector("input[id='password']");
  // type email and password
  await page.type('[id=username]', email);
  await page.type('[id=password]', password);
  // press Enter to login
  await page.click('"Anmelden"');
  await delay(300);
  const modal = await page.$('.policy-modal');
  // wait for modal to show up
  if (modal) {
    // await page.waitForSelector('.policy-modal');
    const content3 = await page.$eval('.policy-modal .modal .header', e => e.textContent);
    chai.expect(content3).to.equal('Annahme der Richtlinien');
    //check the boxes
    await page.evaluate(() => {
      document.getElementsByClassName('checkbox-input')[0].click();
      document.getElementsByClassName('checkbox-input')[1].click();
    });
    // accept condition
    await page.click('"Akzeptieren"');
  }

  await page.waitForSelector("[class=user-menu__title]");
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}
