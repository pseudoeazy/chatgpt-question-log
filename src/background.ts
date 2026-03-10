chrome.runtime.onInstalled.addListener(() => {
  console.log('ChatGPT Question Log Extension Installed!');
  chrome.storage.local.set({
    questions: [],
  });
});
