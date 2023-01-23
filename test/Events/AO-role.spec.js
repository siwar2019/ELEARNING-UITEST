const playwright = require('playwright');
const chai = require('chai');
const fn = require('../../utils/utils');
const { fromUnixTime } = require('date-fns');
let courseTitle;
let account;
let roles;
let user;

const ROLE_AO = "Account Owner"
describe("AO-role", () => {
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
            });
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        roles = [ROLE_AO];

        courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
        account = await fn.createAccount(page);
        user = await fn.createUserInAccount(account, page);
        fn.assignRolesToUser(roles, page);


    });

    afterEach(async function afterFn() {
        console.log('%cAdmin-role.spec.js line:46 afterEach', 'color: #007acc;');
        this.timeout(200000);
        if (this.currentTest.state === 'failed') {
            console.log('%cAdmin-role.spec.js line:49 ifFailed Admin', 'color: #007acc;');
            await fn.logout(page);
            await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
            await fn.deleteAllRemain(page)
            await fn.logout(page);

        }
    });

    after(async () => {
        await fn.logout(page);
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });

        // await fn.login({password: process.env.TEST_GLOBAL_ADMIN_PASSWORD, email: process.env.TEST_GLOBAL_ADMIN_USER, page});
        await fn.deleteAllRemain(page)

        browser.close();

        if (!page.isClosed()) {
            browser.close();
        }

    });

    /**
     
     * Test Case ID: #TestCase01
     * Test Scenario: Create event course
     * Test Steps:
     * Login to account using user's credentials
     * Select "ADMIN"  in navbar panel 
     * click on button "Create course"
     * type Account name and fill in the form
     * edit course to be event
     * Prerequisites: have an account with the role access 
     * Test Data: Legitimate E-mail and password
     * ExpectedResults: An event course has been created and added to the list of courses.
     */
    it("createEventCourse", async () => {

        console.log('%cAO-role.spec.js line:58 1', 'color: #007acc;', 1);
        //  //*******Arrange******* */
        // await fn.delay(2000);
        await fn.goToAdminNavigation(page);
        await fn.delay(20000);

        await page.click('.menu a:nth-child(2)');
        await fn.checkUrl('admin/courses', page);

        // //*******Act******** */

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

        //***********Assertions**********

        //verify that course has been added to the list of courses 
        await fn.goToAdminNavigation(page);

        await page.click('.menu a:nth-child(2)');
        await fn.delay(20000);
        await page.type('[class=el-input__inner]', courseTitle);
        await fn.delay(20000);
        await page.waitForSelector('text=1');
    }).timeout(2000000);
    /** 
    * Test Case ID: #TestCase03
    * Test Scenario: define appointments
    * Test Steps:
    * Go to Date management interface 
    * click on the desired date in the calendar 
    * fill in the form
    * check Appointment In Calendar
    
    * Prerequisites: have a courseTitle already created  
    * Test Data: courseTitle.
    * ExpectedResults: define appointement for course .
  */
    it("defineAppointment", async () => {
        //******Arrange******** */
        await fn.goToAdminNavigation(page);

        await page.click('.menu a:nth-child(2)');
        await fn.checkUrl('admin/courses', page);

        await page.type('[class=el-input__inner]', courseTitle);
        await fn.delay(30000);

        //wait for notification search
        await page.waitForSelector('text=1');
        //click on selected search result from table
        await page.click('.el-table__body tr:first-child');
        await fn.delay(20000);

        await page.click('"Kursinhalt"');
        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(1)').click();
        });
        await page.waitForSelector('.fc-toolbar-title');
        await fn.delay(30000);

        //********Act******* */

        await page.click('.fc-day-future');
        await page.waitForSelector('.modal__header-wrapper');
        await fn.delay(20000);

        await page.click('"Speichern"');
        await fn.delay(200);
        /***********Assertion******* */
        // await fn.checkAppointmentInCalendar();
        const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(30000);
        chai.expect(content).to.equal('fc-daygrid-event-harness');
        await fn.delay(10000);
    }).timeout(2000000);

    // it("checkAppointmentInCalendar", async () => {
    //     //*********Act/ Assertions********* */

    //     const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
    //     await fn.delay(30000);
    //     chai.expect(content).to.equal('fc-daygrid-event-harness');
    //     await fn.delay(10000);
    // }).timeout(2000000);


    /** 
     * Test Case ID: #TestCase005
     * Test Scenario:openAppointmentDetails 
     * Test Steps:
     * Open calendar
     * check appointment details
     * Prerequisites: An appointement already created  
     * Test Data: Appointement.
     * ExpectedResults: display appointment  details in calendar .
    */
    it("openAppointmentDetails", async () => {
        //******Arrange****** */

        await page.click('.fc-daygrid-event-harness a.fc-event');
        await fn.delay(2000);

        //*******Act / Assertions********* */

        const madalTitle = await page.$eval('.modal__header-wrapper h3.header', e => e.textContent);
        await fn.delay(2000);
        chai.expect(madalTitle).to.equal('Termin bearbeiten');
    }).timeout(2000000);
    /** 
     * Test Case ID: #TestCase06
     * Test Scenario: adjust Appointment
     * Test Steps:
     * Open form
     * Increase capacity 
     * Allow pre-registrations
     * Check online event
     * check that modifications are applied
     * Prerequisites: An appointement already created  
     * Test Data: Appointement.
     * ExpectedResults: increasing capacity and Allow pre-registrations.
    */
    it("adjustAppointment", async () => {
        //*********Act******** */

        // Unlimited capacity
        await page.click('.el-input-number__increase');
        await fn.delay(2000);
        //assertion capacity increased
        const content10 = await page.$eval('[aria-valuenow]', e => e.textContent);
        chai.expect(content10).to.not.equal(0);

        // Allow pre-registrations
        await page.evaluate(() => {
            document.querySelectorAll('.el-switch')[1].click();
        });
        //assertion allow pre-registration 

        const checked = await page.$$('.is-checked');
        chai.expect(checked.length).to.equal(1);

        // online event
        await page.evaluate(() => {
            document.querySelectorAll('.el-switch')[2].click();
        });

        // save modifications
        await page.click('"Speichern"');
        await fn.delay(2000);
        // check that modifications are applied
        // await fn.openAppointmentDetails();
        //*******Assertions*********
        await page.click('.fc-daygrid-event-harness a.fc-event');
        await fn.delay(2000);
        const madalTitle = await page.$eval('.modal__header-wrapper h3.header', e => e.textContent);
        await fn.delay(2000);
        chai.expect(madalTitle).to.equal('Termin bearbeiten');
    }).timeout(2000000);
    /** 
     
     * Test Case ID: #TestCase05
     * Test Scenario: publish event course
     * Test Steps:
     * search for course
     * wait for notification search 
     * Click on selected search result from table
     * click on publish
     * check for account to select
     * select drop down element
     * Prerequisites: a course already created  
     * Test Data: course.
     * ExpectedResults:Course published .
    */
    it("publishEventCourse", async () => {

        //*******Arrange******* */
        await fn.logout(page);
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });

        await fn.goToAdminNavigation(page);
        await page.click('.menu a:nth-child(2)');
        await fn.checkUrl('admin/courses', page);

        await page.type('[class=el-input__inner]', courseTitle);
        // wait for notification search
        await page.waitForSelector('text=1');
        // click on selected search result from table
        await page.click('.el-table__body tr:first-child');

        //*******Act****** */

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

        //*******Assertion***********

        //search for course
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

    }).timeout(2000000);
    /*
     * Test Case ID: #TestCase11
     * Test Scenario: check available appointments
     * Test Steps:
     * Go to interface Date management
     * Display appointements 
           
     * Prerequisites: Have appointments already created
     * Test Data: courses.
     * ExpectedResults: User could consult the list of oppintment in the calendar .
    */
    it("checkAvailableAppointement", async () => {
        //*******Arrange****** */

        // const user = await fn.createUserInAccount(account, page);

        await fn.delay(2000);
        await fn.goToAdminNavigation(page);
        await page.click(`.menu a:nth-child(5)`);
        await fn.checkUrl('admin/event', page);
        await fn.delay(2000);

        //********Act / Assertion********
        const content5 = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(3000);
        chai.expect(content5).to.equal('fc-daygrid-event-harness');

    }).timeout(2000000);
    /*
     * Test Case ID: #TestCase12
     * Test Scenario: perform Preregistration
     * Test Steps:
     * Click on a appointment 
     * Display expected course title
     * increase the number of free places.
           
     * Prerequisites: Have a course  already created
     * Test Data: courses.
     * ExpectedResults:Login as Account Owner and consult details of preregistration .
    */
    it("performPreregistration", async () => {

        //*******Arrange****** */
        await fn.goToAdminNavigation(page)
        await fn.delay(3000);
        await page.click(`.menu a:nth-child(5)`);
        await fn.checkUrl('admin/event', page);
        //*********Act************
        const content2 = await page.$eval('.fc-event-title', e => e.textContent);
        chai.expect(content2).to.equal(courseTitle);
        await page.click('.fc-daygrid-event-harness a.fc-event');
        await page.click('.el-input-number__increase');
        await fn.delay(3000);
        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(2)').click();
        });
        await fn.delay(2000);
        //******Assertions *******/
        await fn.delay(200);
        await fn.logout(page);
        //login as account owner
        await fn.login({ password: user.passwordUser, email: user.emailUser, page });
        await fn.goToAdminNavigation(page);
        await page.click(`.menu a:nth-child(5)`);
        await fn.checkUrl('admin/event', page);
        await fn.delay(2000);
        //click on course
        await page.click('.fc-daygrid-event-harness a.fc-event');
        //details of course (free places and course affected) will appear as expected
        await page.click('#tab-details');


    }).timeout(2000000);
    /*
     * Test Case ID: #TestCase13
     * Test Scenario: assign event course to user 
     * Test Steps:
     * Search for Course title
     * check the box appeared in front  of user .
     * confirm the assignement of the course to the user .
        
     * Prerequisites: Have an appointement already created.
     * Test Data: course and user .
     * ExpectedResults: assign a course to user.
 */
    it("assignEventCourseToUser", async () => {
        //*******Arrange***** */
        await fn.goToAdminNavigation(page);
        await page.click('#tab-registration');
        await page.click('.el-select');
        await page.type('.el-select', courseTitle);

        //*******Act******* */
        await page.click('.el-select-dropdown__item:visible');
        await fn.delay(200);
        await page.click('.mark');
        await fn.delay(200);
        await page.click('.horizontal-row a:nth-child(2)');
        await fn.waitForSuccessMessage('Änderungen erfolgreich gespeichert', page, 2000);
        await fn.logout(page);
        await fn.delay(2000)

        //****Assertions***** */

        //login as Account Owner
        await fn.logout(page);
        await fn.delay(2000);
        await fn.login({ password: user.passwordUser, email: user.emailUser, page });
        await fn.delay(2000);
        //check course 
        await page.waitForSelector(".courses-list__content");
        await fn.delay(200);

        await page.type('.searchbar__input', courseTitle);
        await fn.delay(200);

        const courses = await page.$$('.course-card');
        await fn.delay(200);

        chai.expect(courses.length).to.equal(1);
        await fn.delay(200);


    }).timeout(2000000);

    it("deleteUser", async () => {

        const user = await fn.createUserInAccount(account, page);
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        await fn.delay(2000);
        await fn.deleteUser(user.usernameUser, page);
        await fn.delay(2000);
        await fn.logout(page);
    }).timeout(2000000);
})
// it("assignRolesToUser", async () => {
//     const roles = [ROLE_AO];
//     fn.assignRolesToUser(roles, page);
// }).timeout(2000000);
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


