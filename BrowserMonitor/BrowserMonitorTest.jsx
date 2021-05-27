#target illustrator
function test () {
	#include "included-shared-code.jsx"
	#include "BrowserMonitor.jsx"
//\@ts-check

	function round2 (inNum) {
		return Math.round(inNum * 100) / 100;
	};

	/**
	 * Gets an HTML element with a style featuring a basic RGB representation of this CMYK color.
	 * @param {CMYKColor} cmykColor 
	 */
	function getHtmlCmykColorSwatch (cmykColor) {
		var rgbVal = app.convertSampleColor(
			ImageColorSpace.CMYK,
			[
				cmykColor.cyan, cmykColor.magenta, cmykColor.yellow, cmykColor.black
			],
			ImageColorSpace.RGB,
			ColorConvertPurpose.previewpurpose // Docs say: ~~"conversion for images for the purpose of screen-display".
		);
		var resultStr = "<span><span style='" +
			"background-color:rgb(" + Math.round(rgbVal[0]) + "," + Math.round(rgbVal[1]) + "," + Math.round(rgbVal[2]) + ");" +
			"width:15px;height:15px;display:inline-block;border:1px solid #000;" +
			"'></span>&nbsp;" +
			"C: " + round2(cmykColor.cyan) + ", M: " + round2(cmykColor.magenta) + ", Y: " + round2(cmykColor.yellow) + ", K: " + round2(cmykColor.black) +
			"</span>";
		return resultStr;
	};

	function getBetween1And100 () {
		return Math.floor(Math.random() * 101);
	};

	function getRandomCmykColor () {
		var newColor = new CMYKColor();
		newColor.black = getBetween1And100();
		newColor.magenta = getBetween1And100();
		newColor.yellow = getBetween1And100();
		newColor.cyan = getBetween1And100();
		return newColor;
	};

	// var htmlTemplatePath = "BrowserMonitor-template.html"; // If this line is active, the BrowserMonitor uses the contents of this file for the HTML.
	var htmlTemplatePath = null; // If this line is active, the included HTML string inside the BrowserMonitor.jsx file is used.
	var browserMonitorFolderPath = decodeURI(File($.fileName).parent.fsName); // Write-folder same as script location for test.
	var scriptName = "Browser-Monitor-Test-Script";

	var itemsToProcess = app.activeDocument.layers[0].pathItems;
	var maxValue = itemsToProcess.length;

	var reallyBadErrorKey = "REALLY Bad stuff found.";
	var errorKey = "Bad stuff found.";

	var BM = new BrowserMonitor(
		browserMonitorFolderPath, // Will write an HTML and JS files to this folder.
		scriptName, // A unique string identifier which namespaces the browser monitor, allowing multiple browser monitor HTML/JS file sets to be written to the same folder.
		maxValue, // Max value for this progress.
		"My Progress", // Title
		"", // Sub Title
		htmlTemplatePath, // Optional path to a stand-alone HTML template which has %PLACEHOLDER% placeholders for text-replacement.
		{ loopMilliseconds : 200 } // Timeout options with all-optional properties which can set various timing settings, such as how often the JS file is queried.
	);

	BM.begin();

	var thisItem, currentProgressValue;
	var foundColor, foundColorMessage;
	var isHtmlColorMessage = false;
	var mainMonitorInstructions;
	for (var i = 0; i < itemsToProcess.length; i++) {
		mainMonitorInstructions = {};
		isHtmlColorMessage = false;
		thisItem = itemsToProcess[i];
		currentProgressValue = (i + 1);
		// add the progress item.
		mainMonitorInstructions.progressValue = currentProgressValue;
		mainMonitorInstructions.error = "";
		mainMonitorInstructions.line_1 = "Process for path " + (thisItem.uuid);
		if (i >= 3 && i < 10) { // set the sub title to regular string from item 4 to 10
			mainMonitorInstructions.subtitle = "Stuff after item 3";
		}
		if (i == 10) { // set html subtitle for only item 11
			mainMonitorInstructions.html_subtitle = "<span style='color:#FFA500'>Now on item <b>10</b></span>";
		} else if (i > 10) { // unset the subtitle from item 12+
			mainMonitorInstructions.html_subtitle = null;
		}
		BM.update(mainMonitorInstructions);
		try {
			if (thisItem.name == "BAD") { // an error that happened, but doesn't really have to stop the process.
				throw Error(errorKey); // throw it to prevent further statements from executing, but don't rethrow it to continue the loop.
			}
			if (thisItem.name == "REALLY BAD") { // a really bad error that should cause the entire operation to stop.
				throw Error(reallyBadErrorKey); // throw it, then re-throw to stop the script.
			}
			if (thisItem.filled) {
				if (thisItem.fillOverprint) {
					// for some reason, we also want to just note if any items have an overprint fill.
					// nice, eye-catching note.
					BM.update({
						"progressValue" : currentProgressValue,
						"html_line_2" : "<span style='color:#A45;padding:3px;background-color:#FF0;border:2px solid #0FF;border-radius:3px;'>This item has overprint fill.</span>",
					});
				}
				// don't fill, write the existing color.
				foundColor = thisItem.fillColor;
				if (foundColor.typename == "CMYKColor") {
					isHtmlColorMessage = true;
					foundColorMessage = getHtmlCmykColorSwatch(foundColor);
				} else if (foundColor.spot) {
					foundColorMessage = foundColor.spot.name;
				} else {
					foundColorMessage = "Some other color: " + foundColor.typename;
				}
				BM.update({
					"progressValue" : currentProgressValue,
					"line_2" : "Existing color found:",
					"line_3" : (isHtmlColorMessage)? "" : foundColorMessage,
					"html_line_3" : (isHtmlColorMessage)? foundColorMessage : "",
				});
			} else {
				// fill the unfilled shape with color.
				thisItem.fillColor = getRandomCmykColor();
				// add successful line
				BM.update({
					"progressValue" : currentProgressValue,
					"line_2" : "Color changed to:",
					"html_line_3" : getHtmlCmykColorSwatch(thisItem.fillColor),
				});
			}
		} catch (e) {
			if (e.message == reallyBadErrorKey) { // rethrow fatal error.
				// add fatal error to progress monitor.
				BM.update({
					"progressValue" : currentProgressValue,
					"error" : reallyBadErrorKey,
					"isFatalError" : true,
				});
				throw(e);
			} else {
				// add error line for other non-scrutinized errors.
				BM.update({
					"progressValue" : currentProgressValue,
					"error" : e.message,
				});
			}
		}
		// app.redraw(); // useless as only redraws first few times, then goes unresponsive as usual.
	}

	BM.end();
};
test();