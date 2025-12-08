const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(url, options, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(dest));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const files = {
    // Music (Wikimedia OGGs - Browser supported)
    'main_track.ogg': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Gymnop%C3%A9die_No._1.ogg',
    'sleep.ogg': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Clair_de_lune_%28Debussy%29_-_Suite_bergamasque.ogg',
    'anxiety.ogg': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Muriel_Nguyen_Xuan_-_01_-_Stille_Wunder.ogg',
    'focus.ogg': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Erik_Satie_-_Gnossienne_1.ogg',

    // Ambient (Google Sounds - High Reliability)
    'rain.ogg': 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    'forest.ogg': 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
    'ocean.ogg': 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
    'binaural.ogg': 'https://actions.google.com/sounds/v1/science_fiction/humming_laser_fence.ogg'
};

const outputDir = path.join(__dirname, 'public', 'audio');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadAll() {
    console.log('Starting downloads (Google Sounds + Wikimedia OGG)...');
    for (const [filename, url] of Object.entries(files)) {
        try {
            console.log(`Downloading ${filename}...`);
            await downloadFile(url, path.join(outputDir, filename));
            console.log(`Success: ${filename}`);
        } catch (error) {
            console.error(`Error downloading ${filename}:`, error.message);
        }
    }
    console.log('All downloads complete.');
}

downloadAll();
