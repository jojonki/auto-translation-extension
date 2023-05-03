"use strict";

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

chrome.contextMenus.onClicked.addListener(function (info) {
  const rawText = info.selectionText;
  const text = replaceNewlinesWithSpaces(info.selectionText);

  const sourceLang = getLanguageCode(text);
  let targetLang = "ja";
  if (sourceLang == "ja") {
    targetLang = "en";
  }

  let transUrl = null;
  if (info.menuItemId == "google-translate") {
    transUrl =
      `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${targetLang}&text=` +
      encodeURIComponent(text);
  } else if (info.menuItemId == "deepl-translate") {
    transUrl =
      `https://www.deepl.com/translator#"${sourceLang}-${targetLang}/` +
      encodeURIComponent(text);
  }
  if (transUrl) {
    chrome.tabs.create({ url: transUrl });
  }
});
