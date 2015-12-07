﻿interface Utils {
    <TElement extends HTMLElement>(selector: string, element?: NodeSelector): TElement;
    try<TElement extends HTMLElement>(selector: string, element?: NodeSelector): TElement;
    visible<TElement extends HTMLElement>(selector: string, element?: NodeSelector): TElement;
    all<TElement extends HTMLElement>(selector: string, element?: NodeSelector): TElement[];
    create<TElement extends HTMLElement>(tagName: string, className?: string): TElement;
    getRelativeUrl(baseUrl: string, fullUrl: string): string;
}

var $$ = <Utils>function (selector: string, element: NodeSelector = document) {
    return <HTMLElement>element.querySelector(selector);
}

$$.try = function (selector: string, element: NodeSelector) {
    return $$(selector, element) || <HTMLElement>{};
}

$$.create = function (tagName, className) {
    var element = document.createElement(tagName);
    element.classList.add(Integrations.IntegrationService.affix + '-' + tagName.toLowerCase());
    if (className) {
        element.classList.add(className);
    }
    return element;
}

$$.all = function (selector, element?): HTMLElement[] {
    element = element || document;
    var nodeList = element.querySelectorAll(selector);
    var result = [];
    for (var i = 0; i < nodeList.length; i++) {
        result.push(nodeList[i]);
    }
    return result;
}

$$.visible = <Utils>function (selector: string, element?: NodeSelector): HTMLElement {
    function isVisible(element: HTMLElement): boolean {
        if (!element || element.style.display === 'none' || element.style.visibility === 'hidden') {
            return false;
        }
        return element === document.body || isVisible(element.parentElement);
    }
    return $$.all(selector, element).filter(isVisible)[0];
}

$$.getRelativeUrl = function (baseUrl: string, url: string) {

    if (!url) {
        console.error('Url is not specified.');
        url = '/';
    }
    else if (!baseUrl) {
        console.error('Base url is not specified.');
    }
    else {

        if (baseUrl[baseUrl.length - 1] != '/') {
            baseUrl += '/';
        }

        if (url.indexOf(baseUrl) == 0) {
            url = '/' + url.substring(baseUrl.length);
        }
    }
    return url;
}