//Combines the categoryJSONs into a single json and stores it in category.json
const fs = require('fs');
const path = require('path');

// Function to read and parse JSON file
function readJSONFile(filename) {
    const filePath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
}

// Paths to the JSON files
const jsonFiles = [
    'categorypage1.json',
    'categorypage2.json',
    'categorypage3.json',
    'categorypage4.json'
];

// Array to store all categories
let allCategories = [];

// Read each file and extract the categories
jsonFiles.forEach(file => {
    try {
        const data = readJSONFile(file);
        if (data && data.categories && Array.isArray(data.categories)) {
            allCategories = allCategories.concat(data.categories);
            console.log(`Added ${data.categories.length} categories from ${file}`);
        } else {
            console.error(`Invalid data format in ${file}`);
        }
    } catch (error) {
        console.error(`Error reading ${file}: ${error.message}`);
    }
});

// Create the final JSON structure
const combinedData = {
    categories: allCategories
};

// Write to the output file
fs.writeFileSync(
    path.join(__dirname, 'category.json'),
    JSON.stringify(combinedData, null, 2),
    'utf8'
);

console.log(`Combined JSON written to category.json with ${allCategories.length} total categories`);