// content_script.js

// List of PII categories
const personalData = ["name", "dob", "birthdate", "birthday", "email", "phone", "address"];
const sensitivePersonalData = ["password", "username", "login", "credit card", "card number", "expiry", "cvv", "ssn", "social security", "passport", "driver", "license"];
const generalData = []; // Add any general data keywords if needed

// Listen for form submission events
document.addEventListener('submit', handleFormSubmission);

// Listen for click events on submit-related buttons
document.addEventListener('click', function(event) {
  const target = event.target;
  const buttonText = target.textContent.toLowerCase();

  if (
    target.tagName === 'BUTTON' &&
    (buttonText.includes('submit') ||
    buttonText.includes('save') ||
    buttonText.includes('sign up') ||
    buttonText.includes('sign in') ||
    buttonText.includes('login'))
  ) {
    handleFormSubmission(event);
  }
});

// Function to identify and classify PII in a form
function identifyPII(form) {
  const piiFound = {
    personalData: [],
    sensitivePersonalData: [],
    generalData: [],
  };
  const totalFields = form.elements.length;

  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i];
    const elementName = element.name.toLowerCase();

    if (personalData.some(keyword => elementName.includes(keyword))) {
      piiFound.personalData.push(elementName);
    } else if (sensitivePersonalData.some(keyword => elementName.includes(keyword))) {
      piiFound.sensitivePersonalData.push(elementName);
    } else if (generalData.some(keyword => elementName.includes(keyword))) {
      piiFound.generalData.push(elementName);
    }
  }

  // Calculate percentages
  const personalDataCount = piiFound.personalData.length;
  const sensitivePersonalDataCount = piiFound.sensitivePersonalData.length;
  const generalDataCount = piiFound.generalData.length;
  const totalPIICount = personalDataCount + sensitivePersonalDataCount + generalDataCount;

  const personalDataPercentage = (personalDataCount / totalPIICount) * 100 || 0;
  const sensitivePersonalDataPercentage = (sensitivePersonalDataCount / totalPIICount) * 100 || 0;
  const generalDataPercentage = (generalDataCount / totalPIICount) * 100 || 0;

  return {
    piiFound,
    personalDataPercentage,
    sensitivePersonalDataPercentage,
    generalDataPercentage,
  };
}

// Function to handle form submission
function handleFormSubmission(event) {
  const form = event.target.closest('form');
  if (!form) return; // Exit if no form is found

  // Identify and classify PII in the form
  const piiAnalysis = identifyPII(form);

  if (Object.values(piiAnalysis.piiFound).some(arr => arr.length > 0)) {
    // Prevent the form from being submitted
    event.preventDefault();

    // Build the alert message
    const alertMessage = `Warning: This form collects the following data:\n\n
Personal Data (${piiAnalysis.personalDataPercentage.toFixed(2)}%): ${piiAnalysis.piiFound.personalData.join(', ')}\n
Sensitive Personal Data (${piiAnalysis.sensitivePersonalDataPercentage.toFixed(2)}%): ${piiAnalysis.piiFound.sensitivePersonalData.join(', ')}\n
General Data (${piiAnalysis.generalDataPercentage.toFixed(2)}%): ${piiAnalysis.piiFound.generalData.join(', ')}\n\n
Total: 100%\n\n
Allow submission?\n\nClick "Cancel" to deny submission and close the webpage, or "OK" to allow.`;

    const result = confirm(alertMessage);

    


    if (!result) {
      // User clicked "Cancel" to deny submission
      window.alert("This webpage has been blocked due to potential privacy concerns.");
      window.stop(); // Stop loading the current page

      // Redirect to a different URL instead of attempting to close the window/tab
      window.location.href = 'about:blank'; // Replace with the desired URL
    } else {
      // User clicked "OK" to allow submission
      form.submit();
    }
  }
}

// MutationObserver for automatic detection
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === "FORM") {
          identifyPII(node); // Check the newly added form for PII
        }
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true }); // Observe body for form additions