async function testSignup() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Acme Corp',
        fullName: 'Daipayan Majhi',
        email: 'admin@acmecorp.com',
        phone: '+1 234 567 8900',
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      console.log('SUCCESS:', data);
    } else {
      console.log('API ERROR:', res.status, data);
    }
  } catch (err) {
    console.log('NETWORK ERROR:', err.message);
  }
}

testSignup();
