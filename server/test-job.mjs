async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '8888888888', password: 'password123' })
    });
    
    let cookieStr = '';
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      cookieStr = setCookie.split(';')[0];
    }
    
    const jobRes = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr },
      body: JSON.stringify({ title: 'Test', description: 'Test' })
    });
    
    const data = await jobRes.json();
    console.log("STATUS:", jobRes.status);
    console.log("DATA:", data);
  } catch (err) {
    console.log("ERROR:", err);
  }
}
test();
