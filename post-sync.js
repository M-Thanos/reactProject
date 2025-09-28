import fs from 'fs';
import path from 'path';

// Path to the capacitor.settings.gradle file
const gradleFilePath = path.join(process.cwd(), 'android', 'capacitor.settings.gradle');

// Check if the file exists
if (fs.existsSync(gradleFilePath)) {
  // Read the file content
  fs.readFile(gradleFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading capacitor.settings.gradle file:', err);
      return;
    }

    // Replace Java version if needed
    const updatedData = data.replace(/JavaVersion.VERSION_21/g, 'JavaVersion.VERSION_1_8');

    // Write the updated content back to the file
    fs.writeFile(gradleFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing updated gradle file:', err);
      } else {
        console.log('capacitor.settings.gradle updated to use Java 17.');
      }
    });
  });
} else {
  console.error('capacitor.settings.gradle file not found.');
}
