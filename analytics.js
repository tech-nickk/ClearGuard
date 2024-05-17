// Fetch the stored analytics data
fetchAnalyticsData()
  .then(analyticsData => {
    // Render the analytics data on the page
    renderAnalytics(analyticsData);
  })
  .catch(error => {
    console.error('Error fetching analytics data:', error);
  });

function fetchAnalyticsData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('analyticsData')
      .then(result => {
        const analyticsData = result.analyticsData || {};
        resolve(analyticsData);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function renderAnalytics(analyticsData) {
  const analyticsContainer = document.getElementById('analytics');

  // Clear previous content
  analyticsContainer.innerHTML = '';

  // Loop through the analytics data and render each site's data
  for (const [url, siteData] of Object.entries(analyticsData)) {
    const siteElement = document.createElement('div');
    siteElement.classList.add('site-data');

    // Create a paragraph for each category with its percentage
    const personalDataPercentage = siteData.personalDataPercentage.toFixed(2);
    const sensitivePersonalDataPercentage = siteData.sensitivePersonalDataPercentage.toFixed(2);
    const generalDataPercentage = siteData.generalDataPercentage.toFixed(2);

    const siteInfo = `
      <h3>Site: ${url}</h3>
      <p>Personal Data Percentage: ${personalDataPercentage}%</p>
      <p>Sensitive Personal Data Percentage: ${sensitivePersonalDataPercentage}%</p>
      <p>General Data Percentage: ${generalDataPercentage}%</p>
    `;

    siteElement.innerHTML = siteInfo;

    // Append the site data to the container
    analyticsContainer.appendChild(siteElement);
  }
}
