const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

// Professional Placeholder Assets (Unsplash)
const MALE_PHOTO = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop';
const FEMALE_PHOTO = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop';
const SIGNATURE = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=100&fit=crop';
const SCHOOL_STAMP = 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=200&h=200&fit=crop';
const SCHOOL_PHOTO = 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&h=600&fit=crop';
const ID_PROOF = 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=600&h=400&fit=crop';

const categories = ['General', 'OBC', 'SC', 'ST'];
const qualifications = ['10th Pass', '12th Pass', 'Undergraduate', 'Postgraduate'];
const boardAffiliations = ['CBSE', 'ICSE', 'State Board', 'International Board'];
const instructionMediums = ['English', 'Hindi', 'Marathi', 'Standard'];

const maleFirstNames = ['Aarav', 'Arjun', 'Ishaan', 'Vihaan', 'Rohan', 'Kabir', 'Aryan', 'Vivaan', 'Aditya', 'Sai'];
const femaleFirstNames = ['Aditi', 'Ananya', 'Kavya', 'Sanya', 'Zoya', 'Ishani', 'Myra', 'Kiara', 'Diya', 'Riya'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Iyer', 'Reddy', 'Khan', 'Singh', 'Deshmukh', 'Joshi'];

async function unifiedSeed() {
    console.log('🚀 Starting Unified Seeding (Centers, Schools, Students, Profiles)...');

    try {
        // 1. Fetch Existing Regions
        console.log('🔍 Fetching existing regions...');
        const regionsRes = await axios.get(`${API_BASE_URL}/regions?size=100`);
        const regions = regionsRes.data.content || [];

        if (regions.length === 0) {
            console.error('❌ No regions found. Please add at least one region first.');
            return;
        }

        console.log(`Found ${regions.length} regions. Starting creation cycle...`);

        for (const region of regions) {
            console.log(`\n📍 Processing Region: ${region.regionName} (ID: ${region.regionId})`);

            // 2. Create one Exam Center per Region
            const centreResponse = await axios.post(`${API_BASE_URL}/exam-centres?regionId=${region.regionId}`, {
                centreName: `${region.regionName} Central Examination Centre`,
                centreCode: `${region.regionName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                address: `Main Street, ${region.regionName}`,
                pincode: '411001'
            });
            const centre = centreResponse.data;
            console.log(`  🏢 Created Exam Centre: ${centre.centreName} (ID: ${centre.centreId})`);

            // 3. Create two Schools per Exam Center
            for (let i = 1; i <= 2; i++) {
                const schoolName = `${region.regionName} Model High School ${i}`;
                const timestamp = Date.now();
                
                const schoolResponse = await axios.post(`${API_BASE_URL}/schools?centreId=${centre.centreId}`, {
                    schoolName: schoolName,
                    schoolCode: `SCH-${region.regionName.substring(0, 2).toUpperCase()}-${i}-${Math.floor(Math.random() * 100)}`,
                    boardAffiliation: boardAffiliations[Math.floor(Math.random() * boardAffiliations.length)],
                    mediumOfInstruction: instructionMediums[Math.floor(Math.random() * instructionMediums.length)],
                    establishmentYear: 1980 + Math.floor(Math.random() * 40),
                    principalName: `Principal ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                    officialEmail: `admin${i}@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
                    principalContactNumber: '91' + Math.floor(10000000 + Math.random() * 90000000),
                    secondaryContactNumber: '020-' + Math.floor(2000000 + Math.random() * 7000000),
                    websiteUrl: `www.${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
                    seatingCapacity: 200 + Math.floor(Math.random() * 300),
                    numberOfClassrooms: 15 + Math.floor(Math.random() * 20),
                    cctvAvailable: true,
                    address: {
                        line1: `${Math.floor(Math.random() * 100)}, Education Square`,
                        villageOrCity: region.regionName,
                        state: 'Maharashtra',
                        pincode: '411002'
                    },
                    principalSignatureUrl: `${SIGNATURE}?v=sch_sig_${timestamp}_${i}`,
                    schoolStampUrl: `${SCHOOL_STAMP}?v=sch_stamp_${timestamp}_${i}`,
                    bannerUrl: `${SCHOOL_PHOTO}?v=sch_banner_${timestamp}_${i}`
                });
                const school = schoolResponse.data;
                console.log(`    🏫 Created School: ${school.schoolName} (ID: ${school.schoolId})`);

                // 4. Create five Students per School
                for (let j = 1; j <= 5; j++) {
                    const isMale = j % 2 !== 0; // Alternating gender
                    const firstName = isMale 
                        ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
                        : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
                    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${j}${i}@example.com`;
                    
                    const studentRes = await axios.post(`${API_BASE_URL}/students?schoolId=${school.schoolId}`, {
                        firstName: firstName,
                        lastName: lastName,
                        middleName: 'NMN',
                        email: email,
                        contact: '9' + Math.floor(100000000 + Math.random() * 900000000),
                        age: 12 + Math.floor(Math.random() * 10),
                        motherTongue: 'Hindi',
                        password: 'password123',
                        confirmPassword: 'password123'
                    });
                    const student = studentRes.data;
                    console.log(`      🎓 Created Student: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);

                    // 5. Create Profile for Student
                    const photoUrl = isMale ? MALE_PHOTO : FEMALE_PHOTO;
                    const profileTimestamp = Date.now();
                    
                    const profileData = {
                        dateOfBirth: `20${10 + Math.floor(Math.random() * 5)}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 9)}`,
                        gender: isMale ? 'Male' : 'Female',
                        category: categories[Math.floor(Math.random() * categories.length)],
                        previousExamName: 'Junior Hindi Level 1',
                        previousExamMarks: (75 + Math.random() * 20).toFixed(2),
                        previousExamYear: 2024,
                        previousExamRollNo: `ROLL-${i}-${j}-${Math.floor(Math.random() * 1000)}`,
                        fatherName: `Mr. ${lastName}`,
                        motherName: `Mrs. ${lastName}`,
                        guardianContact: '9' + Math.floor(100000000 + Math.random() * 900000000),
                        qualification: qualifications[0],
                        profilePhotoUrl: `${photoUrl}&unique=${student.studentId}_${profileTimestamp}`,
                        signatureUrl: `${SIGNATURE}&unique=${student.studentId}_${profileTimestamp}`,
                        idProofNumber: `Aadhar-${Math.floor(Math.random() * 1000000000000)}`,
                        idProofDocumentUrl: `${ID_PROOF}&unique=${student.studentId}_${profileTimestamp}`,
                        profileCompletionStatus: 'Complete',
                        address: {
                            line1: `${Math.floor(Math.random() * 1000)}, Student Residence`,
                            villageOrCity: region.regionName,
                            state: 'Maharashtra',
                            pincode: '411005'
                        }
                    };

                    await axios.post(`${API_BASE_URL}/studentProfiles?studentId=${student.studentId}`, profileData);
                    console.log(`        ✅ Profile Created for ${student.firstName}`);
                }
            }
        }

        console.log('\n🌟 Unified Seeding completed successfully!');

    } catch (error) {
        if (error.response) {
            console.error('❌ Seeding failed with status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Seeding failed:', error.message);
        }
    }
}

unifiedSeed();
