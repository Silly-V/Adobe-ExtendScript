# BrowserMonitor Documentation

## How it Works
The way it works is: the JSX file writes an HTML file which includes a dynamically-configured path to a JavaScript file. The HTML file contains a `<script>` tag whose script repeately inserts the JavaScript file which contains an object via a `setInterval` method. Upon an successful insertion it checks the JSON version of the data object with a previously-captured object. If it detects a difference, a page-updating method is activated. The running JSX script writes to that same JS path during (arbitrary) key points in execution.

While an Adobe app goes unresponsive in the UI, it continues the process and is capable of writing light-weight text into the JS file with minimal time. When the `BrowserMonitor` is set to start with the `begin` method it writes the HTML file to its configured destination and launches it in the default web browser using `File.execute()`.

## HTML
The html portion of the `BrowserMonitor` is stored in a static and encoded state within its properties as a string. If an HTML template path is specified in the `BrowserMonitor`'s constructor arguments, it will attempt to read the file and use its text contents as the HTML page.

### Timers
1. #### Main Interval
	This interval runs continuously with a specified millisecond duration, it tries to load the JS file into the page and performs an update when content is found to be different than previous. After an inactivity period longer than a specified number of minutes or the process is found to be complete or has reached a fatal error, the interval clears.
2. #### Step Timer ⏱
	This is an interval which marks the number of seconds elapsed since the start of the current `progressValue` step. It resets every time a new `progressValue` is added (the new value must be a different number (preferably consecutive integers) from the current value).
3. #### Global Timer ⏳
	This interval marks the number of seconds elapsed since the page load, the start of the monitoring process. When the process completes, the interval is cleared and its icon is changed to ⌛.
4. #### Inactivity Closing Timer
	After a certain amount of configured minutes of not finding new content inside the JS file, this timer counts down to 0 from a configured number of auto-closing seconds. When it reaches 0, the page is automatically closed unless the user presses the "Keep Open" button in time to stop it.
5. #### Post-Completion Closing Timer
	If configured to be a positive integer (representing seconds), the post-completion interval launches a count-down to window-close when the process comes to an end. The parameter to effect this behavior can be set to a value which will prevent this timer from being activated.

### Custom HTML Updates
Using the `BrowserMonitor`'s `update()` method it is possible to inject custom HTML including `<script>` tags into the web page. While this can be easily used for simple notification changes, an injected HTML string with a script could also be used for remote data pushing and fetching. This could expand the automated workflow further. For example on a Mac it is possible to add Folder Actions to a folder, it could be the Downloads folder. The progress web page could be made to send web requests to some end-point and download new instructions to where a Folder Action can digest them and launch a JSX script. This JSX script would have to avoid overwriting the HTML file, but it could obtain the updated `BrowserMonitor` `progressValue` from the JS file and also ensure to remove the HTNL file after a certain condition.
Otherwise, an injected script could simply send updates to an end-point which could take the local log data and display it on a cloud-based dashboard.

## JSX

### Updating
The progress monitor is updated by writing a JS file to a destination where it will be read by the HTML file's new-content-gathering interval. This means that not only can it be used by a single-app script from any app, but also cross-app scripts which use BridgeTalk or even a wholly external process. In fact, the entire ExtendScript code could be reproduced as a Node.js script that would make this concept usable for any process on the computer that is capable of executing a Node.js command by any means.

### Non-Persistence
The `BrowserMonitor` is a very generic program that does not store its collected data in the filesystem and a refresh to the browser page would cause a data loss. One can still collect the page content data from a process by keeping the window open and using right-click Save-As on the browser page.
Once the page is saved thus, it can be opened and edited to present the data as it was last seen, minus some interactive features.
> TODO:
The very last javascript file written by the last execution will be picked up by the interval script, so until such time that this is edited, the saved page will either add one more END line-item to the stack. Also, it may hide the progress-bar contents, for now simply edit the page using a browser inspector or a change to the page contents using HTML & CSS skills.

[➡ Go to Documentation](Documentation.md)

[➡ Go to Code Example](Code-Example.md)

[⬅ Back to README](README.md)