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
            console.log("fin create course")
            await adjustEventCourseTranslation(courseTitle);
            await defineAppointment(courseTitle);
            await checkAppointmentInCalendar();
            // await openAppointmentDetails();
            // await adjustAppointment();
            // await publishEventCourse(courseTitle, account);
            // await assignEventCourse(courseTitle, account);
            // await checkEventCourseAssignment(courseTitle, users);
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
        // affect trainer to the course
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
    /*
        Test Case ID: #TestCase11
        Test Scenario: check available appointments
        Test Steps:
            *Go to interface Date management
            *Display appointements 
           
        Prerequisites: Have appointments already created
        Test Data: courses.
        ExpectedResults: User could consult the list of oppintment in the calendar .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
    await fn.goToAdminNavigation(page);
    await page.click(`.menu a:nth-child(5)`);
    await fn.checkUrl('admin/event', page);
    await fn.delay(2000);
}

async function checkEventsPerDay() {
    /*
        Test Case ID: #TestCase14
        Test Scenario: Explore details of events per day 
        Test Steps:
            *Go to interface Date management
            *Display calendar by days 
            *balance between days by clicking on the right arrow in order to display the courses .

        Prerequisites: Have a course  already created
        Test Data: course.
        ExpectedResults: User could consult the list of events per day  in the calendar .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
    await page.click('"Tag"');
    await page.click('.fc-icon-chevron-right');
}
async function createTest(firstname) {
        /*
        Test Case ID: #TestCase16
        Test Scenario: Document user's participation and result
        Test Steps:
            *Login as admin
            *Go to tests interface
            *create a new test and assign it to a trainer user 
            *fill in  the form by chosen the type of test ,the date and the timing after it the test is considered as missed
            *create a document by chosen the result either positive or negative

        Prerequisites: A trainer account already created 
        Test Data: ctrainer user .
        ExpectedResults: Document or display the result of test . 
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    /*
        Test Case ID: #TestCase15
        Test Scenario: Search for user 
        Test Steps:
            *Type user name 
            *Check course details 

        Prerequisites: Have a user and a course  already created
        Test Data: course and a user .
        ExpectedResults: search for a user assigned to a course in a day.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
        /*
        Test Case ID: #TestCase12
        Test Scenario: perform Preregistration
        Test Steps:
            *Click on a appointment 
            *Display expected course title
            *increase the number of free places.
           
        Prerequisites: Have a course  already created
        Test Data: courses.
        ExpectedResults: Finalize the pre registration to a course.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    /*
        Test Case ID: #TestCase13
        Test Scenario: assign event course to user 
        Test Steps:
            *Search for Course title
            *check the box appeared in front  of user .
            *confirm the assignement of the course to the user .
           
        Prerequisites: Have an appointement already created.
        Test Data: course and user .
        ExpectedResults: assign a course to user.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    /*
        Test Case ID: #TestCase01
        Test Scenario: Create event course
        Test Steps:
            *Login to account using user's credentials
            *Select "ADMIN"  in navbar panel 
            *click on button "Create course"
            *type Account name and fill in the form
            *edit course to be event
            *affectTrainer to it
        Prerequisites: have an account with the role access 
        Test Data: Legitimate E-mail and password.
        ExpectedResults: User could create an event course and link it to an account.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    await fn.delay(1000);
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
        await fn.delay(500);
        console.log("fin create course")
    }
}

async function adjustEventCourseTranslation(courseTitle) {
    /*
        Test Case ID: #TestCase02
        Test Scenario: adjust event course translation
        Test Steps:
            *translate title to english
            *check if title is translated correctly
    
        Prerequisites: have a courseTitle  
        Test Data: courseTitle.
        ExpectedResults: courseTitle translated to english.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
        await fn.delay(1000);
    await page.click('.horizontal-row a:nth-child(2)');
    await fn.delay(1000);
    await page.click('.el-tabs__nav div:nth-child(3)');
    await fn.delay(1000);

    await page.evaluate(() => {
        document.querySelectorAll('.el-select-dropdown__list')[1].children[1].click();
    });
    await fn.delay(1000);

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
     /*
        Test Case ID: #TestCase05
        Test Scenario: publish event course
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
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
      /*
        Test Case ID: #TestCase08
        Test Scenario: assign event course to users
        Test Steps:
            *go to learn management
            *type account 
            *assign event course to all the users in account
          
        Prerequisites: an event course already created  
        Test Data: course and account 
        ExpectedResults:assign event course to all the users in account.
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
    // assign course to all the users in account
    console.log('%ceventTests-47.spec.js line:470 assign course all users', 'color: #007acc;');
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
    /*
        Test Case ID: #TestCase09
        Test Scenario: check event course assignment at user state details
        Test Steps:
            *login as emailUser
            *type account
            *Search for courseTitle 
            *verify the presence of courses
        Prerequisites: have a courseTitle already created  
        Test Data: courseTitle.
        ExpectedResults: define appointement for course .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    /*
        Test Case ID: #TestCase03
        Test Scenario: adefine appointments
        Test Steps:
            *Go to Date management interface 
            *click on the desired date in the calendar 
            *fill in the form
    
        Prerequisites: have a courseTitle already created  
        Test Data: courseTitle.
        ExpectedResults: define appointement for course .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
    await fn.delay(20000);
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
      /*
        Test Case ID: #TestCase04
        Test Scenario:check appointments in calendar 
        Test Steps:
            *Open calendar
            *check appointment
        Prerequisites: An appointement already created  
        Test Data: Appointement.
        ExpectedResults: display appointment in calendar .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
    const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
    await fn.delay(10000);
    chai.expect(content).to.equal('fc-daygrid-event-harness');
    await fn.delay(10000);
}

async function openAppointmentDetails() {
    await fn.delay(2000);

    await page.click('.fc-daygrid-event-harness a.fc-event');
    await fn.delay(2000);

    const madalTitle = await page.$eval('.modal__header-wrapper h3.header', e => e.textContent);
    await fn.delay(2000);

    chai.expect(madalTitle).to.equal('Termin bearbeiten');
}

async function adjustAppointment() {
    /*
        Test Case ID: #TestCase06
        Test Scenario: adjust Appointment
        Test Steps:
            *Open form
            *Increase capacity 
            *Allow pre-registrations
            *Check online event
            *check that modifications are applied
        Prerequisites: An appointement already created  
        Test Data: Appointement.
        ExpectedResults: increasing capacity .
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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
      /*
        Test Case ID: #TestCase10
        Test Scenario: register user for appointment
        Test Steps:
           *go to event interface
           *type course tiltle 
           *click to  preregistration
           *check account 
           *click event registration table
           *register all users in account

        Prerequisites: An appointement already created  
        Test Data: Appointement, users
        ExpectedResults: user registred to an appointement
        Actual Results: As Expected
        Test Status – Pass/Fail: Pass
    */
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