const playwright = require('playwright');
const chai = require('chai');
const fn = require('../../utils/utils');
const { fromUnixTime } = require('date-fns');

describe("eventTests-47", () => {
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
    afterEach(async function afterFn() {
        this.timeout(200000);
        if (this.currentTest.state === 'failed') {
            // await fn.deleteAllRemain(page)
            // console.log('hi')
        }
    });
    after(() => {
        if (!page.isClosed()) {
            browser.close();
        }
    });
    // Global Admin role
        it("GA-role", async () => {
            await fn.login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page});
            await fn.delay(2000);
            const courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
            const account = await fn.createAccount(page);
            // Create list of users
            const users = await createUsersWithDifferentRoles(account);
            await createEventCourse(courseTitle);
            await adjustEventCourseTranslation(courseTitle);
            await defineAppointment(courseTitle);
            await checkAppointmentInCalendar();
            await openAppointmentDetails();
            await adjustAppointment();
            await publishEventCourse(courseTitle, account);
            await assignEventCourse(courseTitle, account);
            await checkEventCourseAssignment(courseTitle, users);
            await fn.login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.test_global_admin_user, page});
            await fn.deleteUsers(process.env.TEST_ACCOUNT, page);
            await fn.logout(page);
            await fn.delay(2000);
          }).timeout(2000000);
        // Admin role
        it("Admin-role", async () => {
            await fn.login({password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page});
            await fn.delay(2000);
            const courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
            const account = await fn.createAccount(page);
            // Create list of users
            const users = await createUsersWithDifferentRoles(account);
            await createEventCourse(courseTitle);
            await adjustEventCourseTranslation(courseTitle);
            await defineAppointment(courseTitle);
            await checkAppointmentInCalendar();
            await openAppointmentDetails();
            await adjustAppointment();
            await publishEventCourse(courseTitle, account);
            await assignEventCourse(courseTitle, account);
            await checkEventCourseAssignment(courseTitle, users);
            await fn.login({password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page});
            await registerUserForAppointement(courseTitle, account);
            await fn.deleteUsers(process.env.TEST_ACCOUNT, page);
            await fn.logout(page);
        }).timeout(2000000);
        // Account Owner role
        it("AO-role", async () => {
    
            await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
            await fn.delay(2000);
            const roles = [process.env.ROLE_AO];
            const courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
            const account = await fn.createAccount(page);
            const user = await fn.createUserInAccount(account, page);
            //GIVE ROLE OWNER 
            await fn.delay(2000);
            fn.assignRolesToUser(roles, page);
            await fn.delay(2000);
            fn.checkIfRolesAssigned(roles, page);
            await fn.delay(2000);
            // Create an apploinment
            await createEventCourse(courseTitle);
            await defineAppointment(courseTitle);
            await checkAppointmentInCalendar();
            await openAppointmentDetails();
            await adjustAppointment();
            await publishEventCourse(courseTitle, 0);
            await fn.delay(200);
            await fn.logout(page);
            await fn.delay(2000);
            await fn.login({ password: user.passwordUser, email: user.emailUser, page });
            await fn.delay(2000);
            await checkAvailableAppointement();
            await performPreregistration(courseTitle);
            await assignEventCourseToUser(courseTitle);
            await fn.logout(page);
            await fn.delay(2000);
            await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
            await fn.delay(2000);
            await fn.deleteUser(user.usernameUser, page);
            await fn.delay(2000);
            await fn.logout(page);
        }).timeout(2000000); 
    // Trainer role
    it("Trainer-role", async () => {

        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        await fn.delay(2000);
        const roles = [process.env.ROLE_TRAINER];
        const courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
        const account = await fn.createAccount(page);
        const user = await fn.createUserInAccount(account, page);
        //GIVE ROLE OWNER 
        await fn.delay(2000);
        fn.assignRolesToUser(roles, page);
        await fn.delay(2000);
        fn.checkIfRolesAssigned(roles, page);
        await fn.delay(2000);
        // Create an apploinment
        await createEventCourse(courseTitle, user.firstNameUser, user.lastNameUser);
        await defineAppointment(courseTitle);
        // affect trainer to the cource
        await checkAppointmentInCalendar();
        await openAppointmentDetails();
        await adjustAppointment();
        await publishEventCourse(courseTitle, 0);
        await fn.delay(2000);
        await checkAvailableAppointement();
        await checkAppointmentInCalendar();
        await selectCourse(courseTitle);
        await performPreregistration(courseTitle);
        await registerEventToUser(account);
        await fn.delay(200);
        await fn.logout(page);
        await fn.delay(2000);
        await fn.login({ password: user.passwordUser, email: user.emailUser, page });
        await fn.delay(2000);
        await checkAvailableAppointement();
        // await TestsNavigation(page) ;
        await fn.delay(2000);
        await checkEventsPerDay();
        await fn.delay(2000);
        await searchForUser();

        await fn.delay(2000);
        await fn.logout(page);
        await fn.delay(2000);
        await createTest(user.firstNameUser);

    }).timeout(2000000);
})

