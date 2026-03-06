const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  try {
    // 0. register
    const testEmail = `test_${Date.now()}@example.com`;
    await axios.post('http://localhost:3000/api/auth/register', {
      full_name: 'Test Student',
      email: testEmail,
      password: 'password123',
      role_id: 1,
      department_id: 1,
      phone_no: '1234567890',
      roll_no: `TEST-${Date.now()}`,
      year: 1
    });

    // 1. authenticate
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: testEmail, 
      password: 'password123' 
    });
    
    const token = loginRes.data.token;
    
    console.log("Logged in successfully.");

    // 2. Create a complaint
    const createRes = await axios.post('http://localhost:3000/api/complaints', {
      title: "Test Complaint for Upload",
      description: "Testing upload route",
      incident_type_id: 1,
      parties_involved: [{ accused_name: "Test Accused" }],
      is_anonymous: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const complaintId = createRes.data.complaint.complaint_id;
    console.log(`Created and uploading to complaint ID: ${complaintId}`);
    
    // 3. create a dummy file
    const filePath = path.join(__dirname, 'dummy-evidence.txt');
    fs.writeFileSync(filePath, 'This is a test evidence file content.');
    
    // 4. upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const uploadRes = await axios.post(`http://localhost:3000/api/complaints/${complaintId}/evidence`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Upload Success:", uploadRes.data);
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.response) {
      console.error("Upload Failed Status:", error.response.status);
      console.error("Upload Failed Data:", error.response.data);
    } else {
      console.error("Upload Error:", error.message);
    }
  }
}

testUpload();
