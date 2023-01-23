const playwright = require('playwright');
const chai = require('chai');
const fn = require('../../utils/utils');
const { fromUnixTime } = require('date-fns');
let user;
let account;
let firstname;
let lastname;
let nameLastname;
const ROLE_AO = "Account Owner";
const ROLE_USER = "User";
const ROLE_AUSM = "Account User State Manager";
const ROLE_ARU = "Account Reporting User";
const ROLE_ACM = "Account Content Manager";
const ROLE_GUSM = "Global User State Manager";
const ROLE_TRAINER = "Trainer"

describe("Trainer-role", () => {

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
        //First we should connect as admin to create the trainer ,then we connect with the new trainer ,
        await fn.delay(2000);
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        account = await fn.createAccount(page);
        courseTitle = process.env.COURSE_TITLE + fn.getRandomInt(10000, 99999).toString();
        const user = await fn.createUserInAccount(account, page);
        firstname = user.firstNameUser;
        lastname = user.lastNameUser

    });

    afterEach(async function afterFn() {
        console.log('%cAdmin-role.spec.js line:46 afterEach', 'color: #007acc;');
        this.timeout(200000);
        if (this.currentTest.state === 'failed') {
            console.log('%cAdmin-role.spec.js line:49 ifFailed Admin', 'color: #007acc;');
            await fn.logout(page);
            await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
            await fn.deleteAllRemain(page)
        }
    });

    after(async () => {
        await fn.logout(page);
        await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        await fn.deleteAllRemain(page)


        if (!page.isClosed()) {
            browser.close();
        }

    });

    it("assignRolesToUser", async () => {
        const roles = [ROLE_TRAINER];
        fn.assignRolesToUser(roles, page);

    }).timeout(2000000);

    // it("checkIfRolesAssigned", async () => {
    //     const roles = [ROLE_TRAINER];
    //     fn.checkIfRolesAssigned(roles, page);

    // }).timeout(2000000);

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
        await affectTrainer(firstname, lastname);
        await fn.delay(2000);

        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(4)').click();
        });
        await fn.delay(500);
        console.log("fin create course")
        //***********Assertions**********

        //verify that course has been added to the list of courses 
        await fn.goToAdminNavigation(page);

        await page.click('.menu a:nth-child(2)');
        await fn.delay(20000);
        await page.type('[class=el-input__inner]', courseTitle);
        await fn.delay(20000);
        await page.waitForSelector('text=1');
    }).timeout(2000000);
    /*
    Test Case ID: #TestCase03
    Test Scenario: define appointments
    Test Steps:
        *Go to Date management interface 
        *click on the desired date in the calendar 
        *fill in the form
        *check Appointment In Calendar
 
    Prerequisites: have a courseTitle already created  
    Test Data: courseTitle.
    ExpectedResults: define appointement for course .

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
        //click on selected search result from table
        await page.click('.el-table__body tr:first-child');
        await page.click('"Kursinhalt"');
        await page.evaluate(() => {
            document.querySelector('.horizontal-row a:nth-child(1)').click();
        });
        await page.waitForSelector('.fc-toolbar-title');
        await fn.delay(30000);

        //********Act******* */

        await page.click('.fc-day-future');
        await page.waitForSelector('.modal__header-wrapper');
        await page.click('"Speichern"');
        await fn.delay(200);
        /***********Assertion******* */
        //  await fn.checkAppointmentInCalendar();
        const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(10000);
        chai.expect(content).to.equal('fc-daygrid-event-harness');
        await fn.delay(10000);

    }).timeout(2000000);

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

        await fn.delay(2000);

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
        await fn.delay(2000);

        // Unlimited capacity
        await page.click('.el-input-number__increase')[1];
        await fn.delay(2000);
        //assertion capacity increased
        const content10 = await page.$eval('[aria-valuenow]', e => e.textContent);
        chai.expect(content10).to.not.equal(0);


        // Allow pre-registrations
        await page.evaluate(() => {
            document.querySelectorAll('.el-switch')[1].click();
        });
        await fn.delay(2000);

        //assertion allow pre-registration 

        const checked = await page.$$('.is-checked');
        chai.expect(checked.length).to.equal(1);
        // online event
        await page.evaluate(() => {
            document.querySelectorAll('.el-switch')[2].click();
        });
        await fn.delay(2000);

        // // save modifications
        await page.click('"Speichern"');
        await fn.delay(2000);
        // check that modifications are applied
        // await fn.openAppointmentDetails();

        //*******Assertions*********
        // await page.click('.fc-daygrid-event-harness a.fc-event');
        // await fn.delay(2000);
        // const madalTitle = await page.$eval('.modal__header-wrapper h3.header', e => e.textContent);
        // await fn.delay(2000);
        // chai.expect(madalTitle).to.equal('Termin bearbeiten');

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

        const account = 0;
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
    /**
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
        // const account = await fn.createAccount(page);
        // const user = await fn.createUserInAccount(account, page);
        const user = await fn.createUserInAccount(account, page);
        await fn.delay(20000);

        await fn.login({ password: user.passwordUser, email: user.emailUser, page });
        await fn.delay(10000);


        await fn.goToAdminNavigation(page);
        await page.click(`.menu a:nth-child(5)`);
        await fn.checkUrl('admin/event', page);
        await fn.delay(2000);

        //********Act / Assertion********

        const content5 = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(3000);
        chai.expect(content5).to.equal('fc-daygrid-event-harness');

    }).timeout(2000000);

    // it("checkAppointmentInCalendar", async () => {
    //      //*********Act/ Assertions********* */

    //     const content = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
    //     await fn.delay(10000);
    //     chai.expect(content).to.equal('fc-daygrid-event-harness');
    //     await fn.delay(10000);

    // }).timeout(2000000);

    /**
        * Test Case ID: #TestCase11
        * Test Scenario: select Course
        * Test Steps:
        * Search for a course  by typing the course title 
        * Choose expected course title
        
        * Prerequisites: Have a course  already created
        * Test Data: course.
        * ExpectedResults: select the Course
    */
    it("selectCourse", async () => {
        await page.click('.el-input__inner');
        await page.type('.is-focus .el-input__inner', courseTitle);
        await page.click('.el-select-dropdown__item:visible');
        await fn.delay(2000);

    }).timeout(2000000);


    /** 
         * Test Case ID: #TestCase013
         * Test Scenario: registerEventToUser
         * Test Steps:
         * Go to Registration tab 
         * Select an account
         * Wait for assertion message.
         
         * Prerequisites: Have a course  already created
         * Test Data: course , account.
         * ExpectedResults: Success toast indicate that Changes has been succesfully saved.
     */
    it("registerEventToUser", async () => {

        //*******Arrange***** */
        // performPreregistration
        const account = await fn.createAccount(page);
        const user = await fn.createUserInAccount(account, page);

        await fn.delay(3000);

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


        await page.click('#tab-registration');
        await page.click('.el-select');
        await page.type('.el-select', account);

        //*******Act******* */

        await page.click('.el-select-dropdown__item:visible');
        await fn.delay(200);
        await page.click('.mark');
        await fn.delay(200);
        await page.click('.horizontal-row a:nth-child(2)');
        await fn.delay(200);
        await fn.logout(page);
        await fn.delay(2000);
        await fn.waitForSuccessMessage('Änderungen erfolgreich gespeichert', page, 2000);

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

    /**
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
        const account = await fn.createAccount(page);
        const user = await fn.createUserInAccount(account, page);
        await fn.login({ password: user.passwordUser, email: user.emailUser, page });
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

    /** 
     * Test Case ID: #TestCase14
     * Test Scenario: Explore details of events per day 
     * Test Steps:
     * Go to interface Date management
     * Display calendar by days 
     * balance between days by clicking on the right arrow in order to display the courses .

     * Prerequisites: Have a course  already created
     * Test Data: course.
     * ExpectedResults: User could consult the list of events per day  in the calendar .
       
    */
    it("checkEventsPerDay", async () => {

        //*******Arrange****** */

        await page.click('"Tag"');
        await page.click('.fc-icon-chevron-right');

        //********Act / Assertion********

        const content6 = await page.$eval('td.fc-day-future div div:nth-child(2) div', e => e.className);
        await fn.delay(3000);
        chai.expect(content6).to.equal('fc-timegrid-event-harness');
        //assert concrete event
        const concrete = await page.$eval('.fc-sticky', e => e.textContent);
        chai.expect(concrete).to.equal(courseTitle);


    }).timeout(2000000);

    /** 
     * Test Case ID: #TestCase15
     * Test Scenario: Search for user 
     * Test Steps:
     * Type user name 
     * Check course details 
     * Prerequisites: Have a user and a course  already created
     * Test Data: course and a user .
     * ExpectedResults: search for a user assigned to a course in a day.
      
    */
    it("searchForUser", async () => {
        //*******Arrange***** */
        // const user = await fn.createUserInAccount(account, page);
        await page.click('.fc-event-main-frame');
        await fn.delay(2000);
        await page.click('.el-input__inner');

        //*******Act******* */

        await page.evaluate(() => {
            page.click('.el-select-dropdown__item:visible');
        });
        await fn.delay(2000);
        await page.click('.el-tabs__nav div:nth-child(3)');
        await fn.delay(1000);
        await fn.delay(2000);
        await fn.logout(page);

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
    /*
        * Test Case ID: #TestCase16
        * Test Scenario: Document user's participation and result
        * Test Steps:
        * Login as admin
        * Go to tests interface
        * create a new test and assign it to a trainer user 
        * fill in  the form by chosen the type of test ,the date and the timing after it the test is considered as missed
        * create a document by chosen the result either positive or negative

        * Prerequisites: A trainer account already created 
        * Test Data: trainer user .
        * ExpectedResults: Document or display the result of test . 
      
    */
    it("createTest", async () => {

        //*******Arrange***** */

        //login as admin 
        // await fn.login({ password: process.env.TEST_ADMIN_PASSWORD, email: process.env.test_admin_user, page });
        await fn.delay(2000);

        await fn.goToTestsNavigation(page)
        await fn.delay(2000);
        await page.click('.el-button');
        await fn.delay(2000);

        //*******Act******* */

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

        //****Assertion***** */
        await page.click(`.navbar div:nth-child(2)`);

        await fn.delay(200);

        const tests = await page.$$('.el-table__row');
        await fn.delay(200);

        chai.expect(tests.length).to.equal(1);
        await fn.delay(200);
        //assertion  concrete test
        await fn.goToTestsNavigation(page)
        await page.click('"Abgeschlossen"');


        const concretetest = await page.$eval('.el-table__body tr:first-child td:nth-child(2) div span', e => e.textContent);
        await fn.delay(2000);
        nameLastname = `${firstname} ${lastname}`;
        chai.expect(concretetest).to.equal('nameLastname');

    }).timeout(2000000);

   
})
async function affectTrainer(firstname, lastname) {
    await page.click('#trainers');
    await fn.delay(2000);
    await page.click(`"${firstname} ${lastname}"`)
    await fn.delay(2000);
}