async function createUsersWithDifferentRoles(account) {
    const roles = [process.env.ROLE_USER, process.env.ROLE_AO, process.env.ROLE_AUSM, process.env.ROLE_ARU, process.env.ROLE_ACM, process.env.ROLE_GUSM]
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

// childNumber refers to the position of the section "Date management" in the list
async function checkAvailableAppointement() {
    await fn.goToAdminNavigation(page);
    await page.click(`.menu a:nth-child(5)`);
    await fn.checkUrl('admin/event', page);
    await fn.delay(2000);
}

async function checkEventsPerDay() {
    await page.click('"Tag"');
    await page.click('.fc-icon-chevron-right');
}
async function createTest(firstname) {
    //login as admin 
    await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
    await fn.delay(2000);

    await fn.goToTestsNavigation(page)
    await fn.delay(2000);
    await page.click('.el-button');
    await fn.delay(2000);
    //form
    await page.evaluate(() => {
        document.querySelectorAll('.el-select')[0].click();
    });
    await fn.delay(2000);

    await page.type('.is-focus .el-input__inner', "t24");
    await fn.delay(2000);

    // select drop down element
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(2000);
    await page.fill('.el-date-editor [autocomplete="off"]', '2022-10-21');
    await page.click('.is-plain');

    await fn.delay(2000);
    await page.evaluate(() => {
        document.querySelectorAll('.el-select')[1].click();

    }
    );
    await fn.delay(2000);

    await page.type('.is-focus .el-input__inner', `${firstname}`);
    await fn.delay(2000);

    // select drop down element
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(2000);
    await page.click('"Erstellen & Dokumentieren"');
    await fn.delay(2000);
    await fn.waitForSuccessMessage('Test erstellt', page, 2000);
    await fn.delay(2000);

    await page.evaluate(() => {
        document.querySelectorAll('.el-select')[0].click();

    });
    await fn.delay(2000);
    await page.type('.is-focus .el-input__inner', "Positiv");
    await fn.delay(2000);

    // select drop down element
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(2000);
    await page.click('"Speichern"');
    await fn.delay(3000);
    await page.click('.modal__footer button:nth-child(1)');

}

async function searchForUser() {
    await page.click('.fc-event-main-frame');
    await fn.delay(2000);
    await page.click('.el-input__inner');
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(2000);
    await page.click('.el-tabs__nav div:nth-child(3)');
    await fn.delay(1000);

}

async function selectCourse(courseTitle) {
    await fn.delay(3000);
    await page.click('.el-input__inner');
    await page.type('.is-focus .el-input__inner', courseTitle);
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(2000);
}

async function performPreregistration(courseTitle) {
    await fn.delay(3000);
    const content2 = await page.$eval('.fc-event-title', e => e.textContent);
    chai.expect(content2).to.equal(courseTitle);
    await page.click('.fc-daygrid-event-harness a.fc-event');
    await page.click('.el-input-number__increase');
    await fn.delay(3000);
    await page.evaluate(() => {
        document.querySelector('.horizontal-row a:nth-child(2)').click();
    });
    await fn.delay(2000);
  
}

async function assignEventCourseToUser(courseTitle) {
    await page.click('#tab-registration');
    await page.click('.el-select');
    await page.type('.el-select', courseTitle);
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(200);
    await page.click('.mark');
    await fn.delay(200);
    await page.click('.horizontal-row a:nth-child(2)');
    await fn.waitForSuccessMessage('Änderungen erfolgreich gespeichert', page, 2000);
}

async function registerEventToUser(account) {
    await page.click('#tab-registration');
    await page.click('.el-select');
    await page.type('.el-select', account);
    await page.click('.el-select-dropdown__item:visible');
    await fn.delay(200);
    await page.click('.mark');
    await fn.delay(200);
    await page.click('.horizontal-row a:nth-child(2)');
    // await fn.waitForSuccessMessage('Änderungen erfolgreich gespeichert', page, 2000);
}

async function createEventCourse(courseTitle, firstname = "", lastname = "") {
    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(2)');
    await fn.checkUrl('admin/courses', page);
    // create course
    await page.click('"Kurs erstellen"');
    await fn.checkUrl('admin/courses/edit', page);
    await page.waitForSelector("input[id='course-title']");
    await page.type('[id=course-title]', courseTitle);
    await page.click('.margin-left.btn.btn--error');
    await fn.waitForSuccessMessage('Kurs wurde angelegt', page, 2000);

    // edit course to be event
    await page.click('a[href="/admin/courses"]');
    await page.type('[class=el-input__inner]', courseTitle);
    await page.waitForSelector('text=1');
    await page.click('.el-table__body tr:first-child');
    await page.waitForSelector('text=Kurs ändern');
    await page.click('"Kursinhalt"');
    await page.waitForSelector('.el-radio-group');
    await page.evaluate(() => {
        document.querySelector('.admin-form-item label:nth-child(5)').click();
    });
    await page.evaluate(() => {
        document.querySelector('.horizontal-row a:nth-child(2)').click();
    });
    await fn.delay(2000);
    await fn.waitForSuccessMessage('', page, 2000);
    if (firstname) {
        await affectTrainer(firstname, lastname);
        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(4)').click();
        });
        await fn.delay(200);
    }
}


