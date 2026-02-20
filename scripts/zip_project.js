const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const sourceDir = __dirname;
const outPath = path.join(__dirname, 'VIBRANCE_FINAL_SUBMISSION.zip');

// Use powershell to zip, but specifying files manually or just trying to ignore errors? 
// actually easiest is to just use git archive if git was there.
// Let's use a simple archival script using 'archiver' if we had it, but we don't.
// We will use powershell but be more specific.

console.log("Creating zip...");
const exclude = ['node_modules', '.git', 'package-lock.json', 'final_vibrance_code_3pm.zip', 'vibrance_deploy.zip', 'VIBRANCE_FINAL_SUBMISSION.zip'];

// Get all files
const files = fs.readdirSync(sourceDir).filter(f => !exclude.includes(f));
const fileList = files.map(f => `'${f}'`).join(', ');

const cmd = `powershell -Command "Compress-Archive -Path ${fileList} -DestinationPath '${outPath}' -Force"`;

exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Zip created:', outPath);
});
