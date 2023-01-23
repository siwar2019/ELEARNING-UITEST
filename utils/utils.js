const chai = require('chai');
const addDays = require('date-fns/addDays');
const format = require('date-fns/format');
const ROLE_AO="Account Owner";
const ROLE_USER ="User" ;
const ROLE_AUSM="Account User State Manager" ;
const ROLE_ARU="Account Reporting User";
const ROLE_ACM="Account Content Manager" ;
const ROLE_GUSM="Global User State Manager" ;
var delay = module.exports.delay = async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}


var login = module.exports.login = async function login({email, password, page}) {
  // wait for username and password label
  await page.waitForSelector("input[id='username']");
  await page.waitForSelector("input[id='password']");
  // type email and password
  await page.fill('[id=username]', email);
  await page.fill('[id=password]', password);
  // press Enter to login
  page.click('"Anmelden"')

  // wait till modal shows up . cannot use waitforselector because it will block the treat the conditional aspect of policy modal
  await delay(1200);
  const modal = await page.$('.policy-modal');
  // wait for modal to show up
  if (modal) {
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

var logout = module.exports.logout = async function logout(page) {
  await page
    .goto(process.env.TEST_URL);
  // await page.waitForSelector('vue-avatar--wrapper');
  // click on profil
  // await page.click('[class=user-menu__title]');
  await page.evaluate(() => {
    document.getElementsByClassName('vue-avatar--wrapper')[0].click();
  })
  // make sure logout btn exists
  const logout = await page.$eval('.user-action-list .user-action-list__item:last-child', e => e.textContent);
  chai.expect(logout).to.equal('Abmelden');
  //click on abmelden
  await page.click('"Abmelden"', {force: true});
  // make sure we reached the loginimage in the login page
  await page.waitForSelector("img[class='loginimage center mb-3']");
}

// var waitAndCheckIfMenuLinksExists = module.exports.waitAndCheckIfMenuLinksExists = async function waitAndCheckIfMenuLinksExists(page) {
//   //admin/
//   console.log('%cutils.js line:664 waitAndCheckIfMenuLinksExists', 'color: #007acc;');

//   await checkUrl('admin/', page);
//   await page.waitForSelector(".menu");

//   const elements = await page.$$(".menu a");
//   const expectedlinks = [
//     'admin/learning',
//     'admin/courses',
//     'admin/user',
//     'admin/user-state',
//     'admin/event',
//     'admin/questionnaire',
//     'admin/organization',
//     'admin/account',
//     'admin/signup-keys',
//   ];
//   const link = await page.$eval('.menu a:nth-child(1)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[0]).to.equal(link);
//   const link2 = await page.$eval('.menu a:nth-child(2)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[1]).to.equal(link2);
//   const link3 = await page.$eval('.menu a:nth-child(3)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[2]).to.equal(link3);
//   const link4 = await page.$eval('.menu a:nth-child(4)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[3]).to.equal(link4);
//   const link5 = await page.$eval('.menu a:nth-child(5)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[4]).to.equal(link5);
//   const link6 = await page.$eval('.menu a:nth-child(6)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[5]).to.equal(link6);
//   const link7 = await page.$eval('.menu a:nth-child(7)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[6]).to.equal(link7);
//   const link8 = await page.$eval('.menu a:nth-child(8)', e => e.href);
//   chai.expect(process.env.TEST_URL + expectedlinks[7]).to.equal(link8);
// }
console.log('%cutils.js line:68 end 888', 'color: #007acc;', 888);

var waitForSuccessMessage = module.exports.waitForSuccessMessage = async function waitForSuccessMessage(message, page, time = 400) {
  await page.waitForSelector('.success');
  const content2 = await page.$eval('.success .content .text ', e => e.textContent);
  chai.expect(content2).to.equal(message);
  await page.click('.material-icons.close');
  // wait for animation ends
  await delay(time);
}

var waitForWarningMessage = module.exports.waitForWarningMessage = async function waitForWarningMessage(message, page, time = 400) {
  await page.waitForSelector('.warning');
  const content7 = await page.$eval('.warning .content .text ', e => e.textContent);
  chai.expect(content7).to.equal(message);
  await page.click('.material-icons.close');
  //wait for animation ends
  await delay(time);
}

var checkUrl = module.exports.checkUrl = async function checkUrl(query, page) {
  url = await page.url();
  chai.expect(process.env.TEST_URL + query).to.equal(url);
}

var getRandomInt = module.exports.getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



var goToAdminNavigation = module.exports.goToAdminNavigation = async function goToAdminNavigation(page) {
  // make sure that Admin nav exists
  await page.waitForSelector(".navbar .navbar__item:last-child");
  const content1 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
  chai.expect(content1).to.equal('Admin');
  // redirect to admin
  // await page.click('"Admin"');
  await page.click('.navbar div:last-child');

}

var goToTestsNavigation = module.exports.goToTestsNavigation = async function goToTestsNavigation(page) {
  // make sure that Admin nav exists
  await page.waitForSelector(".navbar .navbar__item:nth-child(6)");
  const content1 = await page.$eval('.navbar .navbar__item:nth-child(6)', e => e.textContent);
  chai.expect(content1).to.equal('Tests');
  // redirect to admin
  await page.click('"Tests"');
}

var startCourseMyProgram = module.exports.startCourseMyProgram = async function startCourseMyProgram(courseTitle, page) {
  const contents = await page.$$eval('.my-course-title', inputs => {
    return inputs.map(input => input.textContent)
  });
  let index = 0;
  for (i = 0; i < contents.length; i++) {
    if (contents[i] === courseTitle)
      index = i;

  }
  // console.log(contents, i)
  // await delay(10000)
  await page.evaluate((index) => {
    document.querySelectorAll('a.button')[index].click();
  }, index);
// await delay(10000)
  await page.waitForSelector(".course-overview-container");
  // wait course-overview-container.
  await page.click(".material-icons.play-icon");
  // click material-icons play-icon
  await page.waitForSelector(".overview-button");
  await page.click('"Bestätigen"');
  await page.waitForSelector('.nav-button.button.clickable.btn--disabled.el-popover__reference', {state: "detached"});
  // wait overview-button
  await page.evaluate(() => {
    document.getElementsByClassName('nav-button button clickable')[0].click();
  })
  // await page.click('"Bestätigen"');
  // await page.waitForSelector('.nav-button.button.clickable.btn--disabled.el-popover__reference', {state: "detached"});
  // await page.evaluate(() => {
  //   document.getElementsByClassName('nav-button button clickable')[0].click();
  // });
  //Lektion abgeschlossen
  await page.waitForSelector('h1');
  const content1 = await page.$eval('h1', e => e.textContent);
  chai.expect(content1).to.equal('Lektion abgeschlossen');
  await page.evaluate(() => {
    document.getElementsByClassName('nav-button button clickable')[0].click();
  })
//nav-button button clickable el-popover__reference
  await page.click('text=Weiter');

  // await page.waitForSelector('.quiz-step-answer.clickable');
  // await page.click('text=/Richtige\\sAntwort\\s\\d*/')
  // await page.waitForSelector('.quiz-step-answer.clickable', {state: "detached"});
  // await page.evaluate(() => {
  //   document.getElementsByClassName('nav-button button clickable')[0].click();
  // })
  await page.waitForSelector('.quiz-step-answer.clickable');
  await page.click('text=/Richtig/');
  await page.waitForSelector('.quiz-step-answer.clickable', {state: "detached"});
  await page.evaluate(() => {
    document.getElementsByClassName('nav-button button clickable')[0].click();
  })
  await page.waitForSelector('.flex-lesson-completed.max-header-width.center.mt-3.txt-center');
  //
  await page.evaluate(() => {
    document.getElementsByClassName('nav-button button clickable')[0].click();
  })
  await page.waitForSelector('.lesson-completed-content');
  await page.evaluate(() => {
    document.getElementsByClassName('nav-button button clickable')[0].click();
  })
}

var verifyCourseExistsMyProgram = module.exports.verifyCourseExistsMyProgram = async function verifyCourseExistsMyProgram(courseTitle, page) {
  await page.waitForSelector('.my-course-title');
  const contents = await page.$$eval('.my-course-title', inputs => {
    return inputs.map(input => input.textContent)
  });
  let index = 0;
  for (i = 0; i < contents.length; i++) {
    if (contents[i] === courseTitle)
      index = i;
  }
  chai.expect(contents[index]).to.equal(courseTitle);
}

var createAccount = module.exports.createAccount = async function createAccount(page) {
  //courses-list/
  //await checkUrl('courses-list/', page);
  await goToAdminNavigation(page);
  // await waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(8)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.click('"Account anlegen"');
  const date = Date.now();
  // id account-name
  account = process.env.TEST_ACCOUNT+`${date}`;
  await page.type('[id=account-name]', account);
  await page.click('.el-button--primary');

  await page.waitForSelector("input[class='el-input__inner']");
  await waitForSuccessMessage('Account wurde hinzugefügt', page);
  // check url
  await checkUrl('admin/account', page);
  //el-input__inner
  await page.type('[class=el-input__inner]', account);
  //el-icon-delete
  const deleteBtn = await page.$$(".el-icon-delete");
  chai.expect(deleteBtn.length).to.equal(1);
  return account;
}

var createRegLink = module.exports.createRegLink = async function createRegLink(page) {

    await page.click('.navbar div:last-child');
  await page.click('.menu a:nth-child(8)');
  await page.waitForSelector("input[class='el-input__inner']");
  // check url
  await checkUrl('admin/signup-keys', page);
  await page.click('.admin-header .flex-row ');
  // await page.click('.admin-header .flex-row ');
  // await delay(1000);
  await page.waitForSelector('.modal.create-modal');
  //modal
  const content3 = await page.$eval('.modal h1', e => e.textContent);
  chai.expect(content3).to.equal('Registrierungsschlüssel hinzufügen');
  await page.click('.el-select .el-input');
  //search-dropdown__search
  await page.type('.is-focus .el-input__inner', account);
  //select drop down element
  // await delay(200);
  await page.click('.el-select-dropdown__item:visible');
  // create reg key
  const rand = getRandomInt(1000000, 9999999);
  await page.type('[class=m-0]', `testregistrationkeywPaCzT` + rand);
  await page.click('"Hinzufügen"');
  // await delay(3000);
  await page.type('[class=el-input__inner]', account);
  //check the link in table to much the created link
  await delay(200);
  const content4 = await page.$eval('tr td:nth-child(4) a', e => e.href);
  const regLink = process.env.TEST_URL + 'registration?key=testregistrationkeywPaCzT' + rand;
  chai.expect(content4).to.equal(regLink);
  return regLink
}

var createUserInAccount = module.exports.createUserInAccount = async function createUserInAccount(account, page) {
    await page.click('.navbar div:last-child');
  await page.click('"Nutzermanagement"');
  await checkUrl('admin/user', page);
  await page.click('"Nutzer erstellen"');
  await checkUrl('admin/user/edit', page);
  // await page.waitForSelector('.el-select .el-input');
  //wait till konto selector is completly loaded
  await delay(2000);
  await page.evaluate(() => {
    document.getElementsByClassName('el-select')[0].click();
  })

  //search-dropdown__search
  await page.type('.is-focus .el-input__inner', account);
  await page.click('.el-select-dropdown__item:visible');
  const passwordUser = 'Passs' + getRandomInt(10000, 99999);
  const emailUser = 'email-wPaCzT' + getRandomInt(1000, 9999) + '@inctec.de';
  const usernameUser = 'user' + getRandomInt(1000, 9999);
  const firstNameUser = 'user-first' + getRandomInt(1000, 9999);
  const lastNameUser = 'user-last' + getRandomInt(1000, 9999);
  await page.fill('input[type=password]', passwordUser);
  await page.fill('[id=email]', emailUser);
  await page.fill('[id=username]', usernameUser);
  await page.fill('[id=firstname]', firstNameUser);
  await page.fill('[id=lastname]', lastNameUser);
  await page.evaluate(() => {
    document.getElementsByClassName('btn btn--success')[0].click();
  })
// await delay(7000);
  // check the success message
  await page.waitForSelector("input[class='el-input__inner']");
  await waitForSuccessMessage('Nutzer wurde angelegt', page, 1200);
// await delay(8000);
  return {
    passwordUser,
    emailUser,
    usernameUser,
    firstNameUser,
    lastNameUser
  }
}

var goToRoles = module.exports.goToRoles = async function goToRoles(usernameUser, page) {
  await goToAdminNavigation(page);
  //await waitAndCheckIfMenuLinksExists(page);
  // search for emailUser1
  await page.click('"Nutzermanagement"');
  await checkUrl('admin/user', page);
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', usernameUser);
  const content5 = await page.$eval('tr td:nth-child(2) div', e => e.textContent);
  chai.expect(content5).to.equal(usernameUser);
  await page.click('.el-table__row.clickable');
  await page.waitForSelector("#tab-roles")
  await page.click('#tab-roles');
}


var assignRolesToUser = module.exports.assignRolesToUser = async function assignRolesToUser(roles, page,correction = 0) {
  //search-dropdown__search
  // await page.click('#tab-roles');
  await page.click('"Rollen"');
  for (i = 0; i < roles.length; i++) {
    // if (i === 0)
    // await page.waitForSelector('.role-picker .search-dropdown .search-dropdown__input .input-placeholder', {state: "visible"});
    await page.evaluate(() => {
      document.getElementsByClassName('el-select')[4].click()
    });
    await page.type('.is-focus .el-input__inner', roles[i]);
    await page.click('.el-select-dropdown__item:visible');
    // await page.fill('[class=search-dropdown__search]', roles[i]);
    // await page.click('.search-dropdown__dropdown .search-dropdown__dropdown-item');
    //check 200 response body
    await Promise.all([
      page.waitForResponse(response => response.status() === 200),
      page.click('"Rolle hinzufügen"')
    ]);
    await page.waitForSelector('.el-loading-parent--relative', {state: "detached"});
  }
  //check I fRoles Assigned
  const contents = await page.$$eval('.assign-list .content .assing-item .name', names => {
    return names.map(name => name.textContent)
  });
  chai.expect(roles.length).to.equal(contents.length - correction);
  for (i = 0; i < contents.length; i++) {
    if (contents[i] !== 'User')
      chai.expect(roles.indexOf(contents[i])).to.not.equal(-1);
  }
}


var checkIfRolesAssigned = module.exports.checkIfRolesAssigned = async function checkIfRolesAssigned(roles, page, correction = 0) {
  const contents = await page.$$eval('.assign-list .content .assing-item .name', names => {
    return names.map(name => name.textContent)
  });
  chai.expect(roles.length).to.equal(contents.length - correction);
  for (i = 0; i < contents.length; i++) {
    if (contents[i] !== 'User')
      chai.expect(roles.indexOf(contents[i])).to.not.equal(-1);
  }
}


var deleteAccount = module.exports.deleteAccount = async function deleteAccount(account, page) {
    await page.click('.navbar div:last-child');
  await page.click('.menu a:nth-child(7)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', account);
  //check the link in table to much the created link
  await page.waitForSelector('text=1');
  const content4 = await page.$eval('tr td:nth-child(2) div', e => e.textContent);
  chai.expect(content4).to.equal(account);
  await page.evaluate(() => {
    document.getElementsByClassName('el-icon-delete')[0].click()
  });
  await page.click('" Löschen"');
  await waitForWarningMessage('Account wurde gelöscht', page);
}

var unPublishCourse = module.exports.unPublishCourse = async function unPublishCourse(account, page) {
  await page.goto('https://lilli-demo.inctec.net/admin/courses');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', process.env.EXISTENT_COURSE_TITLE_2);
  await page.click('.el-table__row.clickable');
  await page.click('"Veröffentlichung bearbeiten"');
  await page.waitForSelector('.el-table__row');
  const contents = await page.$$eval('.el-table__row td:first-child div span', inputs => {
    return inputs.map(input => input.textContent)
  });
  let index = 0;
  for (i = 0; i < contents.length; i++) {
    if (contents[i] === account)
      index = i;
  }
  chai.expect(contents[index]).to.equal(account);
  await page.evaluate((index) => {
    document.getElementsByClassName('el-icon-delete')[index].click()
  }, index);
  await page.click('" Löschen"');
  await waitForSuccessMessage('Die Veröffentlichung des Kurses wurde aufgehoben.', page);
}

var removeCourseAssignment = module.exports.removeCourseAssignment = async function removeCourseAssignment(checkBoxNbr, account, page) {
  await page.click('.menu a:nth-child(1)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.evaluate(() => {
    document.getElementsByClassName('el-select')[0].click();
  });
  // console.log(account);
  // TODO: add to delay delete default input content it has to be fixed
  await delay(2000)
  await page.evaluate(() => {
    document.getElementsByClassName("el-input__inner")[1].value = "";
  });
  // await delay(1000)
  await page.type('.is-focus .el-input__inner', account);
  // await delay(1000)
  await page.click('.el-select-dropdown__item:visible');
  await page.waitForSelector('.el-table__row.clickable')
  await page.click('.el-table__row.clickable');
  await page.waitForSelector(".el-table__row");
  await page.evaluate((checkBoxNbr) => {
    for (i = 1; i <= checkBoxNbr; i++)
      document.getElementsByClassName('checkbox-input')[i].click();
  }, checkBoxNbr);
  await page.evaluate(() => {
    document.getElementsByClassName('btn btn--success')[0].click();
  });
}

var publishCourse = module.exports.publishCourse = async function publishCourse(account, page) {
  // .el-table__row clickable
  await page.click('.el-table__row.clickable');
  await page.waitForSelector('#tab-publications');
  await page.click('"Veröffentlichung bearbeiten"');
  await page.waitForSelector('.el-table');
  await page.click('.el-select .el-input:visible');
  // console.log(account);
  await page.type('.is-focus .el-input__inner', account);

  await page.click('.el-select-dropdown__item:visible');

  await page.evaluate(() => {
    document.getElementsByClassName('checkbox-input')[1].click()
  });
  // await delay(2000);
  await page.evaluate(() => {
    document.getElementsByClassName('btn--success')[0].click()
  });
  // await page.click('.btn.btn--success');
  await waitForSuccessMessage('Kurs wurde veröffentlicht', page);
}

var assignCourse = module.exports.assignCourse = async function assignCourse(checkBoxNbr, account, page) {
  await goToAdminNavigation(page);
  //await waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(1)');
  await page.waitForSelector("input[class='el-input__inner']");

  await page.click('.el-select .el-input');
  await page.type('.is-focus .el-input__inner', account);
  await page.click('.el-select-dropdown__item:visible');

  await page.waitForSelector(".el-table__row.clickable");

  await page.click('.el-table__row.clickable');
  await page.waitForSelector(".el-table__body");
  const className = await page.$eval('.checkbox-input', e => e.className);
  if (className.indexOf('active') !== -1) {
    await page.evaluate((checkBoxNbr) => {
      for (i = 1; i <= checkBoxNbr; i++)
        document.getElementsByClassName('checkbox-input')[i].click();
      document.getElementsByClassName('checkbox-input')[checkBoxNbr + 2].click();
    }, checkBoxNbr);
    await page.fill('.el-date-editor [autocomplete="off"]', format(addDays(new Date(), 3), 'yyyy-MM-dd'));

    await page.evaluate(() => {
      document.getElementsByClassName('btn btn--success')[0].click();
    });
  }

}

var createCheckCourse = module.exports.createCheckCourse = async function createCheckCourse(page) {
  await goToAdminNavigation(page);
 // await waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(2)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.click('"Kurs erstellen"');
  // check url
  await checkUrl('admin/courses/edit', page);
  await page.waitForSelector("input[id='course-title']");
  const courseTitle = process.env.COURSE_TITLE + getRandomInt(10000, 99999);
  await page.type('[id=course-title]', courseTitle);
  // await page.click('"Kurs erstellen"');
  await page.click('.margin-left.btn.btn--error');
  // await delay(100);
  //add 2000 delay to avoid message Kursinhalt wurde aktualisiert it has to be reset when fixed
  await waitForSuccessMessage('Kurs wurde angelegt', page, 2000);

  await page.click('"Bibliothek"');
//   console.log('currentUrl1');
//   await delay(1000);
  await page.type('[class=el-input__inner]', courseTitle);
  //el-icon-delete
  const deleteBtn = await page.$$(".el-icon-delete");
  chai.expect(deleteBtn.length).to.equal(1);
  await publishCourse(account, page);
  return courseTitle;
}

var profilNavigate = module.exports.profilNavigate = async function profilNavigate(page) {
  // click on profil
  await page.click('[class=user-menu__title]');
  // make sure logout btn exists
  const profil = await page.$eval('.user-action-list .user-action-list__item:first-child', e => e.textContent);
  chai.expect(profil).to.equal('Nutzerprofil');
  //click on Nutzerprofil
  // await delay(500);
  await page.evaluate(() => {
    document.getElementsByClassName('user-action-list__item')[0].click();
  });
  // await delay(500);
  await page.waitForSelector('.modal');
  //modal
  const content3 = await page.$eval('.header', e => e.textContent);
  chai.expect(content3).to.equal('Nutzerprofil');
  await page.click(".modal svg");
}

var deleteCourse = module.exports.deleteCourse = async function deleteCourse(courseTitle, page) {
  await goToAdminNavigation(page);
  //await waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(2)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', courseTitle);
  //el-icon-delete
  const deleteBtn = await page.$$(".el-icon-delete");
  chai.expect(deleteBtn.length).to.equal(1);
  await page.click('.el-icon-delete');
  // await delay(100);
  await page.waitForSelector('.delete-modal');
  //modal
  const content3 = await page.$eval('.modal .header', e => e.textContent);
  chai.expect(content3).to.equal('Kurs löschen');
  await page.click('.btn--error');
  // here there is no message for course deletion
  // console.log('here there is no message for course deletion');
}

var createSelfRegistredUser = module.exports.createSelfRegistredUser = async function createSelfRegistredUser(regLink, page) {
  await page
    .goto(regLink, {
      waitUntil: "networkidle0",
    });
  const email = "TESTACCOUNT" + getRandomInt(1000, 9999) + "@inctec.de";
  await page.fill('[placeholder="E-Mail"]', email);
  await page.fill('[placeholder="Vorname"]', "HAMZA");
  await page.fill('[placeholder="Nachname"]', "EL GHOUL");
  await page.fill('[placeholder="Geburtstag"]', "1990-05-18");
  await page.click('"Nutzer erstellen"');
  await page.fill('[placeholder="Adresse"]', "HEIDELBERGer Str.");
  await page.fill('[placeholder="Postleitzahl"]', "55");
  await page.fill('[placeholder="Stadt"]', "Heidelberg");
  await page.evaluate(() => {
    document.getElementsByClassName('el-select')[0].click();
  })
  await page.click('.el-select-dropdown__item:nth-child(1):visible');

  await page.evaluate(() => {
    document.getElementsByClassName('el-select')[1].click();
  })
  await page.click('text=Afghanistan');
  // await delay(5000);
  await page.fill('[placeholder="Telefonnummer"]', `${getRandomInt(1000000000, 9999999999)}`);
  await page.fill('[placeholder="Firma"]', "Alight");
  const password = 'Passs' + getRandomInt(10000, 99999);
  await page.fill('[placeholder="Passwort"]', password);
  await page.fill('[placeholder="Passwort wiederholen"]', password);
  await page.evaluate(() => {
    document.getElementsByClassName('checkbox-input')[0].click()
    document.getElementsByClassName('checkbox-input')[1].click()
  });
  // await fn.delay(500);
  await page.click('"Nutzer erstellen"');
  return {email, password};
}

var deleteAllRemain = module.exports.deleteAllRemain = async function deleteAllRemain(page) {
  // await logout(page);
  // await login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.TEST_GLOBAL_ADMIN_USER, page});
  await deleteUsers('testaccount', page)
   await deleteUsers('email', page);
   await deleteAccounts(page);
   await deleteCourses(page);
   await deleteReglinks("testregistrationkey", page);
   await logout(page);
}
var deleteReglinks = module.exports.deleteReglinks = async function deleteReglinks(prefix, page) {
  console.log('%cutils.js line:652 start delete reglink', 'color: #007acc;');
  await goToAdminNavigation(page);
  //await waitAndCheckIfMenuLinksExists(page);
  await page.click('.menu a:nth-child(9)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', prefix);
  let i = '';
  do {
    i = await page.$eval('.el-badge__content', e => e.textContent);
    if (i !== '0') {
      await Promise.all([
        page.waitForResponse(response => response.status() === 204),
        await page.click('.el-icon-delete')
      ]);
      await delay(100);
    }
  } while (i !== '0');
  console.log('%cutils.js line:652 end delete reglink', 'color: #007acc;');

}

var deleteCourses = module.exports.deleteCourses = async function deleteCourses(page) {
  console.log('%cutils.js line:664 delETECOURSES', 'color: #007acc;');

  //await waitAndCheckIfMenuLinksExists(page);
  await goToAdminNavigation(page) ;
  await page.click('.menu a:nth-child(2)');

  await page.waitForSelector("input[class='el-input__inner']");

  await page.type('[class=el-input__inner]', 'COURSE_TITLE_NEW_');

  let i = 0
  do {
    i = await page.$eval('.el-badge__content', e => e.textContent);
    if (i !== '0') {

      await page.click('.el-icon-delete');

      await page.waitForSelector('.delete-modal');
      //modal
      const content3 = await page.$eval('.modal .header', e => e.textContent);
      chai.expect(content3).to.equal('Kurs löschen');
      await page.click('"Löschen"')
      // here there is no message for course deletion
      // wait for kursmanagement span to change
      await delay(1000)
    }
  } while (i !== '0');
  console.log('%cutils.js line:664 end delETECOURSES', 'color: #007acc;');

}

var deleteUsers = module.exports.deleteUsers = async function deleteUsers(usersname, page) {
  console.log('%cutils.js line:688 deleteusers', 'color: #007acc;');
  const content3 = await page.$eval('.navbar .navbar__item:last-child', e => e.textContent);
  chai.expect(content3).to.equal('Admin');
  // redirect to Completed
  
    await page.click('.navbar div:last-child');
  await checkUrl('admin/', page);
  await page.waitForSelector(".menu");
  await page.click('.menu a:nth-child(3)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', usersname);
  let i = 0
  do {
    i = await page.$eval('.admin-header .bread-crumb sup', e => e.textContent);
    // console.log(i);
    if (i !== '0') {
      // await delay(1000);
      await page.evaluate(() => {
        document.getElementsByClassName('el-icon-delete')[0].click()
      });
      // await delay(10000);
      await page.waitForSelector('.confirm-delete-modal .modal .modal__content .modal__header-wrapper .header');
      let content6 = await page.$eval('.confirm-delete-modal .modal .header', e => e.textContent);
      chai.expect(content6).to.equal('Nutzer löschen');
      let username = await page.$eval('.delete-text .flex-row .strong', e => e.textContent);
      await page.type('[class=input]', username);
      await page.click('"Ich habe verstanden, löschen Sie den Nutzer"');
      await waitForWarningMessage('Nutzer wurde gelöscht', page);
    }
  } while (i !== '0');
  console.log('%cutils.js line:688 end deleteusers', 'color: #007acc;');

}

var deleteAccounts = module.exports.deleteAccounts = async function deleteAccounts(page) {
  console.log('%cutils.js line:719 deleteACOOUNTS', 'color: #007acc;');
    await page.click('.navbar div:last-child');
  await page.click('.menu a:nth-child(8)');
  await page.waitForSelector("input[class='el-input__inner']");
  await page.type('[class=el-input__inner]', 'TESTACCOUNT');
  //check the link in table to much the created link
  let i = '';
  do {
    i = await page.$eval('.el-badge__content', e => e.textContent);
    if (i !== '0') {
      await page.evaluate(() => {
        document.getElementsByClassName('el-icon-delete')[0].click()
      });
      await page.click('" Löschen"');
      await waitForWarningMessage('Account wurde gelöscht', page);
    }
  } while (i !== '0');
  console.log('%cutils.js line:719 end deleteACOOUNTS', 'color: #007acc;');

}
async function createUsersWithDifferentRoles(account) {
    const roles = [ROLE_USER, ROLE_AO, ROLE_AUSM, ROLE_ARU, ROLE_ACM, ROLE_GUSM]
    var users = [];
    for (let index = 0; index < roles.length; index++) {
        users[index] = await fn.createUserInAccount(account, page);
        //await fn.assignRolesToUser(roles[index], page)  
    }
    for (let index = 0; index < users.length; index++) {
        await fn.goToRoles(users[index].usernameUser, page);
        await fn.assignRolesToUser([roles[index]], page)
    }
    return users;
}

