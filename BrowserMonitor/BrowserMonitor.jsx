/**
 * @typedef BrowserMonitorJsContent
 * @property {string} [line_1]
 * @property {string} [line_2]
 * @property {string} [line_3]
 * @property {string} [html_line_1]
 * @property {string} [html_line_2]
 * @property {string} [html_line_3]
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [html_subtitle]
 * @property {number} [progressMaxValue]
 * @property {number} [progressValue]
 * @property {string} [error]
 * @property {string} [html_error]
 * @property {boolean} [isFatalError]
 * @property {string} [meta_1]
 * @property {string} [meta_2]
 * @property {string} [meta_3]
 * @property {string} [meta_4]
 */

/**
 * @typedef BrowserMonitorTimeoutOptions
 * @property {number} [inactivityTimeoutMinutes] - The minutes to wait until auto-close when there has been no new activity.
 * @property {number} [autoCloseSeconds] - The seconds to auto-close due to inactivity.
 * @property {number} [postCompletionSeconds] - The seconds to auto-close due to completion of process. Set to -1 for no auto-closing in post-completion phase.
 * @property {number} [loopMilliseconds] - Milliseconds that set the interval which makes the browser page repeatedly query the updated javascript file.
 */

/**
 * A class to help with viewing process steps in real-ish time by showing the information in a web browser.
 * @param {string} writeFolderPath - Folder Path to write HTML and JS files to.
 * @param {string} key - The distinguishing string to append to the HTML file and JS files.
 * @param {number} maxValue - The max value for a progress bar.
 * @param {string} [title] - The top heading and page title.
 * @param {string} [subtitle] - A subtitle.
 * @param {string} [htmlTemplatePath] - Optional path to a stand-alone HTML template text file. This file must have special markers inside to replace (Ex: %REPLACE_ME%).
 * @param {BrowserMonitorTimeoutOptions} [timeoutOptions] - Optional object with auto-closing options.
 */
