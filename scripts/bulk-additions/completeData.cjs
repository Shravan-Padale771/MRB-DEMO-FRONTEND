const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

// Real-looking placeholder images (Unsplash)
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

async function completeData() {
    console.log('🚀 Starting Bulk Completion of Profiles and School Details...');

    try {
        // 1. Fetch all students
        console.log('🔍 Fetching students...');
        const studentsRes = await axios.get(`${API_BASE_URL}/students?size=1000`);
        const students = studentsRes.data.content || [];
        console.log(`Found ${students.length} students.`);

        // 2. Fetch all schools
        console.log('🔍 Fetching schools...');
        const schoolsRes = await axios.get(`${API_BASE_URL}/schools?size=1000`);
        const schools = schoolsRes.data.content || [];
        console.log(`Found ${schools.length} schools.`);

        // 3. Complete Student Profiles
        for (const st of students) {
            try {
                // Check if profile exists
                let profile;
                try {
                    const profileRes = await axios.get(`${API_BASE_URL}/studentprofile/studentId/${st.studentId}`);
                    profile = profileRes.data;
                } catch (e) {
                    // 404 is expected if profile doesn't exist
                }

                const gender = Math.random() > 0.5 ? 'Male' : 'Female';
                const photoUrl = gender === 'Male' ? MALE_PHOTO : FEMALE_PHOTO;
                const timestamp = Date.now();
                const uniqueId = st.studentId || Math.floor(Math.random() * 1000000);

                const profileData = {
                    dateOfBirth: `200${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 9)}`,
                    gender: gender,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    previousExamName: 'SSC Board Exam',
                    previousExamMarks: (70 + Math.random() * 25).toFixed(2),
                    previousExamYear: 2023,
                    previousExamRollNo: `R-${Math.floor(Math.random() * 1000000)}`,
                    fatherName: `Mr. ${st.lastName} Sr.`,
                    motherName: `Mrs. ${st.lastName} Sr.`,
                    guardianContact: '98' + Math.floor(10000000 + Math.random() * 90000000),
                    qualification: qualifications[Math.floor(Math.random() * qualifications.length)],
                    // Simulating unique filenames by appending query params if direct strings are stored,
                    // or just using the unique strings as the user requested for "unique uploads"
                    profilePhotoUrl: `${photoUrl}&v=${uniqueId}_${timestamp}`,
                    signatureUrl: `${SIGNATURE}&v=${uniqueId}_${timestamp}`,
                    idProofNumber: `ID-${uniqueId}`,
                    idProofDocumentUrl: `${ID_PROOF}&v=${uniqueId}_${timestamp}`,
                    profileCompletionStatus: 'Complete',
                    address: {
                        line1: `${Math.floor(Math.random() * 500)}, Main Road`,
                        line2: 'Near Central Park',
                        villageOrCity: 'Pune',
                        taluka: 'Haveli',
                        district: 'Pune',
                        state: 'Maharashtra',
                        pincode: '411001'
                    }
                };

                if (profile && profile.profileId) {
                    console.log(`Updating profile for student: ${st.firstName} (#${st.studentId})`);
                    await axios.put(`${API_BASE_URL}/studentProfiles/${profile.profileId}`, {
                        ...profileData,
                        studentId: st.studentId,
                        profileId: profile.profileId
                    });
                } else {
                    console.log(`Creating profile for student: ${st.firstName} (#${st.studentId})`);
                    await axios.post(`${API_BASE_URL}/studentProfiles?studentId=${st.studentId}`, {
                        ...profileData,
                        studentId: st.studentId
                    });
                }
            } catch (err) {
                console.error(`Failed for student ${st.studentId}:`, err.message);
            }
        }

        // 4. Complete School Details
        for (const sc of schools) {
            try {
                console.log(`Updating details for school: ${sc.schoolName}`);
                const timestamp = Date.now();
                const schoolUpdate = {
                    ...sc,
                    boardAffiliation: boardAffiliations[Math.floor(Math.random() * boardAffiliations.length)],
                    mediumOfInstruction: instructionMediums[Math.floor(Math.random() * instructionMediums.length)],
                    establishmentYear: 1980 + Math.floor(Math.random() * 40),
                    principalName: `Principal ${sc.schoolName.split(' ')[0]}`,
                    officialEmail: `admin@${sc.schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
                    principalContactNumber: '91' + Math.floor(10000000 + Math.random() * 90000000),
                    secondaryContactNumber: '020-' + Math.floor(2000000 + Math.random() * 7000000),
                    websiteUrl: `www.${sc.schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
                    seatingCapacity: 200 + Math.floor(Math.random() * 300),
                    numberOfClassrooms: 15 + Math.floor(Math.random() * 20),
                    cctvAvailable: true,
                    address: {
                        line1: `${Math.floor(Math.random() * 100)}, School Lane`,
                        villageOrCity: 'Pune',
                        taluka: 'Haveli',
                        district: 'Pune',
                        state: 'Maharashtra',
                        pincode: '411002'
                    },
                    principalSignatureUrl: `${SIGNATURE}&v=school_${sc.schoolId}_${timestamp}`,
                    schoolStampUrl: `${SCHOOL_STAMP}&v=school_${sc.schoolId}_${timestamp}`,
                    bannerUrl: `${SCHOOL_PHOTO}&v=school_${sc.schoolId}_${timestamp}`
                };

                await axios.put(`${API_BASE_URL}/schools`, schoolUpdate);
            } catch (err) {
                console.error(`Failed for school ${sc.schoolId}:`, err.message);
            }
        }

        console.log('✅ Bulk completion finished successfully!');

    } catch (error) {
        console.error('❌ Bulk completion failed:', error.message);
    }
}

completeData();
