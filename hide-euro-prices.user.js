// ==UserScript==
// @name        hide-euro-prices
// @version     1.2.1
// @author      DoomDesign, HAL2000
// @include     http*://*amazon*/*
// @description Hides (hopefully) all price elements on amazon
// @run-at      document-start
// @grant       GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    var textToSearch = '(EUR|€)';
    var priceElems = [];
    var timeout;
    var pricesHidden = true;

    // see https://stackoverflow.com/a/10730777
    function textNodesUnder(el){
        var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
        while(n=walk.nextNode()) a.push(n);
        return a;
    }

    // insert CSS
    (document.head || document.documentElement).insertAdjacentHTML('beforeend',
    "<style type='text/css'> button.showPrices {line-height: 1; padding: 10px; position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; color: #000; background-color: #fff; font-size: 1.5rem; border: 1px solid red; border-radius: 5px;} button.showPrices:active, button.showPrices.active {background-color: red; color: #fff;} button.showPrices > small { display: block;} .hiddenByScript.visibleByScript {visibility: initial !important} .hiddenByScript.visibleByScript::after { opacity: 0; } .hiddenByScript {position: relative;} .hiddenByScript {visibility: hidden !important} /*.hiddenByScript::after {content: '???'; visibility: visible; font-weight: bold; font-family: 'Amazon Ember', Arial, sans-serif; color: #fff; opacity: 1; display: block; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: #000; overflow: hidden; text-align: center;}*/ </style>");

    // mutation observer to directly add classes to elements with "price" in class names on page load
    new MutationObserver(function(mutations) {

        mutations.forEach(function(mutation) {
            if ( mutation.type == 'childList' ) {
                if (mutation.addedNodes.length >= 1) {
                    mutation.addedNodes.forEach(function(elm) {
                        if (elm.nodeName != '#text') {
                            //find all nodes that contain a certain text
                            if(typeof elm.querySelectorAll === "function" && elm.querySelectorAll('*').length > 0) {

                                // find all text nodes in elm
                                var textnodes = textNodesUnder(elm);
                                // iterate over text node
                                textnodes.forEach(function(value){
                                    if(value.nodeType === Node.TEXT_NODE && RegExp(textToSearch).test(value.textContent)) {
                                        /* get parent element of textNode */
                                        var parent = value.parentNode;
                                        parent.classList.add('hiddenByScript');
                                        priceElems.push(parent);
                                    }
                                });

                                // additionally find all nodes with a specific class
                                var classnodes = elm.querySelectorAll("[class*='price'], [class*='prices'], [class*='Price']");
                                classnodes.forEach(function(value){
                                        value.classList.add('hiddenByScript');
                                        priceElems.push(value);
                                });

                                // NEW: hide the quick promo iframe completely and don't add it to the revealable elements
                                elm.querySelectorAll("[id*='hero-quick-promo']").forEach(function(value) {
                                    value.classList.add('hiddenByScript');
                                });
                            };
                        }
                    });
                }
            }
        })
    }).observe(document, {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
    });
    
    /* i couldn't fix this any other way though..... :( */
    /* Any way I tried to implement this in the MutationObserver failed.  Even things like elm.ownerDocument.getElementById("priceAndPrime") didn't return anything?!? */
    var pap = document.getElementById ("priceAndPrime");
    if (pap)
    {
        pap.classList.add('hiddenByScript');
        priceElems.push(pap);
    }

    // create toggle button
    document.addEventListener("DOMContentLoaded", function() {
        var button = document.createElement("button");
        button.innerHTML = "Preise anzeigen/ausblenden";
        button.classList.add('showPrices');
        button.onclick = function(){
            clearInterval(timeout);
            if(pricesHidden === true) {
                console.log("Showing...");
                pricesHidden = false;
                button.classList.add('active');
                timeout = setInterval(function() {

                    priceElems.forEach(function(elm) {
                        elm.classList.add('visibleByScript');
                    });
                }, 500);

                return false;
            } else {
                console.log("Hiding...");
                pricesHidden = true;
                button.classList.remove('active');
                priceElems.forEach(function(elm) {
                    elm.classList.remove('visibleByScript');
                });
            }
        }
        document.body.appendChild(button);
    });

})();
