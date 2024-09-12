// ==UserScript==
// @name         layoutSwitcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Изменение раскладки текста
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const qwertyLayout = "qwertyuiop[]asdfghjkl;'zxcvbnm,./`QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?~";
    const ycukenLayout = "йцукенгшщзхъфывапролджэячсмитьбю.ёЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,Ё";

    function switchLayout(text) {
        console.log("Исходный текст:", text);
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let indexQ = qwertyLayout.indexOf(char);
            let indexY = ycukenLayout.indexOf(char);

            if (indexQ !== -1) {
                result += ycukenLayout[indexQ];
            } else if (indexY !== -1) {
                result += qwertyLayout[indexY];
            } else {
                result += char;
            }
        }
        console.log("Преобразованный текст:", result);
        return result;
    }

    function changeLayout() {
        let selection = window.getSelection();
        if (selection.rangeCount === 0) {
            console.log("Нет выделенного текста");
            return;
        }

        let selectedText = selection.toString().trim();
        if (!selectedText) {
            console.log("Нет выделенного текста");
            return;
        }

        let switchedText = switchLayout(selectedText);
        let range = selection.getRangeAt(0);

        // Создаем новый текстовый узел с преобразованным текстом
        let newNode = document.createTextNode(switchedText);

        // Удаляем выделение и вставляем новый текстовый узел
        range.deleteContents();
        range.insertNode(newNode);

        // Устанавливаем курсор после вставленного текста
        let newRange = document.createRange();
        newRange.setStartAfter(newNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        console.log("Текст заменен на:", switchedText);
    }

    function handleActiveElement() {
        let activeElement = document.activeElement;
        let selectedText = '';

        // Проверяем активный элемент и выделение
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable) {
            let selection = window.getSelection();
            if (selection.rangeCount > 0) {
                selectedText = selection.toString();
            } else if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                selectedText = activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
            } else if (activeElement.isContentEditable) {
                let selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    selectedText = selection.toString();
                }
            }
        } else {
            console.log("Активный элемент не поддерживается для выделения.");
            return;
        }

        if (selectedText) {
            let switchedText = switchLayout(selectedText);

            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                let start = activeElement.selectionStart;
                let end = activeElement.selectionEnd;
                activeElement.value = activeElement.value.substring(0, start) + switchedText + activeElement.value.substring(end);
                activeElement.setSelectionRange(start, start + switchedText.length);
            } else if (activeElement.isContentEditable) {
                let range = window.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(switchedText));
            }

            console.log("Текст заменен на:", switchedText);
        } else {
            console.log("Нет текста для замены");
        }
    }

    // Регистрируем команду в меню Tampermonkey
    GM_registerMenuCommand("Switch", handleActiveElement);

    // Добавляем функцию в глобальную область видимости для отладки
    unsafeWindow.changeLayoutDebug = handleActiveElement;
})();
