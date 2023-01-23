# elearning-ui-tests
UI tests for elearning product

**Initial Setup**

1. Install libraries
    ```bash
    npm install
    ```
2. Rename the .env.example to .env

    ```bash
    TEST_GLOBAL_ADMIN_USER=
    TEST_GLOBAL_ADMIN_PASSWORD=
    TEST_USER=
    TEST_PASSWORD=
    ```
set passwords and users for Global Admin and User

3. run all tests
    ```bash
    npm run test
    ```
4. run a specific  describe  or it 
    ```bash
   npm run test -- --file "basicTest-3.spec.js"
    npm run test -- --grep "gaRemoveCourseAssignment"
    ```
5. run a test not in default folder
    ```bash
    npm run test test/"folder name"/"file.spec.js"
    ```
5.test each it separetteley
npm run test -- --grep "create account and generate link"
