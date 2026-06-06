const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Test Delivery',
      phone: '9999988888',
      password: 'password123',
      role: 'delivery'
    });
    console.log('Signup success:', res.data);
    const token = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
    console.log('Token:', token);

    // Try to access deliveries
    const res2 = await axios.get('http://localhost:5000/api/deliveries', {
      headers: {
        Cookie: token
      }
    });
    console.log('Deliveries success:', res2.data.data.length);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
