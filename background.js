const processedRequests = new Set();

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.url.includes("/api/apm/event_metadata/transaction/")) {
      if (processedRequests.has(details.url)) {
        return;
      }
      processedRequests.add(details.url);

      console.log("APM Request captured:", details);

      try {
        const response = await fetch(details.url);
        const responseData = await response.json();

        chrome.storage.local.set({
          lastResponse: responseData,
        }).then(() => {
            console.log("Value is set");
        });

        console.log("APM Response stored:", responseData);
      } catch (error) {
        console.error("Failed to fetch response data:", error);
      }
    }
  },
  { urls: ["*://*/api/apm/event_metadata/transaction/*"] },
  ["responseHeaders"]
);