async function adjustEventCourseTranslation(courseTitle) {
    // translate title to english
    await page.click('.horizontal-row a:nth-child(2)');
    await fn.delay(1000);
    await page.click('.el-tabs__nav div:nth-child(3)');
    await page.evaluate(() => {
        document.querySelectorAll('.el-select-dropdown__list')[1].children[1].click();
    });
    const input = await page.$$('.el-input__inner');
    const targetTitleInput = input[3];
    const EnglishTitle = courseTitle + "__english";
    await targetTitleInput.type(EnglishTitle);
    await page.click('.btn');
    await fn.delay(2000);

    // check if title is translated correctly 
    const translatedTitle = await page.$eval('tr:nth-child(2) td:nth-child(2) div div', e => e.textContent);
    chai.expect(translatedTitle).to.equal(EnglishTitle);
}

async function publishEventCourse(courseTitle, account) {
    // search for course
    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(2)');
    await fn.checkUrl('admin/courses', page);

    await page.type('[class=el-input__inner]', courseTitle);
    // wait for notification search
    await page.waitForSelector('text=1');
    // click on selected search result from table
    await page.click('.el-table__body tr:first-child');

    // click on page publish
    await page.click('"Veröffentlichung bearbeiten"');
    // check for account to select
    if (account) {
        // search for account
        await page.evaluate(() => {
            document.querySelectorAll('.el-select')[4].click();
        });
        await page.type('.is-focus .el-input__inner', account);
        // select drop down element
        await page.click('.el-select-dropdown__item:visible');
    } else {
        // select all accounts
        await page.click('.publish-type-picker div:nth-child(2)');
    }

    // click button
    await page.click('.btn--success');
    //notification appears
    await fn.waitForSuccessMessage('Kurs wurde veröffentlicht', page, 2000);
}

