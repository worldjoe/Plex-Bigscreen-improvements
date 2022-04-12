// ==UserScript==
// @name  Plex - Bigscreen improvements
// @description Add the title and duration as an always on overlay for Bigscreen. Use SHIFT key to enable/disable feature
// @match       http*://miniserver.local:32400/*
// @match       http*://app.plex.tv:32400/*
// @match       http*://localhost:32400/*
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @version 0.2
// @namespace https://runningwithscissors-vr.com
// @license none, enjoy
// ==/UserScript==
// This was based, loosely off of this userscript https://github.com/skoshy/PlexEXT

'use strict';

var scriptid = 'plex-supreme';
var newElements = {};
var enabled = true;

//since plex is a spa (single page app), we have to perpetually monitor the page elements that get rendered, we can't count on a traditional full browser page refresh
var timerHandle = setInterval(main, 1000);

var css = `
/* CUSTOM TOOLTIP */
.`+scriptid+`-tooltip {
  position: fixed;
  bottom: 5px;
  left: 5px;
  background: black;
  padding: 3px;
  border-radius: 20px;
  color: yellow;
  z-index: 10000000;
}
`;

function addGlobalStyle(css, id) {
  var head, style;
  head = document.getElementsByTagName('head')[0];
  if (!head) { return; }
  style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  style.id = id;
  head.appendChild(style);
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// passed a target element, will check if it's an input box
function isFocusOnInputBox(target) {
  if (target.getAttribute('role') == 'textbox' || target.tagName == 'INPUT' || target.tagName == 'TEXTAREA') {
	return true;
  } else {
	return false;
  }
}

function toggleOverlay(event) {
  if (!isFocusOnInputBox(event.target)) {
	if (event.shiftKey) {
        if (enabled) {
            enabled = false;
            newElements.tooltip.style.display = 'none';

        }
        else {
            enabled = true;
            newElements.tooltip.style.display = 'block';

        }
	}
  }
}

function initialize() {

    // create the tooltip
    newElements.tooltip = document.createElement('div');
    newElements.tooltip.className = scriptid+'-tooltip';
    newElements.tooltip.style.display = 'none';
    insertAfter(newElements.tooltip, document.querySelector('#plex'));


    addGlobalStyle(css, scriptid);
    newElements.tooltip.innerHTML = "init";
    newElements.tooltip.style.display = 'block';

    // initialize check for toggling the overlay
    document.body.addEventListener('keydown', toggleOverlay);
}

initialize();

function calculatePercentageTime(timeArray) {

    var totalTimeString = timeArray[1];
    var totalTimeArray = totalTimeString.split(":");

    var currentTimeString = timeArray[0];
    var currentTimeArray = currentTimeString.split(":");
    var currentTimeTotal;

    // seconds are included
    if (totalTimeArray.length > currentTimeArray.length) {
        // seconds are included, so only sum the first (minutes) part
        //console.log("TotalTimeArray length was larger than the currentTimeArray length, that means we need to not add all the items");
        currentTimeTotal = Number(currentTimeArray[0]);
    }
    else {
        currentTimeTotal = Number(currentTimeArray[0]*60) + Number(currentTimeArray[1]);
    }
    //console.log("Total current Minutes: " + currentTimeTotal);
    var totalTimeTotal = Number(totalTimeArray[0]*60) + Number(totalTimeArray[1]);
    //console.log("Total total Minutes: " + totalTimeTotal);

    var timePercentage = Math.round(currentTimeTotal/totalTimeTotal * 100);
    return timePercentage;
}

function main() {
    if (enabled) {
        var video = document.querySelector('video');
        if (video == null) {
            newElements.tooltip.style.display = 'none';
        } else {
            newElements.tooltip.style.display = 'block';
            //also keep looping till we see the title element get rendered
            var titleElement = document.querySelector("title");
            if (!titleElement) return;
            var title = titleElement.textContent;
            //console.log("title = " + title);
            var duration = document.querySelector('[data-testid="mediaDuration"]');
            var year = document.querySelector('[data-testid="metadataYear"]').textContent;

            title = title.replace("▶ ", "");
            var timeArray = duration.textContent.split("/");
            var timePercentage = calculatePercentageTime(timeArray)

            newElements.tooltip.innerHTML = title + ' (' + year + ') ' + duration.textContent + ' ' + timePercentage + '%';

            //console.log ("Duration:" + duration.textContent);
        }
    }
}
