chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed!');
  chrome.storage.sync.set({
    questions: [],
  });
});
