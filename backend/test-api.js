// Simple API test script for the backend
// Run this after starting the backend server

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing ShadCN UI Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('   Database status:', healthData.database);
    console.log('   Timestamp:', healthData.timestamp);
    console.log('');

    // Test announcements categories
    console.log('2. Testing announcements categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/announcements/categories/list`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories loaded:', categoriesData.categories.length);
    console.log('   Categories:', categoriesData.categories.map(c => c.label).join(', '));
    console.log('');

    // Test events types
    console.log('3. Testing events types...');
    const eventTypesResponse = await fetch(`${BASE_URL}/events/types/list`);
    const eventTypesData = await eventTypesResponse.json();
    console.log('✅ Event types loaded:', eventTypesData.types.length);
    console.log('   Types:', eventTypesData.types.map(t => t.label).join(', '));
    console.log('');

    // Test marketplace categories
    console.log('4. Testing marketplace categories...');
    const marketplaceCategoriesResponse = await fetch(`${BASE_URL}/marketplace/categories/list`);
    const marketplaceCategoriesData = await marketplaceCategoriesResponse.json();
    console.log('✅ Marketplace categories loaded:', marketplaceCategoriesData.categories.length);
    console.log('   Categories:', marketplaceCategoriesData.categories.map(c => c.label).join(', '));
    console.log('');

    // Test contacts departments
    console.log('5. Testing contacts departments...');
    const departmentsResponse = await fetch(`${BASE_URL}/contacts/departments/list`);
    const departmentsData = await departmentsResponse.json();
    console.log('✅ Departments loaded:', departmentsData.departments.length);
    console.log('   Departments:', departmentsData.departments.map(d => d.label).join(', '));
    console.log('');

    // Test user registration (this will fail without proper data, but we can see the validation)
    console.log('6. Testing user registration validation...');
    const registrationResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty data to test validation
    });
    
    if (registrationResponse.status === 400) {
      const errorData = await registrationResponse.json();
      console.log('✅ Validation working correctly');
      console.log('   Error:', errorData.error);
      console.log('   Details:', errorData.details?.length || 0, 'validation errors');
    } else {
      console.log('⚠️  Unexpected response:', registrationResponse.status);
    }
    console.log('');

    console.log('🎉 All basic API tests completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Create a .env file with your configuration');
    console.log('   2. Ensure MongoDB is running');
    console.log('   3. Test user registration with valid data');
    console.log('   4. Test login functionality');
    console.log('   5. Test protected endpoints with authentication');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure the backend server is running on port 5000');
    console.log('   2. Check if there are any error messages in the server console');
    console.log('   3. Verify your .env configuration');
    console.log('   4. Ensure MongoDB is accessible');
  }
}

// Run the test
testAPI();