async function assignEventCourse(courseTitle, account) {
    // assign course to all the users in account
    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(1)');
    await fn.checkUrl('admin/learning', page);
    await fn.delay(2000);
    await page.evaluate(() => {
        document.querySelectorAll('.el-input__inner')[1].click();
    });
    await page.type('.is-focus .el-input__inner', account);
    await page.click('.el-select-dropdown__item:visible');
    await page.click('.el-table__body', courseTitle);
    await page.click('.mark');
    await page.click('.btn--success');
}

async function checkEventCourseAssignment(courseTitle, users) {
    await fn.logout(page);
    for (let index = 0; index < users.length; index++) {
        await fn.login({ password: users[index].passwordUser, email: users[index].emailUser, page });
        await fn.delay(200);
        await page.waitForSelector(".courses-list__content");
        await page.type('.searchbar__input', courseTitle);
        const courses = await page.$$('.course-card');
        chai.expect(courses.length).to.equal(1);
        await fn.logout(page);
    }
}

async function defineAppointment(courseTitle) {
    await fn.goToAdminNavigation(page);
    await page.click('.menu a:nth-child(2)');
    await fn.checkUrl('admin/courses', page);

    await page.type('[class=el-input__inner]', courseTitle);
    //wait for notification search
    await page.waitForSelector('text=1');
    //click on selected search result from table
    await page.click('.el-table__body tr:first-child');
    await page.click('"Kursinhalt"');
    await page.evaluate(() => {
        document.querySelector('.horizontal-row a:nth-child(1)').click();
    });
    await page.waitForSelector('.fc-toolbar-title');
    await fn.delay(10000);
    await page.click('.fc-day-future');
    await page.waitForSelector('.modal__header-wrapper');
    await page.click('"Speichern"');
    await fn.delay(200);
}

async function affectTrainer(firstname, lastname) {
    await page.click('#trainers');
    await fn.delay(2000);
    await page.click(`"${firstname} ${lastname}"`)
    await fn.delay(2000);
}

async function checkAppointmentInCalendar() {
    const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
    await fn.delay(2000);
    chai.expect(content).to.equal('fc-daygrid-event-harness');
}

async function openAppointmentDetails() {
    await page.click('.fc-daygrid-event-harness a.fc-event');
    const madalTitle = await page.$eval('.modal__header-wrapper h3.header', e => e.textContent);
    chai.expect(madalTitle).to.equal('Termin bearbeiten');
}

async function adjustAppointment() {
    // Unlimited capacity
    await page.click('.el-input-number__increase');
    // await page.evaluate(() => {
    //     document.querySelectorAll('.el-switch')[0].click();
    // });

    // Allow pre-registrations
    await page.evaluate(() => {
        document.querySelectorAll('.el-switch')[1].click();
    });

    // online event
    await page.evaluate(() => {
        document.querySelectorAll('.el-switch')[2].click();
    });

    // save modifications
    await page.click('"Speichern"');
    await fn.delay(2000);
    // check that modifications are applied
    await openAppointmentDetails();

    const checked = await page.$$('.is-checked');
    chai.expect(checked.length).to.equal(2);
    await page.click('"Abbrechen"');
}

async function registerUserForAppointement(courseTitle, account) {
    await fn.goToAdminNavigation(page);

    await page.click('.menu a:nth-child(5)');
    await fn.checkUrl('admin/event', page);
    await fn.delay(5000);
    await page.click('.el-input__inner');
    await page.type('.is-focus .el-input__inner', courseTitle);
    await page.click('.el-select-dropdown__item:visible');
    await page.click('#tab-preregistration');
    await fn.delay(2000);
    await page.click('div.el-tabs__nav div:last-child');
    await page.click('.account-picker');
    await page.type('.account-picker', account);
    await page.click('.el-select-dropdown__item:visible');
    await page.waitForSelector('.event-registration-table');
    // register all users in account
    await page.click('.mark');
    await page.waitForSelector('.modal__header-wrapper');
    const buttons = await page.$$('a.btn');
    const confirmButton = buttons[1];
    await confirmButton.click();
    await fn.waitForSuccessMessage('Änderungen erfolgreich gespeichert', page, 2000);
}