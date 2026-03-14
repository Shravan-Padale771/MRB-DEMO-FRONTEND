const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

const centreNames = ['Central Examination Hall', 'Prabhat Road Exam Centre', 'Model High School Centre'];
const schoolNames = ['Saraswati Vidyamandir', 'Mount Saint Mary School', 'New English School'];
const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Ananya', 'Ishaan', 'Kavya', 'Rohan', 'Sanya', 'Vihaan', 'Zoya'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Iyer', 'Reddy', 'Khan', 'Singh', 'Deshmukh', 'Joshi'];

async function seedData() {
    console.log('🚀 Starting Bulk Seeding using Existing Regions...');

    try {
        // Fetch existing regions
        console.log('🔍 Fetching existing regions...');
        const regionsRes = await axios.get(`${API_BASE_URL}/regions?size=100`);
        const regions = regionsRes.data.content || [];

        if (regions.length === 0) {
            console.error('❌ No regions found in the database. Please add at least one region first.');
            return;
        }

        console.log(`✅ Found ${regions.length} regions.`);

        for (let rIndex = 0; rIndex < regions.length; rIndex++) {
            const region = regions[rIndex];
            const regionId = region.regionId;
            const regionName = region.regionName;
            
            console.log(`\n📍 Processing Region: ${regionName} (#${regionId})`);

            for (let cIndex = 0; cIndex < centreNames.length; cIndex++) {
                const centreName = `${regionName} ${centreNames[cIndex]}`;
                const centreCode = `EC-${regionName.substring(0, 3).toUpperCase()}${cIndex + 1}${Math.floor(Math.random() * 90) + 10}`;
                
                // 1. Create Exam Centre with query param
                const centreRes = await axios.post(`${API_BASE_URL}/exam-centres?regionId=${regionId}`, {
                    centreName,
                    centreCode
                });
                const centreId = centreRes.data.centreId;
                console.log(`  🏢 Created Centre: ${centreName} (${centreCode})`);

                for (let sIndex = 0; sIndex < schoolNames.length; sIndex++) {
                    const schoolName = `${schoolNames[sIndex]} - ${regionName}`;
                    
                    // 2. Create School with query param (using centreId as per controller)
                    const schoolRes = await axios.post(`${API_BASE_URL}/schools?centreId=${centreId}`, {
                        schoolName
                    });
                    const schoolId = schoolRes.data.schoolId;
                    console.log(`    🏫 Created School: ${schoolName}`);

                    const studentPromises = [];
                    for (let stIndex = 0; stIndex < 20; stIndex++) {
                        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                        const rollNumber = `R-${regionId}-${centreId}-${schoolId}-${stIndex + 1}`;
                        
                        // 3. Create Students (Bulk in parallel for speed) with query param
                        studentPromises.push(axios.post(`${API_BASE_URL}/students?schoolId=${schoolId}`, {
                            firstName,
                            lastName,
                            rollNumber,
                            dob: '2010-01-01',
                            gender: stIndex % 2 === 0 ? 'MALE' : 'FEMALE',
                            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}@mrb-example.com`,
                            phoneNumber: `98${Math.floor(Math.random() * 90000000) + 10000000}`,
                            category: 'GENERAL',
                            regionId: regionId
                        }));
                    }
                    await Promise.all(studentPromises);
                    console.log(`      🎓 Added 20 students to ${schoolName}`);
                }
            }
        }
        console.log('\n✅ Bulk Seeding Completed Successfully!');
    } catch (error) {
        console.error('\n❌ Seeding Failed:');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error(error.message);
        }
    }
}

seedData();
