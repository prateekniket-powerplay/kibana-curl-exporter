document.addEventListener("DOMContentLoaded", () => {
  const transactionDetails = document.querySelector(".transaction-details");
    
    if (transactionDetails) {
      const button = document.createElement("button");
      button.id = "copyCurl";
      button.innerText = "Copy cURL";
    button.style.cssText = "position: absolute; top: 20px; right: 20px;";
      transactionDetails.appendChild(button);

      button.addEventListener("click", () => {
        console.log("Button clicked!");
        chrome.storage.local.get(["lastResponse"], (data) => {
          if (data.lastResponse) {
            const curlCommand = generateCurlCommand(data.lastResponse);
            navigator.clipboard.writeText(curlCommand).catch((error) => {
              console.error("Clipboard error:", error);
            });
          } else {
            console.error("No data available.");
          }
        });
      });
    }
});

function showTooltip(button, message) {
  const tooltip = document.createElement("span");
  tooltip.innerText = message;
  tooltip.className = "copy-tooltip";
  button.appendChild(tooltip);
  
  setTimeout(() => {
    button.removeChild(tooltip);
  }, 1200);
}

  function generateCurlCommand(responseData) {
    try {
        const method = responseData.metadata['http.request.method'][0];
        const url = responseData.metadata['url.full'][0];
        const body = responseData.metadata['http.request.body.original'] ? 
            JSON.parse(responseData.metadata['http.request.body.original'][0]) : null;
  
        const headers = {};
        Object.entries(responseData.metadata).forEach(([key, value]) => {
            if (key.startsWith('http.request.headers.')) {
                const headerName = key.replace('http.request.headers.', '');
                headers[headerName] = value[0];
            }
        });
  
        let curlCommand = `curl -X ${method} '${url}'`;
  
        for (const [headerName, headerValue] of Object.entries(headers)) {
            if ([
                'Content-Length',
                'Connection',
                'Sec-Ch-Ua',
                'Sec-Ch-Ua-Mobile',
                'Sec-Ch-Ua-Platform',
                'Sec-Fetch-Dest',
                'Sec-Fetch-Mode',
                'Sec-Fetch-Site'
            ].includes(headerName)) {
                continue;
            }
  
            const headerString = headerValue === '' ? 
                `${headerName}: ` : 
                `${headerName}: ${headerValue}`;
  
            curlCommand += `\n  -H '${headerString}'`;
        }
  
        if (body) {
            const jsonBody = JSON.stringify(body);
            curlCommand += `\n  -d '${jsonBody}'`;
        }
  
        curlCommand += '\n  --compressed';
  
        return curlCommand;
    } catch (error) {
        console.error('Error generating cURL command:', error);
        return `Error generating cURL command: ${error.message}`;
    }
  }
  