# Test scenarios for GA Assign course

**test case refers to**

1.  Global Admin roles


**this test case refers to the sequence of actions required to verify  specific features/functionalities** 

1. Create an account
2. Create Course
3. delete course
4. delete account
5. Login Via Self Registration And Generate Link
6. navigate to an interface Search for an element And Delete it 
7. Navigate to the profil

**API overviews** 
v2/general/login
api/v1/accounts 
api/v1/courses/
api/v1/users
..
..
.

**run test** 

npm run test test/GACreateDeleteCourse/gaCreateDeleteCourse-10.spec.js
