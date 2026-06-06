const axios = require('axios');
async function test() {
  try {
    // 1. Get a mock token by logging in
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      phone: '8888888888', // Ramesh Patil
      password: 'password123'
    });
    const cookie = loginRes.headers['set-cookie'][0];
    
    // 2. Try to create job
    const jobRes = await axios.post('http://localhost:5000/api/jobs', {
      title: 'Test', description: 'Test'
    }, {
      headers: { Cookie: cookie }
    });
    console.log("SUCCESS:", jobRes.data);
  } catch (err) {
    console.log("ERROR DATA:", err.response ? err.response.data : err.message);
  }
}
test();
