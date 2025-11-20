const { execSync } = require('child_process');
const path = require('path');

const keystorePath = path.join(__dirname, 'android', 'app', 'debug.keystore');

console.log('Attempting to get SHA-1 fingerprint...\n');

// Try different possible JDK locations
const possibleKeytoolPaths = [
  'keytool', // If in PATH
  'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe',
  'C:\\Program Files\\Java\\jdk-11\\bin\\keytool.exe',
  'C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe',
  'C:\\Program Files\\Eclipse Adoptium\\jdk-11.0.16.101-hotspot\\bin\\keytool.exe',
  process.env.JAVA_HOME ? `${process.env.JAVA_HOME}\\bin\\keytool.exe` : null,
].filter(Boolean);

for (const keytoolPath of possibleKeytoolPaths) {
  try {
    const command = `"${keytoolPath}" -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`;
    console.log(`Trying: ${keytoolPath}`);
    const output = execSync(command, { encoding: 'utf-8' });

    // Extract SHA-1
    const sha1Match = output.match(/SHA1:\s*([A-F0-9:]+)/i);
    const sha256Match = output.match(/SHA256:\s*([A-F0-9:]+)/i);

    console.log('\n✓ SUCCESS! Found certificates:\n');
    if (sha1Match) {
      console.log('SHA-1:', sha1Match[1]);
    }
    if (sha256Match) {
      console.log('SHA-256:', sha256Match[1]);
    }

    console.log('\nCopy the SHA-1 value above and add it to Firebase Console:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Select your project: happy-hour-mvp');
    console.log('3. Go to Project Settings > Your apps');
    console.log('4. Select your Android app');
    console.log('5. Add the SHA-1 fingerprint');

    process.exit(0);
  } catch (error) {
    // Try next path
    continue;
  }
}

console.error('\n❌ Could not find keytool.');
console.error('Please install Java JDK or Android Studio.');
console.error('\nAlternatively, download Java from: https://adoptium.net/');
process.exit(1);
