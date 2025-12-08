import https from 'https';

const projectId = "knxacwrxwwnptvqbqfhi";
const url = `https://${projectId}.supabase.co/rest/v1/`;
const key = "sb_publishable_ACxvoxecjunjShgr_pj3sQ_8jKEzMIT"; // Note: This looks like a truncated or invalid key in the original file, but using it as is for now to test connection to the domain.
// Actually, let's use the key from .env if possible, but hardcoding for a quick script is fine if we copy it correctly.
// The key in .env was: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGFjd3J4d3ducHR2cWJxZmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjQyNTcsImV4cCI6MjA3OTIwMDI1N30.dRIbPj2vHD8uxaAYgtPNCwuID0lg5QkPFb4_pcSSSMM
// The one in the file was different/truncated? "sb_publishable_ACxvoxecjunjShgr_pj3sQ_8jKEzMIT"
// Let's use the one from .env to be sure.

const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGFjd3J4d3ducHR2cWJxZmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjQyNTcsImV4cCI6MjA3OTIwMDI1N30.dRIbPj2vHD8uxaAYgtPNCwuID0lg5QkPFb4_pcSSSMM";

console.log(`Testing connection to: ${url}`);

const options = {
    headers: {
        'apikey': realKey,
        'Authorization': `Bearer ${realKey}`
    }
};

const req = https.get(url, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);

    res.on('data', (d) => {
        console.log('Response Body Snippet:', d.toString().substring(0, 100));
    });
});

req.on('error', (e) => {
    console.error('Connection Error:', e.message);
});

req.end();
