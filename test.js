import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('https://fiu-uat.setu.co/v2/auth/token', {
      clientID: 'e781f263-917b-4be2-921e-b55770ecfa33',
      secret: 'j10O9Bv4Y9yvccZe4EIb5zkuNO3zFQSd'
    });
    console.log("SUCCESS 1:", res.data);
  } catch (err) {
    console.error("ERROR 1:", err.response?.data || err.message);
  }

  try {
    const res2 = await axios.post('https://fiu-uat.setu.co/api/v2/auth/token', {
      clientID: 'e781f263-917b-4be2-921e-b55770ecfa33',
      secret: 'j10O9Bv4Y9yvccZe4EIb5zkuNO3zFQSd'
    });
    console.log("SUCCESS 2:", res2.data);
  } catch (err) {
    console.error("ERROR 2:", err.response?.data || err.message);
  }
}
test();