function BrowserMonitor (writeFolderPath, key, maxValue, title, subtitle, htmlTemplatePath, timeoutOptions) {
	var self = this;
	if (typeof(createDirectoryPath) == "function") {
		if (!createDirectoryPath(writeFolderPath)) {
			throw Error("Could not create folder '" + writeFolderPath + "' for BrowserMonitor.");
		}
	} else if (!Folder(writeFolderPath).exists) {
		throw Error("Folder '" + writeFolderPath + "' could not be found.");
	}
	if (typeof(JSON) == "undefined") {
		throw Error("Need JSON");
	}
	writeFolderPath = (writeFolderPath.indexOf("\\") > -1)? writeFolderPath.replace(/\\/g, "/") : writeFolderPath;

	const htmlFileName = "BrowserMonitor-" + key + ".html";

	const jsFileName = "BrowserMonitor-" + key + ".js";

	this.folder = writeFolderPath;

	this.htmlTemplate = (htmlTemplatePath) ? readFile(htmlTemplatePath, "UTF-8") :
	/* START HTML */
	decodeURI('%3C!DOCTYPE%20html%3E%0D%0A%3Chtml%20lang=%22en%22%3E%0D%0A%3Chead%3E%0D%0A%09%3C!--%20No%20single%20quotes%20in%20this%20file.%20--%3E%0D%0A%09%3Cmeta%20charset=%22UTF-8%22%3E%0D%0A%09%3Cmeta%20http-' +
	'equiv=%22X-UA-Compatible%22%20content=%22IE=edge%22%3E%0D%0A%09%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1.0%22%3E%0D%0A%09%3Cmeta%20author=%22Vasily%20Hall%22%3E%' +
	'0D%0A%09%3Cmeta%20author-email=%22vasily.hall@gmail.com%22%3E%0D%0A%09%3Cmeta%20org=%22Vantage%20Business%20Automation%20Solutions%20LLC%22%3E%0D%0A%09%3Ctitle%3EBrowserMonitor%3C/title%3E%0D%0A%09%3C' +
	'style%3E%0D%0A%09%09body%20%7B%0D%0A%09%09%09display:%20flex;%0D%0A%09%09%09align-items:%20center;%0D%0A%09%09%09flex-direction:%20column;%0D%0A%09%09%09font-family:%20Arial,%20Helvetica,%20sans-serif' +
	';%0D%0A%09%09%09margin:%200;%0D%0A%09%09%7D%0D%0A%09%09#error-display%20%7B%0D%0A%09%09%09display:%20block;%0D%0A%09%09%09background-color:%20#ffd4d4;%0D%0A%09%09%09padding:%2010px;%0D%0A%09%09%09bord' +
	'er-radius:%206px;%0D%0A%09%09%09color:%20#B50000;%0D%0A%09%09%09box-shadow:%200px%201px%204px%20#f00%0D%0A%09%09%7D%0D%0A%09%09#meta-heading%20%7B%0D%0A%09%09%09padding:%205px;%0D%0A%09%09%09backgroun' +
	'd-color:%20#44ca77;%0D%0A%09%09%09width:%20calc(100%25%20-%2010px);%0D%0A%09%09%09text-align:%20center;%0D%0A%09%09%7D%0D%0A%09%09#meta-heading%20%3E%20span%20%7B%0D%0A%09%09%09font-size:%200.65em;%0D' +
	'%0A%09%09%7D%0D%0A%09%09#color-marker%20%7B%0D%0A%09%09%09width:%20270px;%0D%0A%09%09%09height:%2020px;%0D%0A%09%09%09position:%20absolute;%0D%0A%09%09%09right:%205px;%0D%0A%09%09%09top:%204px;%0D%0A%' +
	'09%09%09display:%20flex;%0D%0A%09%09%09align-items:%20center;%0D%0A%09%09%09justify-content:%20center;%0D%0A%09%09%7D%0D%0A%09%09#progress%20%7B%0D%0A%09%09%09width:%2080vw;%0D%0A%09%09%09background-c' +
	'olor:%20#CCC;%0D%0A%09%09%09height:%2040px;%0D%0A%09%09%09border-radius:%2020px;%0D%0A%09%09%09overflow:%20hidden;%0D%0A%09%09%09margin-bottom:%2020px;%0D%0A%09%09%7D%0D%0A%09%09#progress-line%20%7B%0' +
	'D%0A%09%09%09height:%20100%25;%0D%0A%09%09%09background-color:%20rgb(37,%20126,%202);%0D%0A%09%09%09color:%20#FFF;%0D%0A%09%09%09display:%20flex;%0D%0A%09%09%09align-items:%20center;%0D%0A%09%09%09jus' +
	'tify-content:%20flex-start;%0D%0A%09%09%09border-radius:%2020px;%0D%0A%09%09%09user-select:%20none;%0D%0A%09%09%09width:%20100%25;%0D%0A%09%09%09overflow:%20scroll;%0D%0A%09%09%09overflow-y:%20hidden;' +
	'%0D%0A%09%09%09scrollbar-width:%20none;%0D%0A%09%09%7D%0D%0A%09%09#progress-line::-webkit-scrollbar%20%7B%0D%0A%09%09%09height:%202px;%0D%0A%09%09%7D%0D%0A%09%09.step-marker%20%7B%0D%0A%09%09%09backgr' +
	'ound-color:%20#22a90e;%0D%0A%09%09%09text-align:%20center;%0D%0A%09%09%09margin:%201px;%0D%0A%09%09%09font-size:%200.75em;%0D%0A%09%09%09border-radius:%2010px;%0D%0A%09%09%09cursor:%20pointer;%0D%0A%0' +
	'9%09%09color:%20#dcdcdc;%0D%0A%09%09%09position:%20relative;%0D%0A%09%09%09top:%2015px;%0D%0A%09%09%09flex:%201%201;%0D%0A%09%09%09flex-basis:%2020px;%0D%0A%09%09%7D%0D%0A%09%09.step-marker:hover%20%7' +
	'B%0D%0A%09%09%09color:%20#FFF;%0D%0A%09%09%7D%0D%0A%09%09.step-marker.error%20%7B%0D%0A%09%09%09background-color:%20#af4a4a;%0D%0A%09%09%7D%0D%0A%09%09#progress-annotation%20%7B%0D%0A%09%09%09top:%20-' +
	'28px;%0D%0A%09%09%09position:%20relative;%0D%0A%09%09%09left:%2050%25;%0D%0A%09%09%09width:%20100px;%0D%0A%09%09%09transform:%20translate(-50px);%0D%0A%09%09%09display:%20block;%0D%0A%09%09%09text-ali' +
	'gn:%20center;%0D%0A%09%09%09color:%20#fdff9b;%0D%0A%09%09%09text-shadow:%201px%201px%202px%20#000;%0D%0A%09%09%7D%0D%0A%09%09#main%20%7B%0D%0A%09%09%09display:%20flex;%0D%0A%09%09%09align-items:%20cen' +
	'ter;%0D%0A%09%09%09flex-direction:%20column;%0D%0A%09%09%09z-index:%201;%0D%0A%09%09%09background-color:%20#FFF;%0D%0A%09%09%09padding:%2010px;%0D%0A%09%09%09border:%201px%20solid%20#CCC;%0D%0A%09%09%' +
	'09margin-bottom:%2011px;%0D%0A%09%09%09border-radius:%2028px;%0D%0A%09%09%09position:%20relative;%0D%0A%09%09%09max-width:%20calc(100%25%20-%20200px);%0D%0A%09%09%7D%0D%0A%09%09#main.open%20%7B%0D%0A%' +
	'09%09%09min-height:%20220px;%0D%0A%09%09%7D%0D%0A%09%09#lines%20%7B%0D%0A%09%09%09line-height:%20150%25;%0D%0A%09%09%7D%0D%0A%09%09#lines%20%3E%20span%20%7B%0D%0A%09%09%09min-height:%2020px;%0D%0A%09%' +
	'09%09min-width:%2020px;%0D%0A%09%09%09display:%20inline-block;%0D%0A%09%09%7D%0D%0A%09%09#notifications%20%7B%0D%0A%09%09%09text-align:%20center;%0D%0A%09%09%09line-height:%20200%25;%0D%0A%09%09%7D%0D' +
	'%0A%09%09button%20%7B%0D%0A%09%09%09height:%2050px;%0D%0A%09%09%09border-radius:%2036px;%0D%0A%09%09%09border:%201px%20solid%20#666;%0D%0A%09%09%09font-size:%201.5em;%0D%0A%09%09%09line-height:%20178%' +
	'25;%0D%0A%09%09%09padding-left:%2010px;%0D%0A%09%09%09padding-right:%2010px;%0D%0A%09%09%09background-color:%20#EFEFEF;%0D%0A%09%09%09cursor:%20pointer;%0D%0A%09%09%7D%0D%0A%09%09#toggle-button%20%7B%' +
	'0D%0A%09%09%09position:%20absolute;%0D%0A%09%09%09bottom:%205px;%0D%0A%09%09%7D%0D%0A%09%09#keep-open%20%7B%0D%0A%09%09%09margin:auto;%0D%0A%09%09%09margin-top:%2020px;%0D%0A%09%09%7D%0D%0A%09%09#inac' +
	'tivity-counter%20%7B%0D%0A%09%09%09display:%20block;%0D%0A%09%09%09font-size:%201.85em;%0D%0A%09%09%09margin-top:%20-76px;%0D%0A%09%09%09margin-bottom:%200px;%0D%0A%09%09%09position:%20relative;%0D%0A' +
	'%09%09%7D%0D%0A%09%09svg%20%7B%0D%0A%09%09%09position:%20relative;%0D%0A%09%09%09transform:%20rotate(90deg)%20scale(-1);%0D%0A%09%09%09stroke-dasharray:%20251;%0D%0A%09%09%09stroke-dashoffset:%200;%0D' +
	'%0A%09%09%7D%0D%0A%09%09.error-item%20%7B%0D%0A%09%09%09color:%20#B50000;%0D%0A%09%09%7D%0D%0A%09%09#past-list%20%7B%0D%0A%09%09%09border-top:%201px%20solid%20#666;%0D%0A%09%09%09position:%20relative;' +
	'%0D%0A%09%09%09max-width:%20calc(100%25%20-%20300px);%0D%0A%09%09%7D%0D%0A%09%09@media%20screen%20and%20(max-width:%20600px)%20%7B%0D%0A%09%09%09#past-list%20%7B%0D%0A%09%09%09%09max-width:%20calc(100' +
	'%25%20-%2050px);%0D%0A%09%09%09%7D%0D%0A%09%09%09#main%20%7B%0D%0A%09%09%09%09max-width:%20100%25;%0D%0A%09%09%09%7D%0D%0A%09%09%7D%0D%0A%09%09.fatal-error-list-item%20%7B%0D%0A%09%09%09font-weight:%2' +
	'0bold;%0D%0A%09%09%09color:%20#B50000;%0D%0A%09%09%7D%0D%0A%09%09tr,%20td%20%7B%0D%0A%09%09%09position:%20relative;%0D%0A%09%09%09overflow-wrap:%20anywhere;%0D%0A%09%09%7D%0D%0A%09%09td:first-child%20' +
	'%7B%0D%0A%09%09%09min-width:%20115px;%0D%0A%09%09%7D%0D%0A%09%09.name-span%20%7B%0D%0A%09%09%09color:%20#BBB;%0D%0A%09%09%7D%0D%0A%09%09#step-timer%20%7B%0D%0A%09%09%09position:%20absolute;%0D%0A%09%0' +
	'9%09bottom:%208px;%0D%0A%09%09%09right:%2015px;%0D%0A%09%09%7D%0D%0A%09%09#global-timer%20%7B%0D%0A%09%09%09position:%20absolute;%0D%0A%09%09%09bottom:%208px;%0D%0A%09%09%09left:%2015px;%0D%0A%09%09%7' +
	'D%0D%0A%09%09%5Bdata-sub-index%5D::after,%0D%0A%09%09%5Bdata-progress-value-index%5D::after%20%7B%0D%0A%09%09%09content:%20%22%22;%0D%0A%09%09%09position:%20absolute;%0D%0A%09%09%09left:%20-30px;%0D%0' +
	'A%09%09%09top:%200px;%0D%0A%09%09%09height:%2020px;%0D%0A%09%09%09text-align:%20center;%0D%0A%09%09%09line-height:%20135%25;%0D%0A%09%09%09padding:%202px;%0D%0A%09%09%09min-width:%2020px;%0D%0A%09%09%' +
	'09font-weight:%20bold;%0D%0A%09%09%09background-color:%20rgb(68,%200,%20255);%0D%0A%09%09%09border-radius:%2050%25;%0D%0A%09%09%09color:%20#FFF;%0D%0A%09%09%7D%0D%0A%09%09%5Bdata-progress-value-index%' +
	'5D::after%20%7B%0D%0A%09%09%09background-color:%20rgb(255,%200,%20140);%0D%0A%09%09%09content:%20attr(data-progress-value-index);%0D%0A%09%09%7D%0D%0A%09%09%5Bdata-sub-index%5D::after%20%7B%0D%0A%09%0' +
	'9%09content:%20attr(data-sub-index);%0D%0A%09%09%7D%0D%0A%09%09@keyframes%20offsettozero%20%7B%0D%0A%09%09%09to%20%7B%0D%0A%09%09%09%09stroke-dashoffset:%20251;%0D%0A%09%09%09%7D%0D%0A%09%09%7D%0D%0A%' +
	'09%09@keyframes%20colorMorph%20%7B%20%0D%0A%09%09%09from%20%7B%20background-color:%20#22a90e;%20%7D%20%0D%0A%09%09%09to%20%7B%20background-color:%20#a0a220;%20%7D%0D%0A%09%09%7D%0D%0A%09%09@keyframes%' +
	'20colorMorphWithError%20%7B%20%0D%0A%09%09%09from%20%7B%20background-color:%20#af4a4a;%20%7D%20%0D%0A%09%09%09to%20%7B%20background-color:%20#a0a220;%20%7D%0D%0A%09%09%7D%0D%0A%09%09%5Bdata-marker%5D:' +
	'last-of-type%5Btitle%5E=%22In%22%5D:not(.error)%20%7B%0D%0A%09%09%09animation:%20colorMorph%200.6s%20infinite%20alternate;%0D%0A%09%09%7D%0D%0A%09%09%5Bdata-marker%5D:last-of-type%5Btitle%5E=%22In%22%' +
	'5D.error%20%7B%0D%0A%09%09%09animation:%20colorMorphWithError%200.6s%20infinite%20alternate;%0D%0A%09%09%7D%0D%0A%09%3C/style%3E%0D%0A%09%3Cscript%3E%0D%0A%09%09window.onerror%20=%20function%20(messag' +
	'e,%20b,%20c,%20d,%20e)%20%7B%0D%0A%09%09%09console.log(message);%0D%0A%09%09%09console.log(b);%0D%0A%09%09%09console.log(c);%0D%0A%09%09%09console.log(d);%0D%0A%09%09%09console.log(e);%0D%0A%09%09%09c' +
	'onst%20errorDisplayElement%20=%20document.getElementById(%22error-display%22);%0D%0A%09%09%09errorDisplayElement.style.display%20=%20%22block%22;%0D%0A%09%09%09errorDisplayElement.innerText%20=%20/**%' +
	'20@type%20%7Bstring%7D%20*/%20(message);%0D%0A%09%09%7D;%0D%0A%09%09window.onbeforeunload%20=%20function%20()%20%7B%0D%0A%09%09%09return%20true;%0D%0A%09%09%7D;%0D%0A%09%09window.onload%20=%20function' +
	'%20()%20%7B%0D%0A%09%09%09function%20formatSeconds%20(s)%20%7B%0D%0A%09%09%09%09return%20(s%20-%20(s%20%25=%2060))%20/%2060%20+%20(9%20%3C%20s?%20%22:%22%20:%20%22:0%22)%20+%20s;%0D%0A%09%09%09%7D%0D%' +
	'0A%09%09%09function%20setInnerHTMLWithScript%20(elm,%20html)%20%7B%0D%0A%09%09%09%09elm.innerHTML%20=%20html;%0D%0A%09%09%09%09Array.from(elm.querySelectorAll(%22script%22)).forEach(%20oldScript%20=%3' +
	'E%20%7B%0D%0A%09%09%09%09%09const%20newScript%20=%20document.createElement(%22script%22);%0D%0A%09%09%09%09%09Array.from(oldScript.attributes)%0D%0A%09%09%09%09%09%09.forEach(%20attr%20=%3E%20newScrip' +
	't.setAttribute(attr.name,%20attr.value)%20);%0D%0A%09%09%09%09%09newScript.appendChild(document.createTextNode(oldScript.innerHTML));%0D%0A%09%09%09%09%09oldScript.parentNode.replaceChild(newScript,%2' +
	'0oldScript);%0D%0A%09%09%09%09%7D);%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20getAnnotation%20(val,%20maxval)%20%7B%0D%0A%09%09%09%09return%20val%20+%20%22%20of%20%22%20+%20maxval;%0D%0A%09%09%09%7D%' +
	'0D%0A%09%09%09function%20getProgressWidth%20(val,%20maxval)%20%7B%0D%0A%09%09%09%09return%20(val%20%3E%200)?%20((val%20/%20maxval)%20*%20100).toString()%20+%20%22%25%22%20:%20%220%25%22;%0D%0A%09%09%0' +
	'9%7D%0D%0A%09%09%09function%20startAutoCloseProgress%20(seconds)%20%7B%0D%0A%09%09%09%09toggleMinimizeElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09setTimeout(()%20=%3E%20%7B%0D%0A%09%09%09' +
	'%09%09circleProgressElement.style.opacity%20=%20%221%22;%0D%0A%09%09%09%09%09keepOpenElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09circleProgressElement.style.animation%20=%20%60offsett' +
	'ozero%20$%7Bseconds%7Ds%20linear%20forwards%60;%0D%0A%09%09%09%09%7D,%20350);%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20resetAutoCloseProgress%20()%20%7B%0D%0A%09%09%09%09circleProgressElement.style.' +
	'animation%20=%20%22%22;%0D%0A%09%09%09%09keepOpenElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09circleProgressElement.style.opacity%20=%20%220%22;%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20' +
	'toggleMinimizeProgressBar%20()%20%7B%0D%0A%09%09%09%09if%20(!isProgressBarZoneMinimized%20&&%20(closingTimeout%20!=%20null%20%7C%7C%20postCompletionTimeout%20!=%20null))%20%7B%0D%0A%09%09%09%09%09retu' +
	'rn;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%09isProgressBarZoneMinimized%20=%20!isProgressBarZoneMinimized;%0D%0A%09%09%09%09if%20(isProgressBarZoneMinimized)%20%7B%0D%0A%09%09%09%09%09mainElement.classLi' +
	'st.remove(%22open%22);%0D%0A%09%09%09%09%09linesContainerElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09notificationMessageElement.parentElement.style.display%20=%20%22none%22;%0D%0A%09%0' +
	'9%09%09%09toggleMinimizeElement.innerText%20=%20%22%5CuD83D%5CuDD3D%22;%0D%0A%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09linesContainerElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%0' +
	'9mainElement.classList.add(%22open%22);%0D%0A%09%09%09%09%09if%20(closingTimeout%20!=%20null%20%7C%7C%20postCompletionTimeout%20!=%20null)%20%7B%0D%0A%09%09%09%09%09%09notificationMessageElement.paren' +
	'tElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09toggleMinimizeElement.innerText%20=%20%22%5CuD83D%5CuDD3C%22;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%7D%0D%0A%09%09%0' +
	'9function%20cancelAutoClose%20()%20%7B%0D%0A%09%09%09%09if%20(isAutoCloseCancelled)%20%7B%0D%0A%09%09%09%09%09window.close();%0D%0A%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09if%20(postCompletion' +
	'Timeout%20!=%20null)%20%7B%0D%0A%09%09%09%09%09%09clearInterval(postCompletionTimeout);%0D%0A%09%09%09%09%09%09postCompletionTimeout%20=%20null;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09if%20(closi' +
	'ngTimeout%20!=%20null)%20%7B%0D%0A%09%09%09%09%09%09clearInterval(closingTimeout);%0D%0A%09%09%09%09%09%09closingTimeout%20=%20null;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09notificationMessageElem' +
	'ent.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09inactivityCounterElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09circleProgressElement.style.display%20=%20%22none%22;%0D%0A%09%09%0' +
	'9%09%09isAutoCloseCancelled%20=%20true;%0D%0A%09%09%09%09%09keepOpenElement.innerText%20=%20%22Close%22;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20setStepTimer%20()%20%7B%0D%0A%0' +
	'9%09%09%09if%20(stepTimerInterval%20!=%20null)%20%7B%0D%0A%09%09%09%09%09clearInterval(stepTimerInterval);%0D%0A%09%09%09%09%09stepTimerInterval%20=%20null;%0D%0A%09%09%09%09%09const%20dataProgressEle' +
	'ms%20=%20document.querySelectorAll(%60%5Bdata-marker%5D%60);%0D%0A%09%09%09%09%09if%20(dataProgressElems.length)%20%7B%0D%0A%09%09%09%09%09%09const%20lastMarker%20=%20dataProgressElems%5BdataProgressE' +
	'lems.length%20-%201%5D;%0D%0A%09%09%09%09%09%09lastMarker.title%20=%20lastMarker.innerText%20+%20%22%20%7C%20%22%20+%20formatSeconds(stepTimerSeconds);%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%7D%0D%' +
	'0A%09%09%09%09stepTimerSeconds%20=%200;%0D%0A%09%09%09%09stepTimerInterval%20=%20setInterval(()%20=%3E%20%7B%0D%0A%09%09%09%09%09stepTimerElement.innerText%20=%20formatSeconds(stepTimerSeconds);%0D%0A' +
	'%09%09%09%09%09stepTimerSeconds++;%0D%0A%09%09%09%09%7D,%201000);%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20clearStepTimerAtEnd%20(color)%20%7B%0D%0A%09%09%09%09if%20(stepTimerInterval%20!=%20null)%2' +
	'0%7B%0D%0A%09%09%09%09%09clearInterval(stepTimerInterval);%0D%0A%09%09%09%09%09stepTimerInterval%20=%20null;%0D%0A%09%09%09%09%09stepTimerElement.style.color%20=%20color;%0D%0A%09%09%09%09%09const%20d' +
	'ataProgressElems%20=%20document.querySelectorAll(%60%5Bdata-marker%5D%60);%0D%0A%09%09%09%09%09if%20(dataProgressElems.length)%20%7B%0D%0A%09%09%09%09%09%09const%20lastMarker%20=%20dataProgressElems%5' +
	'BdataProgressElems.length%20-%201%5D;%0D%0A%09%09%09%09%09%09lastMarker.title%20=%20lastMarker.innerText%20+%20%22%20%7C%20%22%20+%20formatSeconds(stepTimerSeconds);%0D%0A%09%09%09%09%09%7D%0D%0A%09%0' +
	'9%09%09%7D%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20setGlobalDurationTimer%20()%20%7B%0D%0A%09%09%09%09globalDurationInterval%20=%20setInterval(()%20=%3E%20%7B%0D%0A%09%09%09%09%09globalTimerElement' +
	'.innerText%20=%20formatSeconds(totalSeconds);%0D%0A%09%09%09%09%09totalSeconds++;%0D%0A%09%09%09%09%7D,%201000);%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20stopGlobalTimer%20()%20%7B%0D%0A%09%09%09%09' +
	'if%20(globalDurationInterval%20!=%20null)%20%7B%0D%0A%09%09%09%09%09clearInterval(globalDurationInterval);%0D%0A%09%09%09%09%09globalDurationInterval%20=%20null;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%09' +
	'globalTimerElement.parentElement.children%5B0%5D.innerHTML%20=%20%22&#8987;%22;%0D%0A%09%09%09%7D%0D%0A%09%09%09function%20addToPastList%20(scriptContent)%20%7B%0D%0A%09%09%09%09const%20previousIndex%' +
	'20=%20document.querySelectorAll(%60%5Bid%5E=%22list-item%22%5D%60).length;%0D%0A%09%09%09%09const%20divider%20=%20document.createElement(%22tr%22);%0D%0A%0D%0A%09%09%09%09const%20dividerContent%20=%20' +
	'document.createElement(%22td%22);%0D%0A%09%09%09%09dividerContent.colSpan%20=%202;%0D%0A%09%09%09%09dividerContent.style.borderBottom%20=%20%221px%20solid%20#F0F%22;%0D%0A%09%09%09%09divider.append(di' +
	'viderContent);%0D%0A%0D%0A%09%09%09%09let%20listItemRow;%0D%0A%09%09%09%09let%20hasExistingProgressValue%20=%20false;%0D%0A%09%09%09%09let%20existingProgressItem;%0D%0A%09%09%09%09const%20reversedKeys' +
	'%20=%20Object.keys(scriptContent).reverse();%0D%0A%09%09%09%09const%20hasProgressValueProperty%20=%20scriptContent.progressValue%20!=%20undefined;%0D%0A%09%09%09%09const%20hasProgressMaxValueProperty%' +
	'20=%20scriptContent.progressMaxValue%20!=%20undefined;%0D%0A%09%09%09%09const%20transformedScriptContent%20=%20%7B%7D;%0D%0A%09%09%09%09if%20(hasProgressValueProperty)%20%7B%0D%0A%09%09%09%09%09transf' +
	'ormedScriptContent.progressValue%20=%20scriptContent.progressValue;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%09if%20(hasProgressMaxValueProperty%20&&%20scriptContent.progressMaxValue%20!=%20initMaxValue)%2' +
	'0%7B%0D%0A%09%09%09%09%09transformedScriptContent.progressMaxValue%20=%20scriptContent.progressMaxValue;%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%09for%20(let%20k%20of%20reversedKeys)%20%7B%0D%0A%09%09%09%' +
	'09%09if%20(k%20!=%20%22progressValue%22%20&&%20k%20!=%20%22progressMaxValue%22)%20%7B%0D%0A%09%09%09%09%09%09transformedScriptContent%5Bk%5D%20=%20scriptContent%5Bk%5D;%0D%0A%09%09%09%09%09%7D%0D%0A%0' +
	'9%09%09%09%7D%0D%0A%09%09%09%09const%20objKeys%20=%20Object.keys(transformedScriptContent);%0D%0A%09%09%09%09let%20index;%0D%0A%09%09%09%09let%20counter%20=%200;%0D%0A%09%09%09%09for%20(let%20k%20of%2' +
	'0objKeys)%20%7B%0D%0A%09%09%09%09%09if%20(transformedScriptContent%5Bk%5D%20===%20%22%22)%20%7B%0D%0A%09%09%09%09%09%09continue;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09const%20isFirstKey%20=%20co' +
	'unter%20==%200;%0D%0A%09%09%09%09%09counter++;%0D%0A%09%09%09%09%09listItemRow%20=%20document.createElement(%22tr%22);%0D%0A%09%09%09%09%09if%20(isFirstKey)%20%7B%0D%0A%09%09%09%09%09%09index%20=%20(p' +
	'reviousIndex%20+%201);%0D%0A%09%09%09%09%09%09listItemRow.id%20=%20%22list-item-%22%20+%20index;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09if%20(k%20==%20%22error%22)%20%7B%20listItemRow.classList.a' +
	'dd(%22error-item%22);%20%7D%0D%0A%09%09%09%09%09if%20(k%20==%20%22isFatalError%22%20&&%20transformedScriptContent%5Bk%5D%20===%20true)%20%7B%20listItemRow.classList.add(%22fatal-error-list-item%22)%20' +
	'%7D%0D%0A%09%09%09%09%09const%20nameSpan%20=%20document.createElement(%22td%22);%0D%0A%09%09%09%09%09nameSpan.classList.add(%22name-span%22);%0D%0A%09%09%09%09%09nameSpan.innerText%20=%20k;%0D%0A%09%0' +
	'9%09%09%09if%20(isFirstKey)%20%7B%0D%0A%09%09%09%09%09%09nameSpan.setAttribute(%22data-index%22,%20index.toString());%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09if%20(k%20==%20%22progressValue%22)%20' +
	'%7B%0D%0A%09%09%09%09%09%09progressValueCount%20=%20transformedScriptContent%5Bk%5D;%0D%0A%09%09%09%09%09%09const%20possibleExistingItems%20=%20document.querySelectorAll(%60%5Bdata-progress-value-inde' +
	'x=%22$%7BprogressValueCount%7D%22%5D%60);%0D%0A%09%09%09%09%09%09if%20(possibleExistingItems.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09hasExistingProgressValue%20=%20true;%0D%0A%09%09%09%09%09' +
	'%09%09existingProgressItem%20=%20possibleExistingItems%5B0%5D.parentNode;%0D%0A%09%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09%09subItemCount%20=%201;%0D%0A%09%09%09%09%09%09%09nameSpan.set' +
	'Attribute(%22data-progress-value-index%22,%20transformedScriptContent%5Bk%5D);%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%7D%20else%20if%20(isFirstKey%20&&%20!hasProgressValueProperty)%20%7B%0D%0' +
	'A%09%09%09%09%09%09const%20possibleExistingItems%20=%20document.querySelectorAll(%60%5Bdata-progress-value-index=%22$%7BprogressValueCount%7D%22%5D%60);%0D%0A%09%09%09%09%09%09if%20(possibleExistingIt' +
	'ems.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09hasExistingProgressValue%20=%20true;%0D%0A%09%09%09%09%09%09%09existingProgressItem%20=%20possibleExistingItems%5B0%5D.parentNode;%0D%0A%09%09%09%' +
	'09%09%09%7D%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09const%20valueSpan%20=%20document.createElement(%22td%22);%0D%0A%09%09%09%09%09if%20(k.indexOf(%22html_%22)%20==%200)%20%7B%0D%0A%09%09%09%09%09%' +
	'09if%20(transformedScriptContent%5Bk%5D%20&&%20transformedScriptContent%5Bk%5D.includes(%22%3Cscript%3E%22)%20&&%20transformedScriptContent%5Bk%5D.includes(%22%3C%5C/s%22%20+%20%22cript%3E%22))%20%7B%' +
	'0D%0A%09%09%09%09%09%09%09setInnerHTMLWithScript(valueSpan,%20transformedScriptContent%5Bk%5D);%0D%0A%09%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09%09valueSpan.innerHTML%20=%20transformedS' +
	'criptContent%5Bk%5D;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09valueSpan.innerText%20=%20transformedScriptContent%5Bk%5D;%0D%0A%09%09%09%09%09%7D%0D%0A%09%' +
	'09%09%09%09listItemRow.append(nameSpan);%0D%0A%09%09%09%09%09listItemRow.append(valueSpan);%0D%0A%09%09%09%09%09if%20(k.indexOf(%22meta_%22)%20==%200)%20%7B%0D%0A%09%09%09%09%09%09listItemRow.setAttri' +
	'bute(%60data-$%7Bk%7D%60,%20encodeURIComponent(transformedScriptContent%5Bk%5D));%0D%0A%09%09%09%09%09%09valueSpan.style.color%20=%20%22#97aab3%22;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09if%20(k%' +
	'20==%20%22END%22%20&&%20transformedScriptContent%5Bk%5D%20===%20true)%20%7B%0D%0A%09%09%09%09%09%09listItemRow.style.backgroundColor%20=%20%22#00ffd7%22;%0D%0A%09%09%09%09%09%09nameSpan.style.fontWeig' +
	'ht%20=%20%22bold%22;%0D%0A%09%09%09%09%09%09nameSpan.style.color%20=%20%22#000%22;%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%09if%20(hasExistingProgressValue)%20%7B%0D%0A%09%09%09%09%09%09existingProg' +
	'ressItem.parentNode.insertBefore(listItemRow,%20existingProgressItem.nextSibling);%0D%0A%09%09%09%09%09%09if%20(isFirstKey)%20%7B%0D%0A%09%09%09%09%09%09%09nameSpan.setAttribute(%60data-sub-index%60,%' +
	'20(subItemCount++).toString());%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09pastListElement.prepend(listItemRow);%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%7' +
	'D%0D%0A%0D%0A%09%09%09%09if%20(hasExistingProgressValue)%20%7B%0D%0A%09%09%09%09%09/**%20@type%20%7BHTMLElement%7D%20*/%0D%0A%09%09%09%09%09const%20existingValuesDivider%20=%20(/**%20@type%20%7BHTMLEl' +
	'ement%7D%20*/%20(divider.cloneNode(true)).children%5B0%5D);%0D%0A%09%09%09%09%09existingValuesDivider.style.borderBottom%20=%20%221px%20solid%20#EEE%22;%0D%0A%09%09%09%09%09existingProgressItem.parent' +
	'Node.insertBefore(existingValuesDivider,%20existingProgressItem.nextSibling);%0D%0A%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09pastListElement.prepend(divider);%0D%0A%09%09%09%09%7D%0D%0A%09%09%0' +
	'9%7D%0D%0A%0D%0A%09%09%09let%20initMaxValue%20=%20Number(%22%25INIT_MAXVALUE%25%22);%20if%20(isNaN(initMaxValue))%20%7B%20initMaxValue%20=%2010;%20%7D%0D%0A%09%09%09let%20currentValue%20=%20Number(%22' +
	'%25INIT_VALUE%25%22);%20if%20(isNaN(currentValue))%20%7B%20currentValue%20=%200;%20%7D%0D%0A%09%09%09const%20initValue%20=%20currentValue;%0D%0A%09%09%09let%20initTitle%20=%20%22%25INIT_TITLE%25%22;%0' +
	'D%0A%09%09%09let%20initSubtitle%20=%20%22%25INIT_SUBTITLE%25%22;%0D%0A%09%09%09let%20initInactivityTimeoutMinutes%20=%20Number(%22%25INIT_INACTIVITY_MINUTES%25%22);%20if%20(isNaN(initInactivityTimeout' +
	'Minutes))%20%7B%20initInactivityTimeoutMinutes%20=%2010;%20%7D;%0D%0A%09%09%09let%20initAutoCloseSeconds%20=%20Number(%22%25INIT_AUTOCLOSE_SECONDS%25%22);%20if%20(isNaN(initAutoCloseSeconds))%20%7B%20' +
	'initAutoCloseSeconds%20=%20160;%20%7D;%0D%0A%09%09%09let%20initPostCompletionSeconds%20=%20Number(%22%25INIT_POST_SECONDS%25%22);%20if%20(isNaN(initPostCompletionSeconds))%20%7B%20initPostCompletionSe' +
	'conds%20=%2030;%20%7D;%0D%0A%09%09%09let%20initLoopMilliseconds%20=%20Number(%22%25INIT_LOOP_MS%25%22);%20if%20(isNaN(initLoopMilliseconds))%20%7B%20initLoopMilliseconds%20=%20500;%20%7D;%0D%0A%09%09%' +
	'09const%20jsFilePath%20=%20%22%25JS_PATH%25%22;%0D%0A%09%09%09let%20stepTimerInterval%20=%20null;%0D%0A%09%09%09let%20stepTimerSeconds%20=%200;%0D%0A%09%09%09let%20globalDurationInterval%20=%20null;%0' +
	'D%0A%09%09%09let%20totalSeconds%20=%200;%0D%0A%0D%0A%09%09%09const%20mainElement%20=%20document.getElementById(%22main%22);%0D%0A%09%09%09const%20progressLineElement%20=%20document.getElementById(%22p' +
	'rogress-line%22);%0D%0A%09%09%09const%20progressAnnotationElement%20=%20document.getElementById(%22progress-annotation%22);%0D%0A%09%09%09const%20linesContainerElement%20=%20document.getElementById(%2' +
	'2lines%22);%0D%0A%09%09%09const%20line_1_element%20=%20document.getElementById(%22line_1%22);%0D%0A%09%09%09const%20line_2_element%20=%20document.getElementById(%22line_2%22);%0D%0A%09%09%09const%20li' +
	'ne_3_element%20=%20document.getElementById(%22line_3%22);%0D%0A%09%09%09const%20titleElement%20=%20document.getElementById(%22title%22);%0D%0A%09%09%09const%20subtitleElement%20=%20document.getElement' +
	'ById(%22subtitle%22);%0D%0A%09%09%09const%20notificationMessageElement%20=%20document.getElementById(%22notification-message%22);%0D%0A%09%09%09const%20inactivityCounterElement%20=%20document.getEleme' +
	'ntById(%22inactivity-counter%22);%0D%0A%09%09%09const%20circleProgressElement%20=%20document.getElementById(%22circle-progress%22);%0D%0A%09%09%09const%20keepOpenElement%20=%20document.getElementById(' +
	'%22keep-open%22);%0D%0A%09%09%09const%20errorElement%20=%20document.getElementById(%22error%22);%0D%0A%09%09%09const%20pastListElement%20=%20document.querySelectorAll(%22#past-list%20tbody%22)%5B0%5D;' +
	'%0D%0A%09%09%09const%20toggleMinimizeElement%20=%20document.getElementById(%22toggle-button%22);%0D%0A%09%09%09const%20stepTimerElement%20=%20document.getElementById(%22step-timer%22).children%5B1%5D;' +
	'%0D%0A%09%09%09const%20globalTimerElement%20=%20document.getElementById(%22global-timer%22).children%5B1%5D;%0D%0A%0D%0A%09%09%09toggleMinimizeElement.onclick%20=%20toggleMinimizeProgressBar;%0D%0A%09' +
	'%09%09keepOpenElement.onclick%20=%20cancelAutoClose;%0D%0A%09%09%09const%20randomRgbPart%20=%20()%20=%3E%20Math.floor(Math.random()%20*%20256);%0D%0A%09%09%09document.getElementById(%22color-marker%22' +
	').style.backgroundColor%20=%20%60rgb($%7BrandomRgbPart()%7D,%20$%7BrandomRgbPart()%7D,%20$%7BrandomRgbPart()%7D)%60;%0D%0A%0D%0A%09%09%09if%20(initSubtitle%20==%20%22%22)%20%7B%0D%0A%09%09%09%09subtit' +
	'leElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%7D%0D%0A%0D%0A%09%09%09if%20(initTitle)%20%7B%0D%0A%09%09%09%09titleElement.innerText%20=%20initTitle;%0D%0A%09%09%09%09document.title%20=%20in' +
	'itTitle;%0D%0A%09%09%09%7D%0D%0A%09%09%09if%20(initSubtitle)%20%7B%0D%0A%09%09%09%09subtitleElement.innerText%20=%20initSubtitle;%0D%0A%09%09%09%7D%0D%0A%09%09%09progressAnnotationElement.innerText%20' +
	'=%20getAnnotation(currentValue,%20initMaxValue);%0D%0A%09%09%09progressLineElement.style.width%20=%20getProgressWidth(currentValue,%20initMaxValue);%0D%0A%09%09%0D%0A%09%09%09let%20gatheredContent%20=' +
	'%20null;%0D%0A%09%09%09let%20lastTimeNewContentFound%20=%20new%20Date().getTime();%0D%0A%09%09%09let%20closingTimeout%20=%20null;%0D%0A%09%09%09let%20postCompletionTimeout%20=%20null;%0D%0A%09%09%09le' +
	't%20closingAfterInactivityCounter%20=%20initAutoCloseSeconds;%0D%0A%09%09%09let%20postCompletionClosingCounter%20=%20initPostCompletionSeconds;%0D%0A%09%09%09let%20subItemCount%20=%201;%0D%0A%09%09%09' +
	'let%20isProgressBarZoneMinimized%20=%20false;%0D%0A%09%09%09let%20isAutoCloseCancelled%20=%20false;%0D%0A%09%09%09let%20progressValueCount%20=%200;%0D%0A%0D%0A%09%09%09let%20mainInterval%20=%20setInte' +
	'rval(()%20=%3E%20%7B%0D%0A%09%09%09%09/**%20@type%20%7BHTMLElement%7D%20*/%0D%0A%09%09%09%09const%20scriptContainer%20=%20document.getElementById(%22script-container%22);%0D%0A%09%09%09%09if%20(script' +
	'Container.children.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09scriptContainer.removeChild(scriptContainer.children%5B0%5D);%0D%0A%09%09%09%09%7D%0D%0A%09%09%09%09const%20s%20=%20document.createElemen' +
	't(%22script%22);%0D%0A%09%09%09%09s.type%20=%20%22text/javascript%22;%0D%0A%09%09%09%09s.onerror%20=%20function%20(a,%20b,%20c,%20d,%20e)%20%7B%20clearInterval(mainInterval);%20mainInterval%20=%20null' +
	';%20throw%20Error(%60Javascript%20file%20could%20not%20be%20loaded%20from%20$%7BjsFilePath%7D%60);%20%7D;%0D%0A%09%09%09%09s.src%20=%20(jsFilePath%20&&%20!jsFilePath.includes(%22%25%22))?%20jsFilePath' +
	'%20:%20(()%20=%3E%20%7B%20throw%20Error(%22JavaScript%20file%20path%20not%20initialized%22)%20%7D)()%0D%0A%09%09%09%09%0D%0A%09%09%09%09s.onload%20=%20function%20()%20%7B%0D%0A%09%09%09%09%09if%20(JSO' +
	'N.stringify(scriptContent)%20!=%20JSON.stringify(gatheredContent))%20%7B%0D%0A%09%09%09%09%09%09if%20(closingTimeout%20!=%20null)%20%7B%0D%0A%09%09%09%09%09%09%09clearInterval(closingTimeout);%0D%0A%0' +
	'9%09%09%09%09%09%09closingTimeout%20=%20null;%0D%0A%09%09%09%09%09%09%09closingAfterInactivityCounter%20=%20initAutoCloseSeconds;%0D%0A%09%09%09%09%09%09%09resetAutoCloseProgress();%0D%0A%09%09%09%09%' +
	'09%09%7D%0D%0A%09%09%09%09%09%09lastTimeNewContentFound%20=%20new%20Date().getTime();%0D%0A%09%09%09%09%09%09gatheredContent%20=%20scriptContent;%0D%0A%09%09%09%09%09%09if%20(scriptContent.line_1%20!=' +
	'%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09line_1_element.innerText%20=%20scriptContent.line_1;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.html_line_1%20!=%20undefined)%2' +
	'0%7B%0D%0A%09%09%09%09%09%09%09line_1_element.innerHTML%20=%20scriptContent.html_line_1;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.line_2%20!=%20undefined)%20%7B%0D%0A%09%0' +
	'9%09%09%09%09%09line_2_element.innerText%20=%20scriptContent.line_2;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.html_line_2%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%0' +
	'9line_2_element.innerHTML%20=%20scriptContent.html_line_2;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.line_3%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09line_3_element' +
	'.innerText%20=%20scriptContent.line_3;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.html_line_3%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09line_3_element.innerHTML%20=%' +
	'20scriptContent.html_line_3;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09const%20hasErrorInContent%20=%20scriptContent.error%20!=%20undefined%20%7C%7C%20scriptContent.html_error%20!=%20undefined' +
	';%0D%0A%09%09%09%09%09%09const%20hasErrorValueInContent%20=%20(hasErrorInContent%20&&%20((scriptContent.error%20!=%20undefined%20&&%20scriptContent.error%20!=%20%22%22)%20%7C%7C%20(scriptContent.html_' +
	'error%20!=%20undefined%20&&%20scriptContent.html_error%20!=%20%22%22)));%0D%0A%09%09%09%09%09%09if%20(hasErrorInContent)%20%7B%0D%0A%09%09%09%09%09%09%09errorElement.style.display%20=%20%22block%22;%0' +
	'D%0A%09%09%09%09%09%09%09if%20(scriptContent.error%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09%09errorElement.innerText%20=%20scriptContent.error;%0D%0A%09%09%09%09%09%09%09%7D%20else%20%7B%0D%' +
	'0A%09%09%09%09%09%09%09%09errorElement.innerHTML%20=%20scriptContent.html_error;%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09if%20(hasErrorValueInContent%20&&%20(scriptContent.progressValu' +
	'e%20==%20undefined%20%7C%7C%20scriptContent.progressValue%20==%20currentValue))%20%7B%0D%0A%09%09%09%09%09%09%09%09const%20relatedMarkerElementSearch%20=%20document.querySelectorAll(%60%5Bdata-marker%' +
	'5D%60);%0D%0A%09%09%09%09%09%09%09%09if%20(relatedMarkerElementSearch.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09const%20relatedMarker%20=%20relatedMarkerElementSearch%5BrelatedMarkerElem' +
	'entSearch.length%20-%201%5D;%0D%0A%09%09%09%09%09%09%09%09%09if%20(!relatedMarker.classList.contains(%22error%22))%20%7B%20relatedMarker.classList.add(%22error%22);%20%7D%0D%0A%09%09%09%09%09%09%09%09' +
	'%7D%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09%09errorElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09%09%09errorElement.innerText%20=%20' +
	'%22%22;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.title%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09initTitle%20=%20scriptContent.title;%0D%0A%09%09%09%09%09%09%09doc' +
	'ument.title%20=%20initTitle;%0D%0A%09%09%09%09%09%09%09titleElement.innerText%20=%20scriptContent.title;%0D%0A%09%09%09%09%09%09%7D%0D%0A%0D%0A%09%09%09%09%09%09if%20(typeof(scriptContent.subtitle)%20' +
	'==%20%22string%22%20&&%20scriptContent.subtitle.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09initSubtitle%20=%20scriptContent.subtitle;%0D%0A%09%09%09%09%09%09%09subtitleElement.innerText%20=%20s' +
	'criptContent.subtitle;%0D%0A%09%09%09%09%09%09%09subtitleElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09%09%7D%20else%20if%20(scriptContent.subtitle%20===%20null)%20%7B%0D%0A%09%09%09%09' +
	'%09%09%09subtitleElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09%09%7D%0D%0A%0D%0A%09%09%09%09%09%09if%20(typeof(scriptContent.html_subtitle)%20==%20%22string%22%20&&%20scriptContent.html' +
	'_subtitle.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09initSubtitle%20=%20scriptContent.html_subtitle;%0D%0A%09%09%09%09%09%09%09subtitleElement.innerHTML%20=%20scriptContent.html_subtitle;%0D%0A' +
	'%09%09%09%09%09%09%09subtitleElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09%09%7D%20else%20if%20(scriptContent.html_subtitle%20===%20null)%20%7B%0D%0A%09%09%09%09%09%09%09subtitleElemen' +
	't.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09%09%7D%0D%0A%0D%0A%09%09%09%09%09%09if%20(scriptContent.progressValue%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09progressAnnotationElement.' +
	'innerText%20=%20getAnnotation(scriptContent.progressValue,%20initMaxValue);%0D%0A%09%09%09%09%09%09%09progressLineElement.style.width%20=%20getProgressWidth(scriptContent.progressValue,%20initMaxValue' +
	');%0D%0A%09%09%09%09%09%09%09if%20(scriptContent.progressValue%20!=%20currentValue)%20%7B%0D%0A%09%09%09%09%09%09%09%09setStepTimer();%0D%0A%09%09%09%09%09%09%09%09if%20(currentValue%20==%20initValue%' +
	'20&&%20globalDurationInterval%20==%20null)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09setGlobalDurationTimer();%0D%0A%09%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09%09const%20newMarkerItem%20=%20doc' +
	'ument.createElement(%22span%22);%0D%0A%09%09%09%09%09%09%09%09newMarkerItem.setAttribute(%22data-marker%22,%20scriptContent.progressValue);%0D%0A%09%09%09%09%09%09%09%09newMarkerItem.classList.add(%22' +
	'step-marker%22);%0D%0A%09%09%09%09%09%09%09%09newMarkerItem.innerText%20=%20scriptContent.progressValue;%0D%0A%09%09%09%09%09%09%09%09if%20(hasErrorValueInContent)%20%7B%20newMarkerItem.classList.add(' +
	'%22error%22);%20%7D%0D%0A%09%09%09%09%09%09%09%09newMarkerItem.title%20=%20%22In%20Progress...%22;%0D%0A%09%09%09%09%09%09%09%09newMarkerItem.onclick%20=%20function%20()%20%7B%0D%0A%09%09%09%09%09%09%' +
	'09%09%09const%20dataProgressElems%20=%20document.querySelectorAll(%60%5Bdata-progress-value-index=%22$%7Bthis.getAttribute(%22data-marker%22)%7D%22%5D%60);%0D%0A%09%09%09%09%09%09%09%09%09if%20(dataPr' +
	'ogressElems.length)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09%09dataProgressElems%5B0%5D.scrollIntoView();%0D%0A%09%09%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09%09%7D;%0D%0A%09%09%09%09%09%09%09' +
	'%09progressLineElement.append(newMarkerItem);%0D%0A%09%09%09%09%09%09%09%09currentValue%20=%20scriptContent.progressValue;%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%7D%20else%20if%20(scrip' +
	'tContent.progressMaxValue)%20%7B%0D%0A%09%09%09%09%09%09%09currentValue%20=%200;%0D%0A%09%09%09%09%09%09%09initMaxValue%20=%20scriptContent.progressMaxValue;%0D%0A%09%09%09%09%09%09%09progressAnnotati' +
	'onElement.innerText%20=%20getAnnotation(currentValue,%20scriptContent.progressMaxValue);%0D%0A%09%09%09%09%09%09%09progressLineElement.style.width%20=%20getProgressWidth(currentValue,%20scriptContent.' +
	'progressMaxValue);%0D%0A%09%09%09%09%09%09%7D%20else%20if%20(scriptContent.progressValue%20!=%20undefined)%20%7B%0D%0A%09%09%09%09%09%09%09if%20(typeof(scriptContent.progressValue)%20!=%20%22number%22' +
	')%20%7B%0D%0A%09%09%09%09%09%09%09%09const%20errorMessage%20=%20%22progressValue%20was%20not%20a%20number%22;%0D%0A%09%09%09%09%09%09%09%09alert(errorMessage);%0D%0A%09%09%09%09%09%09%09%09throw%20Err' +
	'or(errorMessage);%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09if%20(scriptContent.progressValue%20%3C%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09const%20errorMessage%20=%20%22progressValue%20' +
	'was%20less%20than%200%22;%0D%0A%09%09%09%09%09%09%09%09alert(errorMessage);%0D%0A%09%09%09%09%09%09%09%09throw%20Error(errorMessage);%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09if%20(scri' +
	'ptContent.progressValue%20%3E%20initMaxValue)%20%7B%0D%0A%09%09%09%09%09%09%09%09const%20errorMessage%20=%20%60$%7BscriptContent.progressValue%7D%20exceeded%20maximum%20of%20$%7BinitMaxValue%7D%60;%0D' +
	'%0A%09%09%09%09%09%09%09%09alert(errorMessage);%0D%0A%09%09%09%09%09%09%09%09throw%20Error(errorMessage);%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09progressAnnotationElement.innerText%20' +
	'=%20getAnnotation(scriptContent.progressValue,%20initMaxValue);%0D%0A%09%09%09%09%09%09%09progressLineElement.style.width%20=%20getProgressWidth(scriptContent.progressValue,%20initMaxValue);%0D%0A%0D%' +
	'0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09addToPastList(scriptContent);%0D%0A%09%09%09%09%09%09if%20(scriptContent.isFatalError%20===%20true)%20%7B%0D%0A%09%09%09%09%09%09%09window.onbeforeunload' +
	'%20=%20null;%0D%0A%09%09%09%09%09%09%09notificationMessageElement.parentElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09%09%09notificationMessageElement.innerText%20=%20%22FATAL%20ERROR%2' +
	'0ENCOUNTERED%22;%0D%0A%09%09%09%09%09%09%09notificationMessageElement.style.fontWeight%20=%20%22bold%22;%0D%0A%09%09%09%09%09%09%09notificationMessageElement.style.color%20=%20%22#F00%22;%0D%0A%09%09%' +
	'09%09%09%09%09clearInterval(mainInterval);%0D%0A%09%09%09%09%09%09%09mainInterval%20=%20null;%0D%0A%09%09%09%09%09%09%09clearStepTimerAtEnd(%22#B50000%22);%0D%0A%09%09%09%09%09%09%09return;%0D%0A%09%0' +
	'9%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(scriptContent.END%20===%20true)%20%7B%0D%0A%09%09%09%09%09%09%09window.onbeforeunload%20=%20null;%0D%0A%09%09%09%09%09%09%09const%20errorItems%20=%20docum' +
	'ent.querySelectorAll(%22%5Bdata-marker%5D.error%22);%0D%0A%09%09%09%09%09%09%09if%20(errorItems.length%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09notificationMessageElement.parentElement.style.disp' +
	'lay%20=%20%22block%22;%0D%0A%09%09%09%09%09%09%09%09circleProgressElement.style.display%20=%20%22none%22;%0D%0A%09%09%09%09%09%09%09%09inactivityCounterElement.style.display%20=%20%22none%22;%0D%0A%09' +
	'%09%09%09%09%09%09%09isAutoCloseCancelled%20=%20true;%0D%0A%09%09%09%09%09%09%09%09keepOpenElement.innerText%20=%20%22Close%22;%0D%0A%09%09%09%09%09%09%09%09notificationMessageElement.innerText%20=%20' +
	'%60Completed%20with%20Errors%20($%7BerrorItems.length%7D)%60;%0D%0A%09%09%09%09%09%09%09%09notificationMessageElement.style.color%20=%20%22rgb(241%200%200)%22;%0D%0A%09%09%09%09%09%09%09%09notificatio' +
	'nMessageElement.style.fontWeight%20=%20%22bold%22;%0D%0A%09%09%09%09%09%09%09%09notificationMessageElement.style.fontSize%20=%20%221.8em%22;%0D%0A%09%09%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%0' +
	'9%09%09%09%09if%20(initPostCompletionSeconds%20%3E%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09notificationMessageElement.parentElement.style.display%20=%20%22block%22;%0D%0A%09%09%09%09%09%09%09%09%09' +
	'postCompletionTimeout%20=%20setInterval(()%20=%3E%20%7B%0D%0A%09%09%09%09%09%09%09%09%09%09if%20(postCompletionClosingCounter%20==%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09%09%09window.close();%0D%0' +
	'A%09%09%09%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09%09%09%09inactivityCounterElement.innerText%20=%20postCompletionClosingCounter.toString();%0D%0A%09%09%09%09%09%09%09%09%09%09notificationM' +
	'essageElement.innerHTML%20=%20%60%3Cspan%20style=%22font-weight:bold;font-size:1.5em;color:#0d6105;%22%3EProcess%20complete%3C/span%3E%3Cbr/%3E%3Cspan%3EClosing%20in%20$%7BinitPostCompletionSeconds%7D' +
	'%20seconds.%3C/span%3E%60;%0D%0A%09%09%09%09%09%09%09%09%09%09postCompletionClosingCounter--;%0D%0A%09%09%09%09%09%09%09%09%09%7D,%201000);%0D%0A%09%09%09%09%09%09%09%09%09startAutoCloseProgress(postC' +
	'ompletionClosingCounter);%0D%0A%09%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09clearInterval(mainInterval);%0D%0A%09%09%09%09%09%09%09mainInterval%20=%20null;%0D%0A' +
	'%09%09%09%09%09%09%09clearStepTimerAtEnd(%22#119922%22);%0D%0A%09%09%09%09%09%09%09stopGlobalTimer();%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%7D%20else%20%7B%0D%0A%09%09%09%09%09%09if%20(closi' +
	'ngTimeout%20!=%20null)%20%7B%0D%0A%09%09%09%09%09%09%09return;%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09if%20(new%20Date(new%20Date().getTime()%20-%20lastTimeNewContentFound).getMinutes()%20%' +
	'3E%20initInactivityTimeoutMinutes)%20%7B%0D%0A%09%09%09%09%09%09%09window.onbeforeunload%20=%20null;%0D%0A%09%09%09%09%09%09%09const%20message%20=%20%60$%7BinitInactivityTimeoutMinutes%7D%20minute(s)%' +
	'20since%20new%20content%20was%20found.%20Closing%20in%20$%7BinitAutoCloseSeconds%7D%20seconds.%60;%0D%0A%09%09%09%09%09%09%09notificationMessageElement.parentElement.style.display%20=%20%22block%22;%0' +
	'D%0A%09%09%09%09%09%09%09clearStepTimerAtEnd(%22#B50000%22);%0D%0A%09%09%09%09%09%09%09stopGlobalTimer();%0D%0A%09%09%09%09%09%09%09closingTimeout%20=%20setInterval(()%20=%3E%20%7B%0D%0A%09%09%09%09%0' +
	'9%09%09%09if%20(closingAfterInactivityCounter%20==%200)%20%7B%0D%0A%09%09%09%09%09%09%09%09%09window.close();%0D%0A%09%09%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%09%09%09notificationMessageElement.i' +
	'nnerText%20=%20message;%0D%0A%09%09%09%09%09%09%09%09inactivityCounterElement.innerText%20=%20closingAfterInactivityCounter.toString();%0D%0A%09%09%09%09%09%09%09%09closingAfterInactivityCounter--;%0D' +
	'%0A%09%09%09%09%09%09%09%7D,%201000);%0D%0A%09%09%09%09%09%09%09startAutoCloseProgress(closingAfterInactivityCounter);%0D%0A%09%09%09%09%09%09%7D%0D%0A%09%09%09%09%09%7D%0D%0A%09%09%09%09%7D;%0D%0A%09' +
	'%09%09%09scriptContainer.append(s);%0D%0A%09%09%09%7D,%20initLoopMilliseconds);%0D%0A%09%09%7D;%0D%0A%09%3C/script%3E%0D%0A%3C/head%3E%0D%0A%3Cbody%3E%0D%0A%09%3Cspan%20id=%22meta-heading%22%3E%0D%0A%' +
	'09%09%3Cspan%20style=%22float:left;cursor:pointer;%22%20onclick=%22(function%20()%20%7B%20alert(%60BrowserMonitor%20progress%20utility%20by%20Vasily%20Hall%20(VBAS%20LLC),%202021%5Cn%5CnIf%20you%20wis' +
	'h%20to%20keep%20the%20records%20of%20the%20progress,%20do%20NOT%20refresh%20the%20page;%20use%20right-click%20and%20Save-As%20to%20save%20the%20page%20with%20its%20data.%60);%20%7D)()%22%3E&#x2754;%3C' +
	'/span%3E%0D%0A%09%09BrowserMonitor%20Script%20Progress%20Utility%0D%0A%09%09%3Cspan%20id=%22color-marker%22%3E%0D%0A%09%09%09%3Cspan%3E%0D%0A%09%09%09%09&nbsp;&nbsp;%3Cscript%3Evar%20d%20=%20new%20Dat' +
	'e();document.write(d.toLocaleDateString()%20+%20%22%20%22%20+%20d.toLocaleTimeString());%3C/script%3E%0D%0A%09%09%09%3C/span%3E%0D%0A%09%09%3C/span%3E%0D%0A%09%3C/span%3E%0D%0A%09%3Cp%20id=%22error-di' +
	'splay%22%20style=%22display:%20none;%22%3E%3C/p%3E%0D%0A%09%3Cdiv%20id=%22script-container%22%3E%3C/div%3E%0D%0A%09%3Ch1%20id=%22title%22%3E%3C/h1%3E%0D%0A%09%3Ch2%20id=%22subtitle%22%3E%3C/h2%3E%0D%0' +
	'A%09%3Cdiv%20id=%22main%22%20class=%22open%22%3E%0D%0A%09%09%3Cdiv%20id=%22progress%22%3E%0D%0A%09%09%09%3Cdiv%20id=%22progress-line%22%20title=%22Click%20the%20scrollbar%20and%20use%20arrow%20keys,%2' +
	'0or%20hold%20shift%20and%20use%20the%20mousewheel%20to%20scroll%20overflowing%20items.%22%3E%3C/div%3E%0D%0A%09%09%09%3Cspan%20id=%22progress-annotation%22%3E%3C/span%3E%0D%0A%09%09%3C/div%3E%0D%0A%09' +
	'%09%3Cp%20id=%22lines%22%3E%0D%0A%09%09%09%3Cspan%20id=%22line_1%22%3E%3C/span%3E%3Cbr/%3E%0D%0A%09%09%09%3Cspan%20id=%22line_2%22%3E%3C/span%3E%3Cbr/%3E%0D%0A%09%09%09%3Cspan%20id=%22line_3%22%3E%3C/' +
	'span%3E%0D%0A%09%09%09%3Cspan%20id=%22error%22%20style=%22display:%20none;%22%20class=%22error-item%22%3E%3C/span%3E%0D%0A%09%09%3C/p%3E%0D%0A%09%09%3Cp%20id=%22notifications%22%20style=%22display:%20' +
	'none;%22%3E%0D%0A%09%09%09%3Cspan%20id=%22notification-message%22%3E%3C/span%3E%0D%0A%09%09%09%3Cbr/%3E%0D%0A%09%09%09%3Csvg%20height=%22100%22%20width=%22100%22%20id=%22circle-progress%22%20style=%22' +
	'opacity:%200;%22%3E%0D%0A%09%09%09%09%3Ccircle%20cx=%2250%22%20cy=%2250%22%20r=%2240%22%20stroke=%22#B50000%22%20stroke-width=%226%22%20fill=%22#FFF%22%20/%3E%0D%0A%09%09%09%3C/svg%3E%20%0D%0A%09%09%0' +
	'9%3Cspan%20id=%22inactivity-counter%22%3E&nbsp;%3C/span%3E%0D%0A%09%09%09%3Cbr/%3E%0D%0A%09%09%09%3Cbutton%20type=%22button%22%20id=%22keep-open%22%20style=%22display:%20none;%22%3EKeep%20Open%3C/butt' +
	'on%3E%0D%0A%09%09%3C/p%3E%0D%0A%09%09%3Cspan%20id=%22toggle-button%22%3E&#x1F53C;%3C/span%3E%0D%0A%09%09%3Cspan%20id=%22global-timer%22%3E%3Cspan%3E&#9203;&nbsp;%3C/span%3E%3Cspan%3E0:00%3C/span%3E%3C' +
	'/span%3E%0D%0A%09%09%3Cspan%20id=%22step-timer%22%3E%3Cspan%3E&#9201;&nbsp;%3C/span%3E%3Cspan%3E0:00%3C/span%3E%3C/span%3E%0D%0A%09%3C/div%3E%0D%0A%09%3Chr%20style=%22width:calc(100%25%20-%2010px)%22%' +
	'3E%0D%0A%09%3Ctable%20id=%22past-list%22%3E%0D%0A%09%09%3Cthead%3E%0D%0A%09%09%09%3Ctr%3E%0D%0A%09%09%09%09%3Cth%3EName%3C/th%3E%0D%0A%09%09%09%09%3Cth%3EValue%3C/th%3E%0D%0A%09%09%09%3C/tr%3E%0D%0A%0' +
	'9%09%3C/thead%3E%0D%0A%09%09%3Ctbody%3E%3C/tbody%3E%0D%0A%09%3C/table%3E%0D%0A%3C/body%3E%0D%0A%3C/html%3E');
	/* END HTML */

	this.maxValue = maxValue;

	this.currentValue = 0;

	this.title = title || "BrowserMonitor Script Progress";

	this.subtitle = subtitle || "";

	/** @type {string} - Unique identifier string. */
	this.key = key;

	this.timeoutOptions = /** @type {BrowserMonitorTimeoutOptions} */ ({
		inactivityTimeoutMinutes : 10,
		autoCloseSeconds : 160,
		postCompletionSeconds : 30,
		loopMilliseconds : 500,
	});

	for (var all in timeoutOptions) {
		if (all in this.timeoutOptions && typeof(timeoutOptions[all]) == "number") {
			this.timeoutOptions[all] = timeoutOptions[all];
		}
	}

	/**
	 * @param {BrowserMonitorJsContent} jsContent - The javascript content to write as a .js file.
	 */
	this.writeJs = function (jsContent) {
		var writeStr = "var scriptContent = " + JSON.stringify(jsContent);
		var writeResult = writeFile(this.folder + "/" + jsFileName, writeStr, "UTF-8");
		$.sleep(self.timeoutOptions.loopMilliseconds + 90); // let the file be written with a timeout to where the querying html file has time to read it.
		if (!writeResult) {
			throw Error("Could not write file to '" + this.folder + "'");
		}
	};

	this.writeHtml = function () {
		var replaceKeys = {
			JS_PATH : "file://" + this.folder + "/" + jsFileName,
			INIT_MAXVALUE : maxValue,
			INIT_VALUE : 0,
			INIT_TITLE : title || "Script Progress",
			INIT_SUBTITLE : subtitle || "",
			INIT_INACTIVITY_MINUTES : (timeoutOptions && timeoutOptions.inactivityTimeoutMinutes)? timeoutOptions.inactivityTimeoutMinutes : this.timeoutOptions.inactivityTimeoutMinutes,
			INIT_AUTOCLOSE_SECONDS : (timeoutOptions && timeoutOptions.autoCloseSeconds)? timeoutOptions.autoCloseSeconds : this.timeoutOptions.autoCloseSeconds,
			INIT_POST_SECONDS : (timeoutOptions && timeoutOptions.postCompletionSeconds)? timeoutOptions.postCompletionSeconds : this.timeoutOptions.postCompletionSeconds,
			INIT_LOOP_MS : (timeoutOptions && timeoutOptions.loopMilliseconds)? timeoutOptions.loopMilliseconds : this.timeoutOptions.loopMilliseconds,
		};

		var processedHtmlTemplate = this.htmlTemplate;
		for (var all in replaceKeys) {
			processedHtmlTemplate = processedHtmlTemplate.replace("%" + all + "%", replaceKeys[all]);
		}
		var writeResult = writeFile(this.folder + "/" + htmlFileName, processedHtmlTemplate, "UTF-8");
		if (!writeResult) {
			throw Error("Could not write file to '" + this.folder + "'");
		}
	};

	/**
	 * @param {BrowserMonitorJsContent} newJsContent - Updated JS content to write to the JS file location which the HTML file will repeatedly query.
	 */
	this.update = function (newJsContent) {
		if (typeof(newJsContent.progressMaxValue) == "number") {
			self.maxValue = newJsContent.progressMaxValue;
		}
		if (typeof(newJsContent.progressValue) == "number") {
			self.currentValue = newJsContent.progressValue;
		}
		if (newJsContent.title != undefined) {
			self.title = newJsContent.title;
		}
		if (newJsContent.subtitle != undefined) {
			self.subtitle = newJsContent.subtitle;
		} else if (newJsContent.html_subtitle != undefined) {
			self.subtitle = newJsContent.html_subtitle;
		}
		self.writeJs(newJsContent);
	};

	/**
	 * @param {BrowserMonitorJsContent} [initJsContent] - JS Content that starts the monitored process.
	 */
	this.begin = function (initJsContent) {
		if (!initJsContent) {
			initJsContent = {
				progressValue : 0
			};
		}
		this.writeJs(initJsContent);
		this.writeHtml();
		File(this.folder + "/" + htmlFileName).execute();
	};

	this.end = function () {
		this.update({
			END : true
		});
	};

	this.toJSON = function () { // The htmlTemplate contains emojis, and exists in the class so it's removed from JSON properties as it causes problems for parsing.
		var newObj = {};
		for (var all in this) {
			if (typeof(this[all]) != "function") {
				if (all != "htmlTemplate") {
					newObj[all] = this[all];
				}
			}
		}
		return newObj;
	};

};

/**
 * @param {string | object} inStr - A stringified BrowserMonitor.
 * @returns {BrowserMonitor}
 */
BrowserMonitor.fromJSON = function (inStr) {
	var isString = typeof(inStr) == "string";
	if ((typeof(inStr) != "object" && !isString) || inStr == null) {
		throw Error("BrowserMonitor.fromJSON(): Incoming argument is invalid.");
	}
	/** @type {BrowserMonitor} */
	var parsedObj = (isString)? JSON.parse(inStr) : inStr;
	for (var all in this) {
		if (all != "htmlTemplate" && all != "prototype" && typeof(this[all]) != "function") {
			if (!(all in parsedObj)) {
				throw Error("BrowserMonitor.fromJSON(): property '" + all + "' is invalid."); // a property is missing from the incoming object.
			}
		}
	}
	var newInstance = new BrowserMonitor(parsedObj.folder, parsedObj.key, parsedObj.maxValue, parsedObj.title, parsedObj.subtitle, undefined, parsedObj.timeoutOptions);
	return newInstance;
};