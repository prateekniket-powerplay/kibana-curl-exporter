document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("copyCurl");

  if (button) {
    button.addEventListener("click", () => {
      console.log("Button clicked!");
      chrome.storage.local.get(["lastResponse"], (data) => {
        console.log(data);
        if (data.lastResponse) {
          const curlCommand = generateCurlCommand(data.lastResponse);
          navigator.clipboard.writeText(curlCommand).then(() => {
            alert("cURL command copied!");
          }).catch((error) => {
            console.error("Clipboard error:", error);
          });
        } else {
          console.error("No data available.");
        }
      });
    });
  } else {
    console.error("Button not found!");
  }
});

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