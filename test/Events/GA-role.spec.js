const playwright = require('playwright');
const chai = require('chai');
const fn = require('../../utils/utils');
const { fromUnixTime } = require('date-fns');
let courseTitle;
let account;
let users;

const ROLE_AO = "Account Owner";
const ROLE_USER = "User";
const ROLE_AUSM = "Account User State Manager";
const ROLE_ARU = "Account Reporting User";
const ROLE_ACM = "Account Content Manager";
const ROLE_GUSM = "Global User State Manager";
const TEST_BROWSER="chromium" ;
const TEST_GLOBAL_ADMIN_PASSWORD="tgAT6574_zu_2010" ;
const test_global_admin_user="autotestga@inctec.de"

describe("GA-role", () => {
    before(async function fnc() {
        this.timeout(30000);
        browser = await playwright[TEST_BROWSER].launch({
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
        await fn.login({ password: TEST_GLOBAL_ADMIN_PASSWORD, email: test_global_admin_user, page });
        courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
        account = await fn.createAccount(page);
        users = createUsersWithDifferentRoles(account);

    });

    afterEach(async function afterFn() {
        console.log('%cAdmin-role.spec.js line:46 afterEach', 'color: #007acc;');
        this.timeout(200000);
        if (this.currentTest.state === 'failed') {
            console.log('%cAdmin-role.spec.js line:49 ifFailed Global Admin', 'color: #007acc;');
            await fn.deleteAllRemain(page)
        }
    });

    after(async () => {
        await fn.deleteAllRemain(page)
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

       
        //*******Arrange******* */

        await fn.delay(2000);
        await fn.goToAdminNavigation(page);
        await page.click('.menu a:nth-child(2)');
        await fn.checkUrl('admin/courses', page);

        //*******Act******** */

        // create course
        await page.click('"Kurs erstellen"');
        await fn.checkUrl('admin/courses/edit', page);
        await page.waitForSelector("input[id='course-title']");
        await page.type('[id=course-title]', courseTitle);
        await page.click('"Speichern"');
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
            document.querySelector('.horizontal-row .el-button--primary').click();
        });


         await fn.delay(2000);
         await fn.waitForSuccessMessage('', page, 2000);

        // //***********Assertions**********

        // //verify that course has been added to the list of courses 
        await fn.goToAdminNavigation(page);


        await page.click('.menu a:nth-child(2)');
        await fn.delay(20000);
         await page.type('[class=el-input__inner]', courseTitle);
         await fn.delay(20000);
         await page.waitForSelector('text=1');


    }).timeout(2000000);

    /** 
     * Test Case ID: #TestCase02
     * Test Scenario: adjust event course translation
     * Test Steps:
     * translate title to english
     * check if title is translated correctly
     * Prerequisites: have a courseTitle  
     * Test Data: courseTitle.
     * ExpectedResults: courseTitle translated to english.
     */
    it("adjust event course translation ", async () => {

        await fn.goToAdminNavigation(page);
        await fn.delay(200);

        await page.click('.menu a:nth-child(2)');
        await fn.delay(200);
        await page.type('[class=el-input__inner]', courseTitle);
        await fn.delay(200);
        await page.waitForSelector('text=1');
        await fn.delay(200);

        await page.click('.el-table__body tr:first-child');
        await fn.delay(200);

        await page.click('"Kursinhalt"');
        await fn.delay(200);

        await page.click('"Ubersetzung bearbeiten"');
        await fn.delay(200);
        await page.click('"Editor"');


        await page.evaluate(() => {
            document.querySelectorAll('.el-select-dropdown__list')[1].children[1].click();
        });
        await fn.delay(1000);

        //*******Act******** */

        const input = await page.$$('.el-input__inner');
        await fn.delay(2000);

        const targetTitleInput = input[3];
        await fn.delay(2000);

        const EnglishTitle = courseTitle + "__english";
        await fn.delay(1000);
        await targetTitleInput.type(EnglishTitle);
        await fn.delay(2000);

        await page.click('"Speichern"');
        await fn.delay(2000);

        //***********Assertion****** */

        // check if title is translated correctly 
        const translatedTitle = await page.$eval('tr:nth-child(2) td:nth-child(2) div div', e => e.textContent);
        chai.expect(translatedTitle).to.equal(EnglishTitle);
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
        await fn.delay(20000);

        await page.type('[class=el-input__inner]', courseTitle);
        await fn.delay(30000);

        //wait for notification search
        await page.waitForSelector('text=1');
        await fn.delay(20000);

        //click on selected search result from table
        await page.click('.el-table__body tr:first-child');
        await fn.delay(20000);

        await page.click('"Kursinhalt"');
        await fn.delay(20000);

        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(1)').click();
        });
        await page.waitForSelector('.fc-toolbar-title');
        await fn.delay(30000);

        //********Act******* */

        await page.click('.fc-day-future');
        await page.waitForSelector('.modal__header-wrapper');
        await page.click('"Speichern"');
        await fn.delay(2000);

        //***********Assertion******* */

        // await fn.checkAppointmentInCalendar();

        const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(30000);
        chai.expect(content).to.equal('fc-daygrid-event-harness');

    }).timeout(2000000);


    // it("checkAppointmentInCalendar", async () => {

    //     //*********Act/ Assertions********* */

    //     const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
    //     await fn.delay(30000);
    //     chai.expect(content).to.equal('fc-daygrid-event-harness');

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

        const checked2 = await page.$$('.is-checked');
        chai.expect(checked2.length).to.equal(1);

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

        // const checked = await page.$$('.is-checked');
        // await fn.delay(2000);

        // chai.expect(checked.length).to.equal(2);
        // await fn.delay(2000);

        // await page.click('"Abbrechen"');
        // await fn.delay(2000);

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
        // await page.click('.btn--success');
        // await page.click('.el-button--primary')[2];
        await page.click(`span:has-text("Kurs veröffentlichen")`);

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
    /** 
     * Test Case ID: #TestCase08
     *  Test Scenario: assign event course to users
     *  Test Steps:
     *  go to learn management
     *  type account 
     *  assign event course to all the users in account
     *  Prerequisites: an event course already created  
     *  Test Data: course and account 
     *  ExpectedResults:assign event course to all the users in account.
    */


    // it("assignEventCourse", async () => {

    //     //*******Arrange***** */
    //     await fn.goToAdminNavigation(page);
    //     await page.click('.menu a:nth-child(1)');
    //     await fn.checkUrl('admin/learning', page);
    //     await fn.delay(2000);
    //     await page.evaluate(() => {
    //         document.querySelectorAll('.el-input__inner')[1].click();
    //     });
    //     await page.type('.is-focus .el-input__inner', account);
    //     await page.click('.el-select-dropdown__item:visible');
    //     await page.click('.el-table__body', courseTitle);

    //     //********Act******** */

    //     await page.click('.mark');
    //     await page.click('.btn--success');

    //     //***********Assertion****** */
    //     await fn.logout(page);

    //     for (let index = 0; index < users.length; index++) {
    //         await fn.login({ password: users[index].passwordUser, email: users[index].emailUser, page });
    //         await fn.delay(200);
    //         await page.waitForSelector(".courses-list__content");
    //         await page.type('.searchbar__input', courseTitle);

    //         const courses = await page.$$('.course-card');
    //         chai.expect(courses.length).to.equal(1);

    //     }
    //     // await fn.checkEventCourseAssignment(courseTitle, users);
    // }).timeout(2000000);

    // it("checkEventCourseAssignment", async () => {

    //     //const users = await createUsersWithDifferentRoles(account);
    //     await fn.logout(page);

    // //******Assertions**********

    //     for (let index = 0; index < users.length; index++) {
    //         await fn.login({ password: users[index].passwordUser, email: users[index].emailUser, page });
    //         await fn.delay(200);
    //         await page.waitForSelector(".courses-list__content");
    //         await page.type('.searchbar__input', courseTitle);

    //         const courses = await page.$$('.course-card');
    //         chai.expect(courses.length).to.equal(1);

    //     }

    // }).timeout(2000000);

})

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
