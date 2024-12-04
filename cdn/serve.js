
// Get the search params from the URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (id) {
    // Build the URL for the CDN index JSON file
    const jsonUrl = `${window.location.origin}${window.location.pathname}cdn.index.json`;

    // Fetch the CDN index JSON file
    fetch(jsonUrl)
    .then(response => {
        if (!response.ok) {
        // Handle the error if the cdn.index.json file is not found
        throw new Error('Failed to load cdn.index.json');
        }
        return response.json();
    })
    .then(data => {
        // Check if the ID exists in the JSON object
        if (data.hasOwnProperty(id)) {
            // Redirect to the value associated with the ID
            window.location.href = data[id];
        } else {
            // If ID doesn't exist, redirect to the 404 page
            window.location.href = `${window.location.origin}${window.location.pathname}states/404.json`;
        }
    })
    .catch(error => {
        // Handle any errors in the fetching process
        console.error('Error:', error);
        // Optionally redirect to an error page if cdn.index.json cannot be loaded
        window.location.href = `${window.location.origin}${window.location.pathname}states/error.json`;
    });
} else {
    // If no id parameter is provided in the URL, redirect to the 404 page
    window.location.href = `${window.location.origin}${window.location.pathname}states/unknown_id.json`;
}
  