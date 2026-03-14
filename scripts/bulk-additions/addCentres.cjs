const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

const regionsToSeed = ['Mumbai', 'Nashik', 'Pune', 'Thane'];
const centreTemplates = ['Main Centre', 'Regional Centre', 'City Centre'];

async function addCentres() {
    console.log('🚀 Starting Exam Centre Seeding...');

    try {
        // 1. Fetch regions to get correct IDs
        console.log('🔍 Fetching current regions...');
        const regionsRes = await axios.get(`${API_BASE_URL}/regions?size=100`);
        let regions = [];
        if (Array.isArray(regionsRes.data)) {
            regions = regionsRes.data;
        } else if (regionsRes.data && regionsRes.data.content) {
            regions = regionsRes.data.content;
        }

        console.log(`✅ Found ${regions.length} regions.`);

        for (const regionName of regionsToSeed) {
            const region = regions.find(r => r.regionName === regionName);
            if (!region) {
                console.warn(`⚠️ Region ${regionName} not found on server. Skipping.`);
                continue;
            }

            console.log(`\n📍 Adding centres for ${regionName} (#${region.regionId})...`);

            for (let i = 0; i < centreTemplates.length; i++) {
                const centreName = `${regionName} ${centreTemplates[i]}`;
                const centreCode = `${regionName.substring(0, 2).toUpperCase()}${100 + i}${Math.floor(Math.random() * 10)}`;

                // We will use the new query parameter pattern
                const payload = {
                    centreCode,
                    centreName
                };

                console.log(`  📤 Sending payload: ${JSON.stringify(payload)} with regionId=${region.regionId}`);

                try {
                    const res = await axios.post(`${API_BASE_URL}/exam-centres?regionId=${region.regionId}`, payload);
                    console.log(`  ✅ Created: ${res.data.centreName} (ID: ${res.data.centreId})`);
                } catch (err) {
                    console.error(`  ❌ Failed to create ${centreName}:`);
                    if (err.response) {
                        console.error(`    Status: ${err.response.status}`);
                        console.error(`    Error Body: ${JSON.stringify(err.response.data, null, 2)}`);
                    } else {
                        console.error(`    Error: ${err.message}`);
                    }
                }
            }
        }

    } catch (error) {
        console.error('💥 Critical Error in Script:', error.message);
    }
}

addCentres();
