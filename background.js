"use strict";

function replaceNewlinesWithSpaces(str) {
  return str.replace(/\n/g, " ");
}

function getLanguageCode(input) {
  // \u3040-\u309F: ひらがな, \u30A0-\u30FF:カタカナ, \uFF66-\uFF9F: 半角カタカナ, \u4E00-\u9FAF: 漢字
  const japaneseRegex =
    /[\u3040-\u309F\u30A0-\u30FF\uFF66-\uFF9F\u4E00-\u9FAF]/;
  const englishRegex = /^[\x00-\x7F]*$/; // ASCII

  if (japaneseRegex.test(input)) {
    return "ja";
  } else if (englishRegex.test(input)) {
    return "en";
  } else {
    return "ja";
  }
}

function getSelectionText() {
  return window.getSelection().toString();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "google-translate",
    title: "Google翻訳: %s",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "deepl-translate",
    title: "DeepL翻訳: %s",
    contexts: ["selection"],
  });
});

function createTranslateTab(text, transService) {
  const sourceLang = getLanguageCode(text);
  let targetLang = "ja";
  if (sourceLang == "ja") {
    targetLang = "en";
  }

  let transUrl = null;
  if (transService == "google-translate") {
    transUrl =
      `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${targetLang}&text=` +
      encodeURIComponent(text);
  } else if (transService == "deepl-translate") {
    transUrl =
      `https://www.deepl.com/translator#"${sourceLang}-${targetLang}/` +
      encodeURIComponent(text);
  }
  if (transUrl) {
    chrome.tabs.create({ url: transUrl });
  }
}

chrome.contextMenus.onClicked.addListener(function (info) {
  const text = replaceNewlinesWithSpaces(info.selectionText);
  createTranslateTab(text, info.menuItemId);
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === "google-translate" || command === "deepl-translate") {
    chrome.tabs.query(
      {
        active: true,
        // lastFocusedWindow: true,
      },
      function (tabs) {
        let tab = tabs[0];
        let url = tab.url;
        let tabId = tab.id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: getSelectionText,
          },
          (res) => {
            let text = res[0].result;
            console.log(text);
            if (text.length > 0) {
              createTranslateTab(text, command);
            }
          }
        );
      }
    );
  }
});
