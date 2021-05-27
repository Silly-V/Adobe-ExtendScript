# BrowserMonitor Documentation

## Installation
To utilize this program in your ExtendScript project, include the required files using the `#include` directives or paste the contents of _BrowserMonitor.jsx_ and _included-shared-code.jsx_ into your script file.
This is demonstrated inside the file _BrowserMonitorTest.jsx_.

## Usage
The `BrowserMonitor` workflow is:

 1. Create an instance of a `BrowserMonitor` with `var bm = new BrowserMonitor(... arguments go here)`.
 2. At the beginning of your batch process, initialize the `BrowserMonitor` with the `bm.begin()` method.
 3. Update the monitor by using the `bm.update({ ... update properties })` method.
 4. At the end of your batch process, stop the monitor by using the `bm.end()` method.

## BrowserMonitor Contructor Arguments
The constructor takes the following parameters:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| writeFolderPath | `string` | Required | Folder Path to write HTML and JS files to.|
| key | `string` | Required | The distinguishing string to append to the HTML file and JS files.|
| maxValue | `number` | Required | The max value for a progress bar.|
| title | `string` | Optional | The top heading and page title.|
| subtitle | `string` | Optional | A subtitle.|
| htmlTemplatePath | `string` | Optional | Optional path to a stand-alone HTML template text file. This file must have special markers inside to replace (Ex: %REPLACE_ME%). |
| timeoutOptions | [`BrowserMonitorTimeoutOptions`](#BrowserMonitorTimeoutOptions-Object) | Optional | Optional object with auto-closing options. |

## BrowserMonitor Properties
These properties help keep track of a `BrowserMonitor`'s progress and can be used by the container program to see current values for any reason.

| Name | Type | Description |
|------|------|-------------|
| folder | `string` | The folder where the `BrowserMonitor` will write the HTML and JS files. |
| htmlTemplate | `string` | An entire HTML string embedded in the `BrowserMonitor` class as a string, or a dynamically-obtained string read from a specified file path [`htmlTemplatePath`](#BrowserMonitor-Contructor-Arguments). |
| maxValue | `number` | The maximum value in the process. |
| currentValue | `string` | The current value in the process. |
| title | `string` | The string which will become the page title on initialization of the HTML file. |
| subtitle | `string` | The string which will become the page title on initialization of the HTML file. |
| key | `string` | A unique string which is appended to the base-name of the HTML and JS files, allowing multiple `BrowserMonitor` objects to write unique files to the same folder. |
| timeoutOptions | [`BrowserMonitorTimeoutOptions`](#BrowserMonitorTimeoutOptions-Object) | Timing options which govern intervals in the HTML file. |

## BrowserMonitor Methods

| Name | Returns | Type | Description |
|------|------|----------|-------------|
| writeJs | `void` | Public | Writes the JavaScript file to be queried by the HTML file. |
| writeHtml | `void` | Public | Writes the HTML file to be shown in the web browser. |
| update | `void` | Public | Writes an object into a JavaScript file to be consumed by the HTML file's interval script. |
| begin | `void` | Public | Writes both the JS and HTML files, then executes the HTML file to bring it up in the web browser.
| end | `void` | Public | Writes an `{ END : true }` message to the JS file, ending the process.
| toJSON | `object` | Public | Used to prepare the `BrowserMonitor` instace for the `JSON.stringify()` method. Removes the [`htmlTemplate`](#BrowserMonitorJsContent) property string to avoid JSON-related problems. This method is useful when transferring this object to a child process script such as a separate code block or file to be executed in a different application via `BridgeTalk`.
| fromJSON | `BrowserMonitor` | Static | Creates an instance of the `BrowserMonitor` from a JSON string.

## BrowserMonitorTimeoutOptions Object
This object effects the timeout handling for the progress monitor.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| inactivityTimeoutMinutes | `number` | Optional | The minutes to wait until auto-close when there has been no new activity. |
| autoCloseSeconds | `number` | Optional | The seconds to auto-close due to inactivity. |
| postCompletionSeconds | `number` | Optional | The seconds to auto-close due to completion of process. Set to -1 for no auto-closing in post-completion phase. |
| loopMilliseconds | `number` | Optional | Milliseconds that set the interval which makes the browser page repeatedly query the updated javascript file. |

## BrowserMonitorJsContent
(`Update` & `Begin` Method Argument Object)

The argument to the `update` method can contain any of these properties, but one must do some test runs as they affect the display in different ways with internal logic.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| line_1 | `string` | Optional | Text to display in line 1 of the progress bar message area. |
| line_2 | `string` | Optional | Text to display in line 2 of the progress bar message area. |
| line_3 | `string` | Optional | Text to display in line 3 of the progress bar message area. |
| html_line_1 | `string` | Optional | Custom HTML to display in line 1 of the progress bar message area. Overrides the `line_1` parameter if it is also included. |
| html_line_2 | `string` | Optional | Custom HTML to display in line 2 of the progress bar message area. Overrides the `line_2` parameter if it is also included. |
| html_line_3 | `string` | Optional | Custom HTML to display in line 3 of the progress bar message area. Overrides the `line_3` parameter if it is also included. |
| title | `string` | Optional | Sets the main heading and page title. |
| subtitle | `string` | Optional | Sets the sub-heading. |
| html_subtitle | `string` | Optional | Sets the sub-heading to custom HTML. |
| progressMaxValue | `number` | Optional | Sets the maximum progress value dynamically. |
| progressValue | `number` | Optional | Sets the current progress value. |
| error | `string` | Optional | Sets the "error" line in the progress bar message area. |
| html_error | `string` | Optional | Sets the "error" line to custom HTML in progress bar message area. |
| isFatalError | `boolean` | Optional | Puts a special message into the message area and clears the main interval. |
| meta_1 | `string` | Optional | Arbitrary value which is not displayed in the message area but gets added to the collected data list below. |
| meta_2 | `string` | Optional | Arbitrary value which is not displayed in the message area but gets added to the collected data list below. |
| meta_3 | `string` | Optional | Arbitrary value which is not displayed in the message area but gets added to the collected data list below. |
| meta_4 | `string` | Optional | Arbitrary value which is not displayed in the message area but gets added to the collected data list below. |

[➡ Go to Code Example](Code-Example.md)

[➡ Go to Overview](Overview.md)

[⬅ Back to README](README.md)