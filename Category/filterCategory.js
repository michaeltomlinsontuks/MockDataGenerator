//Filters the category.json to only keep the best of a duplicate category
//e.g     {
//       "id": "abcat0916010",
//       "name": "Vacuum & Floor Tools"
//     },
//     {
//       "id": "abcat0916011",
//       "name": "Vacuum Bags"
//     },
//     {
//       "id": "abcat0916013",
//       "name": "Vacuum Filters"
//     },

//Should only keep Vacuum & Floor Tools as it is the largest category

const fs = require('fs');
const path = require('path');

// Read the category.json file
function readCategoryJSON() {
    const filePath = path.join(__dirname, 'category.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
}

// Function to filter categories and keep only the most general ones
function filterDuplicateCategories(categories) {
    // Group categories by their first significant word
    const groups = {};

    categories.forEach(category => {
        const name = category.name;
        const words = name.split(/\s+/);

        // Use first word as group key
        let groupKey = words[0].toLowerCase();

        // Skip articles if they're the first word
        if (['the', 'a', 'an'].includes(groupKey) && words.length > 1) {
            groupKey = words[1].toLowerCase();
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(category);
    });

    // For each group, determine the most general category
    const filteredCategories = [];

    for (const key in groups) {
        const group = groups[key];

        if (group.length === 1) {
            // If only one category in group, keep it
            filteredCategories.push(group[0]);
        } else {
            // Sort by presumed generality
            group.sort((a, b) => {
                // Categories with "&" are often more general
                const aHasAmpersand = a.name.includes('&');
                const bHasAmpersand = b.name.includes('&');

                if (aHasAmpersand && !bHasAmpersand) return -1;
                if (!aHasAmpersand && bHasAmpersand) return 1;

                // Categories with specific qualifiers are less general
                const specificTerms = ['accessories', 'parts', 'filters', 'bags', 'components', 'cables', 'adapters'];
                const aHasSpecific = specificTerms.some(term => a.name.toLowerCase().includes(term));
                const bHasSpecific = specificTerms.some(term => b.name.toLowerCase().includes(term));

                if (aHasSpecific && !bHasSpecific) return 1;
                if (!aHasSpecific && bHasSpecific) return -1;

                // Shorter names are generally more general
                return a.name.length - b.name.length;
            });

            // Keep the most general category (first after sorting)
            filteredCategories.push(group[0]);

            console.log(`From group "${key}", kept "${group[0].name}" and removed:`,
                group.slice(1).map(c => c.name).join(', '));
        }
    }

    return filteredCategories;
}

// Main function
function processCategories() {
    // Read category data
    const data = readCategoryJSON();
    const allCategories = data.categories;

    console.log(`Read ${allCategories.length} categories from category.json`);

    // Filter the categories
    const filteredCategories = filterDuplicateCategories(allCategories);
    console.log(`Filtered to ${filteredCategories.length} categories`);

    // Create new JSON with filtered categories
    const filteredData = {
        categories: filteredCategories
    };

    // Write filtered data to file
    fs.writeFileSync(
        path.join(__dirname, 'filtered_category.json'),
        JSON.stringify(filteredData, null, 2),
        'utf8'
    );

    console.log('Filtered categories written to filtered_category.json');
}

// Run the process
processCategories();