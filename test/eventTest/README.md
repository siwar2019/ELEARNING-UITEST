# Test scenarios for events 

**test case refers to**

1.  Global Admin roles
2.  Admin role
3.  Account Owner role
4.  Trainer role

**this test case refers to the sequence of actions required to verify  specific features/functionalities** 

1. Create an event course and publish it then create an appointement and register a user for it(For Global Admin role & Admin role). 
2. Check available appointments ,assign event course to user and then register that user to an appointment .(For account owner role)
3. Explore Appointments for relevant events per day and documment the test (For trainer role)

**API overviews** 
v2/general/login
api/v1/accounts 
api/v1/courses/
api/v1/users
..
..
.

**run test** 

npm run test test/eventTest
