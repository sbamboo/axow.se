function transformDateString(input) {
    // Handle empty or invalid inputs
    if (!input || input.trim() === '' || input.replace(/x/g, '').trim() === '') {
        return input;
    }

    // Remove any leading time components
    const timeRegex = /^(\d{2}:(\d{2}(:?\d{2})?)\s*)?(.+)$/;
    const match = input.match(timeRegex);
    
    // If no match or no date part, return original input
    if (!match) return input;
    
    const timePart = match[1] || '';
    const datePart = match[4];

    // Transform date part
    const dateTransformRegex = /(\d{2}|\xx)-(\d{2}|\xx)-(\d{4}|\xxxx)/;
    const dateMatch = datePart.match(dateTransformRegex);
    
    if (!dateMatch) {
        // If no date pattern found, return input as is
        return input;
    }

    // Reconstruct the string with replaced date format
    const transformedDate = datePart.replace(/-/g, '/');
    return timePart ? `${timePart}${transformedDate}` : transformedDate;
}

// Test cases
const testCases = [
    { input: "xx-xx-xxxx", expected: "xx/xx/xxxx", result: null },
    { input: "01-xx-xxxx", expected: "01/xx/xxxx", result: null },
    { input: "01-02-xxxx", expected: "01/02/xxxx", result: null },
    { input: "01-02-2024", expected: "01/02/2024", result: null },
    { input: "01-xx-2024", expected: "01/xx/2024", result: null },
    { input: "xx:xx 01-02-2024", expected: "xx:xx 01/02/2024", result: null },
    { input: "xx:xx:xx 01-02-2024", expected: "xx:xx:xx 01/02/2024", result: null },
    { input: "xx:xx:xx xx-xx-xxxx", expected: "xx:xx:xx xx/xx/xxxx", result: null },
    { input: "01:02 03-04-2024", expected: "01:02 03/04/2024", result: null },
    { input: "01:02:03 04-05-2024", expected: "01:02:03 04/05/2024", result: null },
    { input: "01:02:03", expected: "01:02:03", result: null },
    { input: "01:xx:03", expected: "01:xx:03", result: null },
    { input: "", expected: "", result: null },
    { input: "xxxx", expected: "", result: null },
    { input: "2024", expected: "2024", result: null },
    { input: "01/02", expected: "01/02", result: null }
];

// Run tests
console.log("Date String Transformer Tests:");
testCases.forEach((test, index) => {
    test.result = transformDateString(test.input);
    const passed = test.result === test.expected;
    console.log(`Test ${index + 1}: 
    Input: "${test.input}"
    Expected: "${test.expected}"
    Result: "${test.result}"
    ${passed ? '✅' : '❌'}`);
});