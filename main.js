const obsidian = require("obsidian");
const path = require("path");

var _hvpId = 0;
var _hvpDebug = false; // set true to enable logging
var _hvpLogPath = null;
var _hvpLogBuf = [];
var _hvpLogTimer = null;
function _hvpLog(msg) {
	if (!_hvpDebug) return;
	var line = new Date().toISOString().substr(11, 12) + " [" + (++_hvpId) + "] " + msg;
	console.log("[HVP] " + line);
	if (_hvpLogPath) {
		_hvpLogBuf.push(line);
		if (!_hvpLogTimer) {
			_hvpLogTimer = setTimeout(function() {
				var buf = _hvpLogBuf.splice(0);
				_hvpLogTimer = null;
				if (buf.length > 0) {
					try { require("fs").appendFileSync(_hvpLogPath, buf.join("\n") + "\n"); } catch(e) {}
				}
			}, 500);
		}
	}
}

const VIEW_TYPE = "html-viewer-plus";
const HTML_EXT = ["htm", "html", "shtml", "xht", "xhtml"];
const MHTML_EXT = ["mht", "mhtml"];

const DEFAULT_SETTINGS = {
	language: "en",
	defaultWidth: "100%",
	aspectRatio: "4/3",
	showToolbar: true,
	enableZoom: true,
	zoomStep: 0.1,
	syncDarkTheme: true,
	customDarkCSS: "",
	enableSearch: true,
	bgColor: "#ffffff",
	bgColorEnabled: false,
	hotRefresh: false,
	mhtmlSupport: true,
};

const HVP_TEXT = {
	en: {
		copied: "Copied: ",
		pasted: "Pasted",
		copy: "Copy",
		paste: "Paste",
		nothingToCopy: "Nothing to copy",
		pasteUnavailable: "Paste is only available in editable fields",
		contextEmbed: "Embed",
		contextLink: "Link",
		fullscreen: "Fullscreen",
		openExternally: "Open externally",
		locateFile: "Locate file",
		zoomIn: "Zoom in",
		zoomOut: "Zoom out",
		resetZoom: "Reset zoom",
		search: "Search",
		refresh: "Refresh",
		searchPlaceholder: "Search...",
		previous: "Previous",
		next: "Next",
		close: "Close",
		noResults: "No results",
		unableOpenExternally: "Unable to open externally",
		noUsableIds: "No usable IDs found in this HTML",
		copyEmbedSyntax: "Click to copy embed syntax",
		settings: "Settings",
		guide: "Guide",
		interface: "Interface",
		language: "Language",
		languageDesc: "Turn on for English, off for Chinese",
		english: "English",
		chinese: "中文",
		embedSize: "Embed size",
		defaultWidth: "Default width",
		defaultWidthDesc: "Default embed width, such as 100% or 600px",
		aspectRatio: "Aspect ratio",
		aspectRatioDesc: "Embed aspect ratio. Supports formats like 4/3, 16:9, and 1.33. Height is calculated from the width.",
		toolbar: "Toolbar",
		showToolbar: "Show toolbar",
		showToolbarDesc: "Show action buttons in the lower-right corner of embeds",
		directOpenMode: "Direct open mode",
		enableZoom: "Enable zoom",
		enableZoomDesc: "Use Ctrl + mouse wheel to zoom content when opening HTML files directly",
		zoomStep: "Zoom step",
		zoomStepDesc: "Zoom amount per scroll step (0.05 to 0.5)",
		enableSearch: "Enable search",
		enableSearchDesc: "Show the search button in the toolbar when opening HTML files directly",
		theme: "Theme",
		syncDarkTheme: "Sync dark theme",
		syncDarkThemeDesc: "Inject dark styles into HTML when Obsidian is using a dark theme",
		customDarkCSS: "Custom dark CSS",
		customDarkCSSDesc: "Custom CSS appended after the default dark styles",
		customBg: "Custom background color",
		customBgDesc: "Force the HTML body background color when enabled",
		advanced: "Advanced",
		hotRefresh: "Hot refresh",
		hotRefreshDesc: "Automatically reload embedded content when the HTML file changes",
		mhtmlSupport: "MHTML support",
		mhtmlSupportDesc: "Support opening .mht and .mhtml web archive files (requires restarting the plugin)",
		searchGuidePlaceholder: "Search guide...",
		embedSyntax: "Embed syntax",
		embedDefaultDesc: "Embed HTML using the default width and aspect ratio from plugin settings",
		embedWidthDesc: "Embed HTML with a custom 400px width; height is calculated from the aspect ratio",
		embedSizeDesc: "Embed HTML with a custom 400px width and 300px height, overriding the aspect ratio",
		embedElementDesc: "Show only the specified element ID, hide other content, and fit the height automatically",
		embedTip: "Tip: add id attributes to elements in your HTML so you can target them with #id",
		directOpen: "Direct open",
		directOpenDesc: "Click an HTML file in the file explorer to open it in a dedicated view that fills the editor height.",
		embedModeToolbar: "Embed mode toolbar",
		embedFullscreenDesc: "Fullscreen: show the embedded content fullscreen",
		embedExternalDesc: "Open externally: open the file with the system default browser",
		embedLocateDesc: "Locate file: open the HTML file in Obsidian",
		embedToolbarDesc: "The toolbar is translucent by default and becomes fully visible on hover",
		directToolbar: "Direct open toolbar",
		directZoomDesc: "Zoom in / out, also available with Ctrl + mouse wheel",
		directResetDesc: "Reset zoom to 100%",
		directSearchDesc: "Open the search bar and find text inside the HTML, including tabbed content",
		directRefreshDesc: "Refresh and reload the HTML content",
		directExternalDesc: "Open the file externally with the system default app",
		rightClickMenu: "Right-click menu",
		rightClickOpenDesc: "Right-click inside HTML content to open the element menu",
		rightClickAncestorsDesc: "The menu shows ancestor elements with IDs at the clicked position",
		rightClickActionsDesc: "Copy text, paste into editable fields, or copy embed/link syntax for elements with IDs",
		rightClickHoverDesc: "Hovering a menu item highlights the matching HTML element",
		rightClickCloseDesc: "Left-click elsewhere in the HTML to close the menu",
		embedBadge: "Embed badge and interaction",
		embedBadgeDesc: "A < > badge appears in the upper-right corner on hover and jumps to the matching embed syntax in Markdown",
		scrollGuardDesc: "Embed scrolling is guarded: click the content once before scrolling to avoid accidental scrolling in notes",
		searchTabs: "Search and tab switching",
		searchTabsDesc: "Click the search button and enter a keyword in the upper-right input. If the HTML uses tabs, search detects the tab containing the match and switches to it. Press Enter or Next for the next match, Previous for the prior match, and Esc or Close to exit search.",
		darkThemeSync: "Dark theme sync",
		darkThemeSyncDesc: "When enabled, the plugin injects dark CSS into HTML when Obsidian switches to a dark theme. Add overrides in Custom dark CSS.",
		hotRefreshGuideDesc: "When enabled, embeds reload automatically after an HTML file is changed and saved externally. This is useful for live preview while editing HTML.",
		mhtmlGuideDesc: "When enabled, .mht and .mhtml web archive files can be opened directly and rendered from their parsed HTML content.",
		supportedFormats: "Supported file formats",
		mhtmlRequires: "MHTML (requires enabling): .mht, .mhtml",
		matches: " matches",
		noMatches: "No matches",
		disableEmbedHtml: "Consider disabling the Embed HTML plugin to avoid conflicts with HTML Viewer Plus",
	},
	zh: {
		copied: "已复制: ",
		pasted: "已粘贴",
		copy: "复制",
		paste: "粘贴",
		nothingToCopy: "没有可复制的内容",
		pasteUnavailable: "只能粘贴到可编辑字段",
		contextEmbed: "嵌入",
		contextLink: "链接",
		fullscreen: "全屏",
		openExternally: "外部打开",
		locateFile: "定位到文件",
		zoomIn: "放大",
		zoomOut: "缩小",
		resetZoom: "重置缩放",
		search: "搜索",
		refresh: "刷新",
		searchPlaceholder: "搜索...",
		previous: "上一个",
		next: "下一个",
		close: "关闭",
		noResults: "无结果",
		unableOpenExternally: "无法在外部打开",
		noUsableIds: "此 HTML 中没有可用 ID",
		copyEmbedSyntax: "点击复制嵌入语法",
		settings: "基本设置",
		guide: "使用说明",
		interface: "界面",
		language: "语言",
		languageDesc: "开启为英文，关闭为中文",
		english: "English",
		chinese: "中文",
		embedSize: "嵌入尺寸",
		defaultWidth: "默认宽度",
		defaultWidthDesc: "嵌入时的默认宽度，如 100%、600px",
		aspectRatio: "宽高比",
		aspectRatioDesc: "嵌入区域的宽高比。支持格式：4/3、16:9、1.33 等。宽度确定后高度按此比例自动计算。",
		toolbar: "工具栏",
		showToolbar: "显示工具栏",
		showToolbarDesc: "在嵌入视图右下角显示操作按钮（全屏、外部打开、定位到文件）",
		directOpenMode: "直接打开模式",
		enableZoom: "启用缩放",
		enableZoomDesc: "直接打开 HTML 文件时，使用 Ctrl + 鼠标滚轮缩放内容",
		zoomStep: "缩放步长",
		zoomStepDesc: "每次滚动的缩放比例（0.05 ~ 0.5）",
		enableSearch: "启用搜索",
		enableSearchDesc: "直接打开 HTML 文件时，在工具栏中显示搜索按钮",
		theme: "主题",
		syncDarkTheme: "同步暗色主题",
		syncDarkThemeDesc: "Obsidian 使用暗色主题时，自动向 HTML 注入暗色样式",
		customDarkCSS: "自定义暗色 CSS",
		customDarkCSSDesc: "追加到默认暗色样式后面的自定义 CSS",
		customBg: "自定义背景色",
		customBgDesc: "开启后强制设置 HTML body 背景色",
		advanced: "高级",
		hotRefresh: "热刷新",
		hotRefreshDesc: "HTML 文件被修改时自动重新加载嵌入内容",
		mhtmlSupport: "MHTML 支持",
		mhtmlSupportDesc: "支持打开 .mht / .mhtml 网页存档文件（需要重启插件）",
		searchGuidePlaceholder: "搜索说明...",
		embedSyntax: "嵌入语法",
		embedDefaultDesc: "嵌入 HTML，使用插件设置中的默认宽度和宽高比",
		embedWidthDesc: "嵌入 HTML，自定义宽度为 400px，高度按宽高比自动计算",
		embedSizeDesc: "嵌入 HTML，自定义宽度 400px、高度 300px（覆盖宽高比）",
		embedElementDesc: "只提取显示指定 id 元素的内容，隐藏其他内容，高度自适应",
		embedTip: "提示：在 HTML 中为需要嵌入的元素添加 id 属性，即可通过 #id 精确定位",
		directOpen: "直接打开",
		directOpenDesc: "在文件管理器中点击 HTML 文件，会以独立视图打开，高度自动填满编辑区。",
		embedModeToolbar: "嵌入模式工具栏",
		embedFullscreenDesc: "⛶ 全屏 — 全屏显示嵌入内容",
		embedExternalDesc: "↗ 外部打开 — 用系统默认浏览器打开文件",
		embedLocateDesc: "→ 定位到文件 — 在 Obsidian 中打开该 HTML 文件",
		embedToolbarDesc: "工具栏默认半透明，鼠标悬停时完全显示，不影响内容浏览",
		directToolbar: "直接打开模式工具栏",
		directZoomDesc: "＋ / － — 放大 / 缩小（也可用 Ctrl + 鼠标滚轮）",
		directResetDesc: "↺ — 重置缩放到 100%",
		directSearchDesc: "🔍 — 打开搜索栏，输入关键词后在 HTML 内查找文本（自动跳转到包含匹配内容的标签页）",
		directRefreshDesc: "↻ — 手动刷新，重新加载 HTML 内容",
		directExternalDesc: "↗ — 用系统默认浏览器 / 程序在外部打开文件",
		rightClickMenu: "右键菜单（嵌入/直接打开）",
		rightClickOpenDesc: "在 HTML 内容区域右键点击，弹出可用元素菜单",
		rightClickAncestorsDesc: "菜单显示鼠标所在位置所有带 id 的祖先元素",
		rightClickActionsDesc: "可复制文本、粘贴到可编辑字段，或为带 id 的元素复制嵌入/链接语法",
		rightClickHoverDesc: "鼠标悬停在菜单条目上，对应 HTML 元素会显示蓝色高亮边框",
		rightClickCloseDesc: "左键点击 HTML 其他区域可关闭菜单",
		embedBadge: "嵌入徽章与交互",
		embedBadgeDesc: "嵌入区域右上角显示 < > 徽章，hover 时可见，点击可定位到 Markdown 中对应的嵌入语法位置",
		scrollGuardDesc: "嵌入内容有滚动保护：首次需要点击内容区域后才能滚动，避免在笔记中误触滚动嵌入内容",
		searchTabs: "搜索功能与标签页跳转",
		searchTabsDesc: "点击搜索按钮后，在右上角输入框输入关键词。如果 HTML 内容使用了标签页（tab）组织，搜索会自动检测匹配内容所在的标签页并切换过去。按 Enter 或点击 ▼ 跳到下一个匹配，点击 ▲ 跳到上一个。按 Esc 或点击 ✕ 关闭搜索。",
		darkThemeSync: "暗色主题同步",
		darkThemeSyncDesc: "开启后，当 Obsidian 切换到暗色主题时，会自动向 HTML 注入暗色 CSS 样式。可在「自定义暗色 CSS」中追加自己的样式覆盖。",
		hotRefreshGuideDesc: "开启后，当 HTML 文件在外部被修改并保存时，嵌入视图会自动重新加载。适合实时预览编辑中的 HTML 文件。",
		mhtmlGuideDesc: "开启后支持直接打开 .mht / .mhtml 网页存档文件，自动解析并渲染其中的 HTML 内容。",
		supportedFormats: "支持的文件格式",
		mhtmlRequires: "MHTML（需开启）: .mht, .mhtml",
		matches: " 个匹配",
		noMatches: "无匹配",
		disableEmbedHtml: "建议禁用 Embed HTML 插件，避免与 HTML Viewer Plus 冲突",
	},
};

function hvpText(plugin, key) {
	var lang = (plugin && plugin.settings && plugin.settings.language) || "en";
	var pack = HVP_TEXT[lang] || HVP_TEXT.en;
	return pack[key] || HVP_TEXT.en[key] || key;
}

// --- Blob URL Cache: share blob URLs for same file + dark theme combo ---
var _blobCache = {};
var _blobCacheOrder = []; // LRU order
var _blobCacheMax = 30;
function _cacheKey(file, dark) { return file.path + "|" + (dark ? "1" : "0"); }
function _getCachedBlob(key) { return _blobCache[key] || null; }
function _setCachedBlob(key, url) {
	_evictBlob(key); // remove old if exists
	_blobCache[key] = url;
	_blobCacheOrder.push(key);
	// LRU eviction
	while (_blobCacheOrder.length > _blobCacheMax) {
		var oldKey = _blobCacheOrder.shift();
		var oldUrl = _blobCache[oldKey];
		if (oldUrl) { URL.revokeObjectURL(oldUrl); delete _blobCache[oldKey]; }
	}
}
function _evictBlob(key) {
	var url = _blobCache[key];
	if (url) { URL.revokeObjectURL(url); delete _blobCache[key]; }
	var idx = _blobCacheOrder.indexOf(key);
	if (idx !== -1) _blobCacheOrder.splice(idx, 1);
}
function _clearAllBlobs() {
	for (var k in _blobCache) { URL.revokeObjectURL(_blobCache[k]); }
	_blobCache = {};
	_blobCacheOrder = [];
}

// --- Pending reads dedup: share in-flight read result ---
var _pendingReads = {};
function _readFile(vault, file) {
	var fp = file.path;
	if (_pendingReads[fp]) return _pendingReads[fp];
	var p = vault.read(file);
	_pendingReads[fp] = p;
	var done = function() { delete _pendingReads[fp]; };
	p.then(done, done);
	return p;
}

function parseSize(v) {
	if (!v) return null;
	return v === String(Number(v)) ? v + "px" : v;
}

function parseAspectRatio(v) {
	if (!v) return "4/3";
	if (v.indexOf(":") !== -1) {
		var parts = v.split(":");
		return (parseFloat(parts[0]) / parseFloat(parts[1])).toString();
	}
	if (v.indexOf("/") !== -1) return v;
	return v;
}

function parseSubpath(sp) {
	if (!sp) return null;
	if (sp.charAt(0) !== "#") sp = "#" + sp;
	var rest = sp.substring(1);
	return { elementId: decodeURIComponent(rest) };
}

function isDark() {
	return document.body.classList.contains("theme-dark");
}

function themeColors() {
	var s = getComputedStyle(document.body);
	return {
		bg: s.getPropertyValue("--background-primary").trim(),
		bg2: s.getPropertyValue("--background-secondary").trim(),
		text: s.getPropertyValue("--text-normal").trim(),
		border: s.getPropertyValue("--background-modifier-border").trim(),
		accent: s.getPropertyValue("--interactive-accent").trim(),
	};
}

function darkCSS(c, extra) {
	return (
		"body{background:" + c.bg + "!important;color:" + c.text + "!important}" +
		"table,th,td{border-color:" + c.border + "!important}" +
		"input,textarea,select{background:" + c.bg2 + "!important;color:" + c.text + "!important}" +
		"a{color:" + c.accent + "!important}" +
		"pre,code{background:" + c.bg2 + "!important;color:" + c.text + "!important}" +
		(extra || "")
	);
}

function parseMhtml(raw) {
	var m = raw.match(/boundary="?([^"\s;\r\n]+)"?/i);
	if (!m) return raw;
	var parts = raw.split("--" + m[1]);
	for (var i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (!/Content-Type:\s*text\/html/i.test(p)) continue;
			var idx = p.indexOf("\r\n\r\n");
			var skip = 4;
			if (idx === -1) { idx = p.indexOf("\n\n"); skip = 2; }
			if (idx === -1) continue;
			var body = p.substring(idx + skip);
		if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(p)) {
			body = body.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, function(_, h) {
				return String.fromCharCode(parseInt(h, 16));
			});
		} else if (/Content-Transfer-Encoding:\s*base64/i.test(p)) {
			try { body = atob(body.trim()); } catch (e) {}
		}
		return body.trim();
	}
	return raw;
}

function makeBtn(parent, text, title, cls, onClick) {
	var btn = parent.createEl("button", { cls: cls, attr: { title: title }, text: text });
	btn.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); onClick(); });
	return btn;
}

// --- HtmlRenderer ---

function HtmlRenderer(plugin, containerEl, file, isFullView) {
	this.plugin = plugin;
	this.s = plugin.settings;
	this.containerEl = containerEl;
	this.file = file;
	this.isFullView = isFullView;
	this.subpath = "";
	this.iframe = null;
	this.toolbar = null;
	this.zoom = 1;
	this.zoomDisplay = null;
	this.searchBar = null;
	this.searchCount = null;
	this._themeObs = null;
}

HtmlRenderer.prototype.render = function() {
	var self = this;
	_hvpLog("render " + (this.isFullView ? "fullView" : "embed") + " file=" + (this.file ? this.file.name : "?") + " subpath=" + this.subpath);
	this.containerEl.empty();
	this.containerEl.addClass("html-viewer-container");

	if (!this.isFullView) {
		var badge = this.containerEl.createDiv({ cls: "html-viewer-badge", text: "< >" });
		badge.addEventListener("click", function(e) {
			e.stopPropagation();
			var view = self.plugin.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
			if (!view) return;
			var editor = view.editor;
			if (!editor) return;
			var embedEl = self.containerEl.closest(".internal-embed");
			if (!embedEl || !editor.cm) return;
			try {
				var pos = editor.cm.posAtDOM(embedEl);
				var line = editor.cm.state.doc.lineAt(pos).number - 1;
				editor.setCursor({ line: line, ch: 0 });
				editor.focus();
			} catch(e) {}
		});
	}

	if (this.isFullView) {
		this.containerEl.style.height = "100%";
		this.containerEl.style.overflow = "hidden";
	}

	// Build DOM structure first (iframe without src)
	if (!this.isFullView) {
		this._scrollArea = this.containerEl.createDiv({ cls: "html-viewer-scroll" });
		this.iframe = this._scrollArea.createEl("iframe", {
			attr: { width: "100%", sandbox: "allow-scripts allow-same-origin allow-popups allow-forms" }
		});
	} else {
		this.iframe = this.containerEl.createEl("iframe", {
			attr: { width: "100%", sandbox: "allow-scripts allow-same-origin allow-popups allow-forms" }
		});
	}
	this.iframe.style.border = "none";
	this.iframe.style.display = "block";
	if (this.isFullView) this.iframe.style.height = "100%";

	if (!this.isFullView) {
		this._scrollGuard = this._scrollArea.createDiv({ cls: "html-viewer-scroll-guard" });
		this._scrollGuard.addEventListener("click", function() {
			self._scrollGuard.style.display = "none";
			self.iframe.focus();
		});
		this.iframe.addEventListener("blur", function() {
			if (self._scrollGuard) self._scrollGuard.style.display = "";
		});
	}

	if (this.s.showToolbar) this._createToolbar();
	if (!this.isFullView) this._updateSize();

	// Lazy load: embed mode checks visibility before setting up observer
	if (!this.isFullView) {
		var rect = this.containerEl.getBoundingClientRect();
		if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
			self._loadContent();
		} else if (typeof IntersectionObserver !== "undefined") {
			this._lazyObs = new IntersectionObserver(function(entries) {
				if (entries[0].isIntersecting) {
					self._lazyObs.disconnect();
					self._lazyObs = null;
					self._loadContent();
				}
			}, { rootMargin: "200px" });
			this._lazyObs.observe(this.containerEl);
		} else {
			self._loadContent();
		}
	} else {
		self._loadContent();
	}

	if (!this.isFullView && typeof ResizeObserver !== "undefined") {
		var ro = new ResizeObserver(function() { if (self.iframe && self.containerEl) self._updateSize(); });
		ro.observe(self.containerEl);
		self._resizeObs = ro;
	}
};

HtmlRenderer.prototype._loadContent = function() {
	var self = this;
	if (!this.containerEl || !this.iframe) return;
	this._extractedEl = null; // clear stale reference from previous content
	var dark = this.s.syncDarkTheme && isDark();
	var key = _cacheKey(this.file, dark);
	var cached = _getCachedBlob(key);
	if (cached) {
		_hvpLog("loadContent-cached file=" + this.file.name);
		this._blobUrl = cached;
		this._ownBlob = false;
		this._attachIframe();
		return;
	}
	_readFile(this.plugin.app.vault, this.file).then(function(content) {
		if (!self.containerEl || !self.iframe) return;
		if (MHTML_EXT.indexOf(self.file.extension) !== -1) content = parseMhtml(content);
		var doc = new DOMParser().parseFromString(content, "text/html");
		self._patchDoc(doc);
		var blob = new Blob([doc.documentElement.outerHTML], { type: "text/html" });
		var url = URL.createObjectURL(blob);
		_setCachedBlob(key, url);
		self._blobUrl = url;
		self._ownBlob = false; // shared cache owns it
		self._attachIframe();
	});
};

HtmlRenderer.prototype._attachIframe = function() {
	var self = this;
	// Remove previous load handler to prevent accumulation
	if (this._loadHandler) this.iframe.removeEventListener("load", this._loadHandler);
	this._loadHandler = function() {
		_hvpLog("iframe-load file=" + (self.file ? self.file.name : "?"));
		if (self.s.enableZoom && self.isFullView) self._setupZoom();
		self._setupLinks();
		self._setupContextMenu();
		if (self.isFullView) self._setupSearchShortcut();
		if (self.s.syncDarkTheme) self._watchTheme();
		if (self.s.hotRefresh) self._watchFile();
		self._applySubpath();
	};
	this.iframe.addEventListener("load", this._loadHandler);
	// If src hasn't changed (cache hit), load event won't fire — call handler directly
	if (this.iframe.src === this._blobUrl) {
		this._loadHandler();
	} else {
		this.iframe.src = this._blobUrl;
	}
};

HtmlRenderer.prototype._patchDoc = function(doc) {
	var base = doc.querySelector("base");
	if (!base) { base = doc.createElement("base"); doc.head.prepend(base); }
	base.href = this.plugin.app.vault.getResourcePath(this.file);
	if (this.s.syncDarkTheme && isDark()) {
		var style = doc.createElement("style");
		style.textContent = darkCSS(themeColors(), this.s.customDarkCSS);
		doc.head.appendChild(style);
	}
	if (this.s.bgColorEnabled && this.s.bgColor) {
		var style2 = doc.createElement("style");
		style2.textContent = "body{background-color:" + this.s.bgColor + "!important}";
		doc.head.appendChild(style2);
	}
	if (!this.isFullView) {
		var hideScroll = doc.createElement("style");
			hideScroll.textContent = "html{overflow-x:hidden!important;overflow-y:auto!important;scrollbar-width:thin!important;scrollbar-color:#999 transparent!important}html::-webkit-scrollbar{width:6px!important}html::-webkit-scrollbar-track{background:transparent!important}html::-webkit-scrollbar-thumb{background:#999!important;border-radius:3px!important}body{overflow-x:hidden!important;margin:0!important}";
		doc.head.appendChild(hideScroll);
	}
};

HtmlRenderer.prototype._updateSize = function() {
	var w = this.containerEl.getAttr("width") || this.s.defaultWidth;
	var h = this.containerEl.getAttr("height");
	if (h) {
		this.containerEl.setCssProps({ width: parseSize(w), height: parseSize(h) });
		if (this.iframe) {
			this.iframe.style.minHeight = "";
			this.iframe.style.aspectRatio = "";
		}
	} else {
		this.containerEl.setCssProps({ width: parseSize(w) });
		this.containerEl.style.height = "";
			// Extract mode: fit to content, cap at aspect-ratio height
			if (this.iframe && this.subpath && !this.isFullView) {
				try {
					var doc = this.iframe.contentDocument;
					if (doc) {
						var contentH = this._extractedEl ? this._extractedEl.scrollHeight : (doc.documentElement.scrollHeight || doc.body.scrollHeight);
						if (contentH === 0) return; // iframe still loading, skip to avoid 200px flash
						var ratioStr = parseAspectRatio(this.s.aspectRatio);
						var ratioNum = ratioStr.indexOf("/") !== -1 ? parseFloat(ratioStr.split("/")[0]) / parseFloat(ratioStr.split("/")[1]) : parseFloat(ratioStr);
						var defaultH = this.iframe.clientWidth / ratioNum;
						var finalH = Math.min(contentH, defaultH > 0 ? defaultH : 200);
						_hvpLog("updateSize-extract: subpath=" + this.subpath + " contentH=" + contentH + " defaultH=" + defaultH + " finalH=" + finalH);
						this.iframe.style.height = (contentH + 10) + "px";
						this.containerEl.style.height = (finalH + 10) + "px";
						return;
					}
				} catch(e) { _hvpLog("updateSize-extract error: " + e.message); }
			}
		// Default: use aspect-ratio (embed only)
		if (this.iframe && !this.isFullView) {
			this.iframe.style.aspectRatio = parseAspectRatio(this.s.aspectRatio);
			this.iframe.style.minHeight = "200px";
			this.iframe.style.height = "";
			this.containerEl.style.height = "";
		}
	}
};

// --- Subpath ---

HtmlRenderer.prototype._applySubpath = function() {
	var parsed = parseSubpath(this.subpath);
	if (!parsed || !parsed.elementId) return;
	try {
		var doc = this.iframe.contentDocument;
		if (!doc) return;
		var el = doc.getElementById(parsed.elementId);
		if (!el) return;

		// Find the containing section/tab
		var section = el.closest(".section") || (el.classList.contains("section") ? el : null);
		var isSectionTarget = el.classList.contains("section");

		// Activate the section tab
		if (section) {
			var allSections = doc.querySelectorAll(".section");
			for (var s = 0; s < allSections.length; s++) allSections[s].classList.remove("active");
			section.classList.add("active");
			var navBtns = doc.querySelectorAll(".nav button");
			for (var b = 0; b < navBtns.length; b++) navBtns[b].classList.remove("active");
			for (var b = 0; b < navBtns.length; b++) {
				if (navBtns[b].dataset.tab === section.id || navBtns[b].getAttribute("data-tab") === section.id) {
					navBtns[b].classList.add("active");
					break;
				}
			}
		}

		// In embed mode: always extract the target, no scrolling
		if (!this.isFullView) {
			// Hide nav
			var nav = doc.querySelector(".nav");
			if (nav) nav.style.display = "none";

			// Hide all body children that don't contain the target
			for (var c = doc.body.firstChild; c; c = c.nextSibling) {
				if (c.nodeType === 1 && !c.contains(el)) c.style.display = "none";
			}

			// If targeting a card (not the section itself), also hide sibling cards
			if (!isSectionTarget && section) {
				var siblings = section.children;
				for (var i = 0; i < siblings.length; i++) {
					if (siblings[i].nodeType === 1 && !siblings[i].contains(el) && siblings[i] !== el) {
						siblings[i].style.display = "none";
					}
				}
			}

			el.style.display = "block";
			el.style.visibility = "visible";
			el.style.opacity = "1";

				this._extractedEl = el;
				if (!doc.getElementById("hvp-extract-style")) {
					var so = doc.createElement("style"); so.id = "hvp-extract-style"; so.textContent = "html,body{overflow:hidden!important}"; doc.head.appendChild(so);
				}
				this._updateSize();
		} else {
			// Full view: just scroll to element
			var rect = el.getBoundingClientRect();
			var html = doc.documentElement || doc.body;
			html.scrollTop = html.scrollTop + rect.top;
		}
	} catch (e) {}
};

// --- Zoom ---

HtmlRenderer.prototype._setupZoom = function() {
	var self = this;
	this.iframe.addEventListener("wheel", function(e) {
		if (!(e.ctrlKey || e.metaKey)) return;
		e.preventDefault();
		e.stopPropagation();
		if (e.deltaY < 0) self._zoomIn(); else self._zoomOut();
	}, { passive: false });
};

HtmlRenderer.prototype._zoomIn = function() {
	this.zoom = Math.min(this.zoom + this.s.zoomStep, 5); this._applyZoom();
};
HtmlRenderer.prototype._zoomOut = function() {
	this.zoom = Math.max(this.zoom - this.s.zoomStep, 0.2); this._applyZoom();
};
HtmlRenderer.prototype._zoomReset = function() {
	this.zoom = 1; this._applyZoom();
};
HtmlRenderer.prototype._applyZoom = function() {
	this.iframe.style.transform = "scale(" + this.zoom + ")";
	this.iframe.style.transformOrigin = "top left";
	if (this.zoomDisplay) this.zoomDisplay.textContent = Math.round(this.zoom * 100) + "%";
};

HtmlRenderer.prototype._setupLinks = function() {
	try {
		var doc = this.iframe.contentDocument;
		if (!doc) return;
		doc.addEventListener("click", function(e) {
			var a = e.target.closest("a");
			if (!a) return;
			var href = a.getAttribute("href");
			if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
				e.preventDefault();
				window.open(href, "_blank");
			}
		});
	} catch (e) {}
};

HtmlRenderer.prototype._setupContextMenu = function() {
	var self = this;
	var tx = function(key) { return hvpText(self.plugin, key); };
	var SKIP_TAGS = ["marker", "defs", "lineargradient", "radialgradient", "clippath", "mask", "symbol", "use", "svg", "path", "g", "rect", "circle", "line", "polyline", "polygon", "text", "tspan", "canvas"];
	function getLabel(el) {
		var h = el.querySelector("h1, h2, h3, h4, h5, h6");
		if (h && h.textContent.trim()) return h.textContent.trim().substring(0, 30);
		var tag = el.tagName.toLowerCase();
		if ("h1 h2 h3 h4 h5 h6".indexOf(tag) !== -1) return el.textContent.trim().substring(0, 30);
		var raw = el.textContent.trim();
		if (raw) return raw.length > 25 ? raw.substring(0, 25) + "..." : raw;
		return tag;
	}
	function isEditable(el) {
		if (!el || el.nodeType !== 1) return false;
		var tag = el.tagName.toLowerCase();
		return tag === "textarea" || (tag === "input" && /^(text|search|url|tel|email|password|number)?$/i.test(el.type || "text")) || el.isContentEditable;
	}
	function findEditable(el, doc) {
		if (isEditable(el)) return el;
		if (doc.activeElement && isEditable(doc.activeElement)) return doc.activeElement;
		return null;
	}
	function insertText(el, text) {
		if (!el) return false;
		var tag = el.tagName.toLowerCase();
		if (tag === "textarea" || tag === "input") {
			el.focus();
			var start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
			var end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
			if (typeof el.setRangeText === "function") {
				el.setRangeText(text, start, end, "end");
			} else {
				el.value = el.value.substring(0, start) + text + el.value.substring(end);
			}
			el.dispatchEvent(new Event("input", { bubbles: true }));
			el.dispatchEvent(new Event("change", { bubbles: true }));
			return true;
		}
		if (el.isContentEditable) {
			el.focus();
			return doc.execCommand("insertText", false, text);
		}
		return false;
	}
	try {
		var doc = this.iframe.contentDocument;
		if (!doc) return;
		doc.addEventListener("contextmenu", function(e) {
			var el = e.target;
			var targets = [];
			var walkEl = el;
			while (walkEl && walkEl !== doc.body) {
				if (SKIP_TAGS.indexOf(walkEl.tagName.toLowerCase()) !== -1) {
					walkEl = walkEl.parentElement;
					continue;
				}
				if (walkEl.id && walkEl.id !== "nav") {
					targets.push({ el: walkEl, label: getLabel(walkEl), id: walkEl.id });
				}
				walkEl = walkEl.parentElement;
			}
			e.preventDefault();
			var existing = document.querySelector(".html-viewer-ctx-menu");
			if (existing) existing.remove();
			var menu = document.body.createDiv({ cls: "html-viewer-ctx-menu" });
			var rect = self.iframe.getBoundingClientRect();
			var menuX = rect.left + e.clientX * (rect.width / doc.documentElement.clientWidth);
			var menuY = rect.top + e.clientY * (rect.height / doc.documentElement.clientHeight);
			if (menuX + 220 > window.innerWidth) menuX = window.innerWidth - 230;
			if (menuY + (targets.length + 1) * 90 > window.innerHeight) menuY = Math.max(4, window.innerHeight - (targets.length + 1) * 90 - 20);
			menu.style.left = Math.max(4, menuX) + "px";
			menu.style.top = Math.max(4, menuY) + "px";
			var editGroup = menu.createDiv({ cls: "html-viewer-ctx-group" });
			editGroup.createDiv({ cls: "html-viewer-ctx-id", text: tx("rightClickMenu") });
			var editRow = editGroup.createDiv({ cls: "html-viewer-ctx-row" });
			var copyBtn = editRow.createDiv({ cls: "html-viewer-ctx-item", text: tx("copy") });
			var pasteBtn = editRow.createDiv({ cls: "html-viewer-ctx-item", text: tx("paste") });
			copyBtn.addEventListener("click", function() {
				var selection = doc.getSelection ? String(doc.getSelection()) : "";
				var text = selection.trim() ? selection : ((el.innerText || el.textContent || "").trim());
				if (!text) { new obsidian.Notice(tx("nothingToCopy")); menu.remove(); return; }
				navigator.clipboard.writeText(text).then(function() { new obsidian.Notice(tx("copied") + text.substring(0, 80)); });
				menu.remove();
			});
			pasteBtn.addEventListener("click", function() {
				var target = findEditable(el, doc);
				if (!target) { new obsidian.Notice(tx("pasteUnavailable")); menu.remove(); return; }
				navigator.clipboard.readText().then(function(text) {
					if (insertText(target, text)) new obsidian.Notice(tx("pasted"));
				});
				menu.remove();
			});
			for (var i = 0; i < targets.length; i++) {
				(function(entry) {
					var group = menu.createDiv({ cls: "html-viewer-ctx-group" });
					group.addEventListener("mouseenter", function() {
						var el = doc.getElementById(entry.id);
						if (el) el.style.boxShadow = "0 0 0 3px #38bdf8";
					});
					group.addEventListener("mouseleave", function() {
						var el = doc.getElementById(entry.id);
						if (el) el.style.boxShadow = "";
					});
					group.createDiv({ cls: "html-viewer-ctx-id", text: entry.label });
					group.createDiv({ cls: "html-viewer-ctx-sep", text: "#" + entry.id });
					var row = group.createDiv({ cls: "html-viewer-ctx-row" });
					var btn1 = row.createDiv({ cls: "html-viewer-ctx-item", text: tx("contextEmbed") });
					var btn2 = row.createDiv({ cls: "html-viewer-ctx-item", text: tx("contextLink") });
					btn1.addEventListener("click", function() {
						var s = "![[" + self.file.name + "#" + entry.id + "]]";
						navigator.clipboard.writeText(s).then(function() { new obsidian.Notice(tx("copied") + s); });
						menu.remove();
					});
					btn2.addEventListener("click", function() {
						var s = "[[" + self.file.name + "#" + entry.id + "]]";
						navigator.clipboard.writeText(s).then(function() { new obsidian.Notice(tx("copied") + s); });
						menu.remove();
					});
				})(targets[i]);
			}
				setTimeout(function() {
					var closeHandler = function() {
						menu.remove();
						document.removeEventListener("click", closeHandler);
						document.removeEventListener("contextmenu", closeHandler);
						try { doc.removeEventListener("click", closeHandler); } catch(e) {}
					};
					document.addEventListener("click", closeHandler);
					document.addEventListener("contextmenu", closeHandler);
					try { doc.addEventListener("click", closeHandler); } catch(e) {}
				}, 10);
		});
	} catch (e) {}
};
HtmlRenderer.prototype._watchTheme = function() {
	var self = this;
	if (this._themeObs) return;
	var lastDark = isDark();
	this._themeObs = new MutationObserver(function() {
		var nowDark = isDark();
		if (nowDark !== lastDark) { lastDark = nowDark; self.reload(); }
	});
	this._themeObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
};

HtmlRenderer.prototype._watchFile = function() {
	if (this._fileWatchReg) return; // prevent duplicate registration
	var self = this;
	this._fileWatchReg = this.plugin.registerEvent(this.plugin.app.vault.on("modify", function(file) {
		if (file.path === self.file.path) self.reload();
	}));
};

HtmlRenderer.prototype.reload = function() {
	var self = this;
	if (!this.iframe) return;
	// Evict old cache entry so theme/file changes get fresh blob
	var dark = this.s.syncDarkTheme && isDark();
	_evictBlob(_cacheKey(this.file, dark));
	_evictBlob(_cacheKey(this.file, !dark));
	this._loadContent();
};

// --- Toolbar ---

HtmlRenderer.prototype._createToolbar = function() {
	var tx = function(key) { return hvpText(this.plugin, key); }.bind(this);
	this.toolbar = this.containerEl.createDiv({ cls: "html-viewer-toolbar" });
	if (!this.isFullView) {
		makeBtn(this.toolbar, "⛶", tx("fullscreen"), "html-viewer-toolbar-btn", this._toggleFullscreen.bind(this));
		makeBtn(this.toolbar, "↗", tx("openExternally"), "html-viewer-toolbar-btn", this._openExternally.bind(this));
		makeBtn(this.toolbar, "→", tx("locateFile"), "html-viewer-toolbar-btn", this._gotoFile.bind(this));
	} else {
		if (this.s.enableZoom) {
			makeBtn(this.toolbar, "＋", tx("zoomIn"), "html-viewer-toolbar-btn", this._zoomIn.bind(this));
			this.zoomDisplay = this.toolbar.createSpan({ cls: "zoom-display", text: "100%" });
			makeBtn(this.toolbar, "－", tx("zoomOut"), "html-viewer-toolbar-btn", this._zoomOut.bind(this));
			makeBtn(this.toolbar, "↺", tx("resetZoom"), "html-viewer-toolbar-btn", this._zoomReset.bind(this));
			this.toolbar.createSpan({ cls: "html-viewer-toolbar-sep" });
		}
		if (this.s.enableSearch) {
			makeBtn(this.toolbar, "🔍", tx("search"), "html-viewer-toolbar-btn", this._toggleSearch.bind(this));
		}
		makeBtn(this.toolbar, "↻", tx("refresh"), "html-viewer-toolbar-btn", this.reload.bind(this));
		makeBtn(this.toolbar, "↗", tx("openExternally"), "html-viewer-toolbar-btn", this._openExternally.bind(this));
	}
};

// --- Search ---

HtmlRenderer.prototype._setupSearchShortcut = function() {
	var self = this;
	function handler(e) {
		if ((e.ctrlKey || e.metaKey) && e.key === "f") {
			e.preventDefault();
			e.stopPropagation();
			self._toggleSearch();
		}
	}
	this.containerEl.addEventListener("keydown", handler);
	try {
		var doc = this.iframe.contentDocument;
		if (doc) doc.addEventListener("keydown", handler);
	} catch (e) {}
};

HtmlRenderer.prototype._toggleSearch = function() {
	var self = this;
	var tx = function(key) { return hvpText(self.plugin, key); };
	if (this.searchBar) {
		this.searchBar.remove();
		this.searchBar = null;
		this._clearHighlight();
		return;
	}
	this.searchBar = this.containerEl.createDiv({ cls: "html-viewer-search" });
	var input = this.searchBar.createEl("input", { attr: { type: "text", placeholder: tx("searchPlaceholder"), spellcheck: "false" } });
	this.searchCount = this.searchBar.createSpan({ cls: "search-count", text: "" });
	makeBtn(this.searchBar, "▲", tx("previous"), "html-viewer-toolbar-btn", function() { self._gotoMatch(-1, input.value); });
	makeBtn(this.searchBar, "▼", tx("next"), "html-viewer-toolbar-btn", function() { self._gotoMatch(1, input.value); });
	makeBtn(this.searchBar, "✕", tx("close"), "html-viewer-toolbar-btn", function() { self._toggleSearch(); });
	input.addEventListener("keydown", function(e) {
		if (e.key === "Enter") { e.preventDefault(); self._gotoMatch(e.shiftKey ? -1 : 1, input.value); }
		if (e.key === "Escape") self._toggleSearch();
	});
	input.addEventListener("input", function() { self._doSearch(input.value); });
	input.focus();
};

HtmlRenderer.prototype._collectMatches = function(q) {
	var results = [];
	try {
		var doc = this.iframe.contentDocument;
		if (!doc || !q) return results;
		var lower = q.toLowerCase();
		var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
		while (walker.nextNode()) {
			var node = walker.currentNode;
			var text = node.textContent.toLowerCase();
			var idx = 0;
			while (true) {
				var pos = text.indexOf(lower, idx);
				if (pos === -1) break;
				var range = doc.createRange();
				range.setStart(node, pos);
				range.setEnd(node, pos + q.length);
				results.push(range);
				idx = pos + 1;
			}
		}
	} catch (e) {}
	return results;
};

HtmlRenderer.prototype._doSearch = function(q) {
	this._clearHighlight();
	this._matchRanges = [];
	this._matchIdx = -1;
	if (!q) { if (this.searchCount) this.searchCount.textContent = ""; return; }
	this._matchRanges = this._collectMatches(q);
	if (this.searchCount) this.searchCount.textContent = this._matchRanges.length > 0 ? "0/" + this._matchRanges.length : hvpText(this.plugin, "noResults");
	if (this._matchRanges.length > 0) this._gotoMatch(1, q);
};

HtmlRenderer.prototype._revealTabForNode = function(node) {
	try {
		var doc = this.iframe.contentDocument;
		var win = this.iframe.contentWindow;
		if (!doc || !win) return false;
		var el = (node.nodeType === 1) ? node : node.parentElement;
		// Walk up to find a hidden ancestor
		while (el && el !== doc.body) {
			var cs = win.getComputedStyle(el);
			if (cs.display === "none" || cs.visibility === "hidden") {
				// Found hidden container - try to activate its tab
				var panel = el;
				// Try common tab panel patterns
				var id = panel.id;
				if (id) {
					var trigger = doc.querySelector('[href="#' + id + '"], [data-target="#' + id + '"], [aria-controls="' + id + '"]');
					if (trigger) { trigger.click(); return true; }
				}
				// Try sibling buttons/links before the panel
				var parent = panel.parentElement;
				if (parent) {
					var children = parent.children;
					for (var j = 0; j < children.length; j++) {
						var sib = children[j];
						if (sib === panel) break;
						if (sib.tagName === "BUTTON" || sib.tagName === "A" || sib.getAttribute("role") === "tab") {
							sib.click();
							return true;
						}
					}
				}
				// Try nav/tabs container as previous sibling of parent
				var prev = parent.previousElementSibling;
				while (prev) {
					var btns = prev.querySelectorAll("button, a, [role=\"tab\"]");
					if (btns.length > 0) {
						// Find the button whose target matches the panel
						for (var k = 0; k < btns.length; k++) {
							var b = btns[k];
							var target = b.getAttribute("data-target") || b.getAttribute("href") || b.getAttribute("aria-controls");
							if (target && (target === "#" + id || target === id)) {
								b.click();
								return true;
							}
						}
						// Fallback: click all buttons to find the right one
						for (var m = 0; m < btns.length; m++) {
							var prevActive = btns[m].classList.contains("active");
							btns[m].click();
							var nowCs = win.getComputedStyle(panel);
							if (nowCs.display !== "none") return true;
							if (!prevActive) btns[m].classList.remove("active");
						}
					}
					prev = prev.previousElementSibling;
				}
				return false;
			}
			el = el.parentElement;
		}
	} catch (e) {}
	return false;
};

HtmlRenderer.prototype._gotoMatch = function(dir, q) {
	if (!this._matchRanges || this._matchRanges.length === 0) {
		if (q) this._doSearch(q);
		if (!this._matchRanges || this._matchRanges.length === 0) return;
	}
	var len = this._matchRanges.length;
	this._matchIdx += dir;
	if (this._matchIdx >= len) this._matchIdx = 0;
	if (this._matchIdx < 0) this._matchIdx = len - 1;
	var self = this;
	try {
		var doc = this.iframe.contentDocument;
		var win = this.iframe.contentWindow;
		if (!doc || !win) return;
		var range = this._matchRanges[this._matchIdx].cloneRange();
		var node = range.startContainer;
		// Try to reveal the tab containing this match
		var revealed = this._revealTabForNode(node);
		var doSelect = function() {
			try {
				var sel = win.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				var targetEl = (node.nodeType === 1) ? node : node.parentElement;
				if (targetEl) targetEl.scrollIntoView({ block: "center", behavior: "smooth" });
			} catch (e) {}
			if (self.searchCount) self.searchCount.textContent = (self._matchIdx + 1) + "/" + self._matchRanges.length;
		};
		if (revealed) {
			setTimeout(doSelect, 200);
		} else {
			doSelect();
		}
	} catch (e) {
		if (this.searchCount) this.searchCount.textContent = (this._matchIdx + 1) + "/" + this._matchRanges.length;
	}
};

HtmlRenderer.prototype._clearHighlight = function() {
	try {
		var w = this.iframe.contentWindow;
		if (w) w.getSelection().removeAllRanges();
	} catch (e) {}
	this._matchRanges = [];
	this._matchIdx = -1;
};

// --- Fullscreen / External / Goto ---

HtmlRenderer.prototype._toggleFullscreen = function() {
		var self = this;
		if (document.fullscreenElement) { document.exitFullscreen(); return; }
		this.containerEl.requestFullscreen().catch(function() {});
		if (!this._fullscreenHandler) {
			this._fullscreenHandler = function() { self._onFullscreenChange(); };
			document.addEventListener("fullscreenchange", this._fullscreenHandler);
		}
	};

	HtmlRenderer.prototype._onFullscreenChange = function() {
		var isFS = !!document.fullscreenElement && document.fullscreenElement === this.containerEl;
		_hvpLog("fullscreen-change isFS=" + isFS);
		if (!isFS) {
			this.containerEl.style.background = "";
			if (!this.isFullView && this.iframe) {
				this.iframe.style.maxHeight = "";
				this.containerEl.style.height = "";
				this._updateSize();
			}
			return;
		}
		if (!this.isFullView && this.iframe) {
			try {
				var doc = this.iframe.contentDocument;
				if (doc) {
					var contentH = doc.documentElement.scrollHeight || doc.body.scrollHeight;
					var vh = window.innerHeight;
					// Read iframe body background and apply to container
					var bodyBg = doc.defaultView.getComputedStyle(doc.body).backgroundColor;
					if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)") {
						this.containerEl.style.background = bodyBg;
					}
					// Clear embed sizing, set to content height (capped at viewport)
					this.iframe.style.aspectRatio = "";
					this.iframe.style.minHeight = "";
					this.iframe.style.height = Math.min(contentH, vh) + "px";
					this.iframe.style.maxHeight = vh + "px";
					this.containerEl.style.height = "";
					_hvpLog("fullscreen: contentH=" + contentH + " vh=" + vh + " bg=" + bodyBg);
				}
			} catch(e) { _hvpLog("fullscreen error: " + e.message); }
		}
	};

HtmlRenderer.prototype._openExternally = function() {
	var basePath = this.plugin.app.vault.adapter.basePath;
	if (!basePath) return;
	try {
		var electron = require("electron");
		electron.shell.openPath(path.join(basePath, this.file.path));
	} catch (e) {
		new obsidian.Notice(hvpText(this.plugin, "unableOpenExternally"));
	}
};

HtmlRenderer.prototype._gotoFile = function() {
	this.plugin.app.workspace.openLinkText(this.file.path, "", false);
};

HtmlRenderer.prototype._toggleIdPicker = function() {
	if (this._idPicker) { this._closeIdPicker(); return; }
	try {
		var doc = this.iframe.contentDocument;
		if (!doc) return;
		var self = this;
		var SKIP_IDS = ["nav"];
		var SKIP_TAGS = ["marker", "defs", "lineargradient", "radialgradient", "clippath", "mask", "symbol", "use"];
		var allIds = doc.querySelectorAll("[id]");
		var items = [];
		for (var i = 0; i < allIds.length; i++) {
			var el = allIds[i];
			var id = el.id;
			if (!id || SKIP_IDS.indexOf(id) !== -1) continue;
			var tag = el.tagName.toLowerCase();
			if (SKIP_TAGS.indexOf(tag) !== -1) continue;
			var typeTag = "";
			if (el.classList && el.classList.contains("section")) typeTag = "section";
			else if (el.classList && el.classList.contains("card")) typeTag = "card";
			var label = "";
			var h = el.querySelector("h1, h2, h3, h4, h5, h6");
			if (h && h.textContent.trim()) {
				label = h.textContent.trim();
			} else if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
				label = el.textContent.trim();
			} else {
				var first = el.querySelector("b, strong, span:first-child, p:first-child");
				if (first && first.textContent.trim()) label = first.textContent.trim();
			}
			if (!label) {
				var raw = el.textContent.trim();
				if (raw) label = raw.length > 30 ? raw.substring(0, 30) + "..." : raw;
			}
			if (!label) label = id;
			items.push({ id: id, label: label.substring(0, 40), typeTag: typeTag });
		}
		var tx = function(key) { return hvpText(self.plugin, key); };
		if (items.length === 0) { new obsidian.Notice(tx("noUsableIds")); return; }
		var picker = this.containerEl.createDiv({ cls: "html-viewer-id-picker" });
		picker.createEl("div", { cls: "html-viewer-id-picker-title", text: tx("copyEmbedSyntax") });
		var closeBtn = picker.createEl("button", { cls: "html-viewer-id-picker-close", text: "✕" });
		closeBtn.addEventListener("click", function() { self._closeIdPicker(); });
		var list = picker.createDiv({ cls: "html-viewer-id-picker-list" });
		for (var j = 0; j < items.length; j++) {
			var entry = items[j];
			var item = list.createDiv({ cls: "html-viewer-id-picker-item" });
			if (entry.typeTag) item.createEl("span", { cls: "html-viewer-id-picker-tag", text: entry.typeTag });
			item.createEl("span", { cls: "html-viewer-id-picker-label", text: entry.label });
			item.createEl("span", { cls: "html-viewer-id-picker-id", text: "#" + entry.id });
				item.addEventListener("mouseenter", (function(idVal) {
					return function() {
						var el = doc.getElementById(idVal);
						if (el) {
							el.style.boxShadow = "0 0 0 3px #38bdf8";
							el.scrollIntoView({ behavior: "smooth", block: "center" });
						}
					};
				})(entry.id));
				item.addEventListener("mouseleave", (function(idVal) {
					return function() {
						var el = doc.getElementById(idVal);
						if (el) el.style.boxShadow = "";
					};
				})(entry.id));
				item.addEventListener("click", (function(idVal) {
					return function() {
						var el = doc.getElementById(idVal);
						if (el) el.style.boxShadow = "";
						var syntax = "![[" + self.file.name + "#" + idVal + "]]";
						navigator.clipboard.writeText(syntax).then(function() {
							new obsidian.Notice(tx("copied") + syntax);
						});
						self._closeIdPicker();
					};
				})(entry.id));
		}
		this._idPicker = picker;
	} catch (e) {}
};

HtmlRenderer.prototype._closeIdPicker = function() {
	if (this._idPicker) { this._idPicker.remove(); this._idPicker = null; }
};

HtmlRenderer.prototype.destroy = function() {
	_hvpLog("destroy file=" + (this.file ? this.file.name : "?"));
	// Blob URLs are shared via cache, not revoked per-instance
	this._blobUrl = null;
	if (this._lazyObs) { this._lazyObs.disconnect(); this._lazyObs = null; }
	if (this._resizeObs) { this._resizeObs.disconnect(); this._resizeObs = null; }
	if (this._scrollGuard) { this._scrollGuard.remove(); this._scrollGuard = null; }
	if (this._themeObs) { this._themeObs.disconnect(); this._themeObs = null; }
	if (this._fullscreenHandler) { document.removeEventListener("fullscreenchange", this._fullscreenHandler); this._fullscreenHandler = null; }
	if (this._idPicker) { this._idPicker.remove(); this._idPicker = null; }
	if (this.searchBar) { this.searchBar.remove(); this.searchBar = null; }
};

// --- HtmlEmbedComponent ---

var HtmlEmbedComponent = (function(_super) {
	function HtmlEmbedComponent(plugin, containerEl, file, subpath) {
		_super.call(this);
		this.plugin = plugin;
		this.containerEl = containerEl;
		this.file = file;
		this.subpath = subpath || "";
		this.renderer = null;
		this._eid = ++_hvpId;
		_hvpLog("Embed#" + this._eid + " ctor file=" + (file ? file.name : "?") + " subpath=" + subpath);
	}
	HtmlEmbedComponent.prototype = Object.create(_super.prototype);
	HtmlEmbedComponent.prototype.constructor = HtmlEmbedComponent;

	HtmlEmbedComponent.prototype._render = function() {
		if (this.renderer) { this.renderer.destroy(); this.renderer = null; }
		this.renderer = new HtmlRenderer(this.plugin, this.containerEl, this.file, false);
		this.renderer.subpath = this.subpath;
		this.renderer.render();
	};

	HtmlEmbedComponent.prototype.onload = function() {
		_super.prototype.onload.call(this);
		_hvpLog("Embed#" + this._eid + " onload");
		var self = this;
		var obs = new MutationObserver(function() { if (self.renderer) self.renderer._updateSize(); });
		obs.observe(this.containerEl, { attributeFilter: ["width", "height"], attributes: true });
		this.register(function() { obs.disconnect(); });
	};

	HtmlEmbedComponent.prototype.loadFile = function(file) {
		_hvpLog("Embed#" + this._eid + " loadFile file=" + (file ? file.name : "null"));
		if (file) this.file = file;
		this._render();
	};

	HtmlEmbedComponent.prototype.onunload = function() {
		_hvpLog("Embed#" + this._eid + " onunload");
		_super.prototype.onunload.call(this);
		if (this.renderer) { this.renderer.destroy(); this.renderer = null; }
	};

	HtmlEmbedComponent.prototype.setSubpath = function(sp) {
		_hvpLog("Embed#" + this._eid + " setSubpath sp=" + sp);
		this.subpath = sp || "";
		if (this.renderer) {
			this.renderer.subpath = this.subpath;
			this.renderer._applySubpath();
		}
	};

	return HtmlEmbedComponent;
})(obsidian.Component);

// --- HtmlFileView ---

var HtmlFileView = (function(_super) {
	function HtmlFileView(leaf, plugin) {
		_super.call(this, leaf);
		this.plugin = plugin;
		this.renderer = null;
	}
	HtmlFileView.prototype = Object.create(_super.prototype);
	HtmlFileView.prototype.constructor = HtmlFileView;

	HtmlFileView.prototype.getViewType = function() { return VIEW_TYPE; };
	HtmlFileView.prototype.getDisplayText = function() { return this.file ? this.file.name : "HTML"; };
	HtmlFileView.prototype.getIcon = function() { return "globe"; };

	HtmlFileView.prototype.onLoadFile = function(file) {
		var self = this;
		return _super.prototype.onLoadFile.call(this, file).then(function() {
			self.contentEl.empty();
			self.contentEl.setAttribute("height", "100%");
			self.renderer = new HtmlRenderer(self.plugin, self.contentEl, file, true);
			self.renderer.render();
		});
	};

	HtmlFileView.prototype.onUnloadFile = function(file) {
		if (this.renderer) { this.renderer.destroy(); this.renderer = null; }
		return _super.prototype.onUnloadFile.call(this, file);
	};

	return HtmlFileView;
})(obsidian.FileView);

// --- Settings Tab (with Guide + Search) ---

var HtmlViewerSettingsTab = (function(_super) {
	function HtmlViewerSettingsTab(app, plugin) {
		_super.call(this, app, plugin);
		this.plugin = plugin;
		this._activeTab = "settings";
	}
	HtmlViewerSettingsTab.prototype = Object.create(_super.prototype);
	HtmlViewerSettingsTab.prototype.constructor = HtmlViewerSettingsTab;

	HtmlViewerSettingsTab.prototype.display = function() {
		var containerEl = this.containerEl;
		containerEl.empty();
		var s = this.plugin.settings;
		var plugin = this.plugin;
		var self = this;

		containerEl.createEl("h2", { text: "HTML Viewer Plus" });
		var tx = function(key) { return hvpText(plugin, key); };

		// Tab bar
		var tabBar = containerEl.createDiv({ cls: "html-viewer-tabs" });
		var tabSettings = tabBar.createDiv({ cls: "html-viewer-tab" + (this._activeTab === "settings" ? " active" : ""), text: tx("settings") });
		var tabGuide = tabBar.createDiv({ cls: "html-viewer-tab" + (this._activeTab === "guide" ? " active" : ""), text: tx("guide") });

		var settingsContent = containerEl.createDiv({ cls: "html-viewer-tab-content" });
		var guideContent = containerEl.createDiv({ cls: "html-viewer-tab-content" });

		function showSettings() {
			self._activeTab = "settings";
			tabSettings.className = "html-viewer-tab active";
			tabGuide.className = "html-viewer-tab";
			settingsContent.style.display = "";
			guideContent.style.display = "none";
		}
		function showGuide() {
			self._activeTab = "guide";
			tabSettings.className = "html-viewer-tab";
			tabGuide.className = "html-viewer-tab active";
			settingsContent.style.display = "none";
			guideContent.style.display = "";
		}

		tabSettings.addEventListener("click", showSettings);
		tabGuide.addEventListener("click", showGuide);

		if (this._activeTab === "guide") showGuide(); else showSettings();

		this._buildSettings(settingsContent, s, plugin);
		this._buildGuide(guideContent, tabBar, showSettings, showGuide);
	};

	HtmlViewerSettingsTab.prototype._buildSettings = function(containerEl, s, plugin) {
		var self = this;
		var tx = function(key) { return hvpText(plugin, key); };

		containerEl.createEl("h3", { text: tx("interface") });

		new obsidian.Setting(containerEl)
			.setName(tx("language"))
			.setDesc(tx("languageDesc"))
			.addToggle(function(t) {
				t.setValue((s.language || "en") === "en");
				t.onChange(function(v) {
					s.language = v ? "en" : "zh";
					plugin.saveSettings();
					self.display();
				});
			});

		containerEl.createEl("h3", { text: tx("embedSize") });

		new obsidian.Setting(containerEl)
			.setName(tx("defaultWidth"))
			.setDesc(tx("defaultWidthDesc"))
			.addText(function(t) { t.setValue(s.defaultWidth).onChange(function(v) { s.defaultWidth = v; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("aspectRatio"))
			.setDesc(tx("aspectRatioDesc"))
			.addText(function(t) { t.setValue(s.aspectRatio).onChange(function(v) { s.aspectRatio = v; plugin.saveSettings(); }); });

		containerEl.createEl("h3", { text: tx("toolbar") });

		new obsidian.Setting(containerEl)
			.setName(tx("showToolbar"))
			.setDesc(tx("showToolbarDesc"))
			.addToggle(function(t) { t.setValue(s.showToolbar).onChange(function(v) { s.showToolbar = v; plugin.saveSettings(); }); });

		containerEl.createEl("h3", { text: tx("directOpenMode") });

		new obsidian.Setting(containerEl)
			.setName(tx("enableZoom"))
			.setDesc(tx("enableZoomDesc"))
			.addToggle(function(t) { t.setValue(s.enableZoom).onChange(function(v) { s.enableZoom = v; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("zoomStep"))
			.setDesc(tx("zoomStepDesc"))
			.addText(function(t) { t.setValue(String(s.zoomStep)).onChange(function(v) { s.zoomStep = parseFloat(v) || 0.1; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("enableSearch"))
			.setDesc(tx("enableSearchDesc"))
			.addToggle(function(t) { t.setValue(s.enableSearch).onChange(function(v) { s.enableSearch = v; plugin.saveSettings(); }); });

		containerEl.createEl("h3", { text: tx("theme") });

		new obsidian.Setting(containerEl)
			.setName(tx("syncDarkTheme"))
			.setDesc(tx("syncDarkThemeDesc"))
			.addToggle(function(t) { t.setValue(s.syncDarkTheme).onChange(function(v) { s.syncDarkTheme = v; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("customDarkCSS"))
			.setDesc(tx("customDarkCSSDesc"))
			.addTextArea(function(t) { t.setPlaceholder("body { filter: invert(0.05); }").setValue(s.customDarkCSS).onChange(function(v) { s.customDarkCSS = v; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("customBg"))
			.setDesc(tx("customBgDesc"))
			.addColorPicker(function(cp) { cp.setValue(s.bgColor).onChange(function(v) { s.bgColor = v; plugin.saveSettings(); }); })
			.addToggle(function(t) { t.setValue(s.bgColorEnabled).onChange(function(v) { s.bgColorEnabled = v; plugin.saveSettings(); }); });

		containerEl.createEl("h3", { text: tx("advanced") });

		new obsidian.Setting(containerEl)
			.setName(tx("hotRefresh"))
			.setDesc(tx("hotRefreshDesc"))
			.addToggle(function(t) { t.setValue(s.hotRefresh).onChange(function(v) { s.hotRefresh = v; plugin.saveSettings(); }); });

		new obsidian.Setting(containerEl)
			.setName(tx("mhtmlSupport"))
			.setDesc(tx("mhtmlSupportDesc"))
			.addToggle(function(t) { t.setValue(s.mhtmlSupport).onChange(function(v) { s.mhtmlSupport = v; plugin.saveSettings(); }); });
	};

	HtmlViewerSettingsTab.prototype._buildGuide = function(containerEl, tabBar, showSettings, showGuide) {
		var tx = function(key) { return hvpText(this.plugin, key); }.bind(this);
		var guide = containerEl.createDiv({ cls: "html-viewer-guide" });

		// Guide search
		var searchWrap = guide.createDiv({ cls: "html-viewer-guide-search" });
		var searchInput = searchWrap.createEl("input", { attr: { type: "text", placeholder: tx("searchGuidePlaceholder"), spellcheck: "false" } });
		var searchResult = searchWrap.createSpan({ cls: "html-viewer-guide-search-result" });

		// Sections data for search
		var sections = [];

		function addSection(title, buildContent) {
			var h4 = guide.createEl("h4", { text: title });
			var wrap = guide.createDiv({ cls: "html-viewer-guide-section" });
			buildContent(wrap);
			sections.push({ title: title, h4: h4, wrap: wrap });
		}

			addSection(tx("embedSyntax"), function(wrap) {
				var list = wrap.createEl("ul");
					var items = [
						{ code: "![[file.html]]", desc: tx("embedDefaultDesc") },
						{ code: "![[file.html|400]]", desc: tx("embedWidthDesc") },
						{ code: "![[file.html|400x300]]", desc: tx("embedSizeDesc") },
							{ code: "![[file.html#elementId]]", desc: tx("embedElementDesc") },
					];
				for (var i = 0; i < items.length; i++) {
					var li = list.createEl("li");
					li.createEl("code", { text: items[i].code });
					li.createSpan({ text: " — " + items[i].desc });
				}
				list.createEl("li", { text: tx("embedTip") });
			});

		addSection(tx("directOpen"), function(wrap) {
			wrap.createEl("p", { text: tx("directOpenDesc") });
		});

			addSection(tx("embedModeToolbar"), function(wrap) {
				var list = wrap.createEl("ul");
				list.createEl("li", { text: tx("embedFullscreenDesc") });
				list.createEl("li", { text: tx("embedExternalDesc") });
				list.createEl("li", { text: tx("embedLocateDesc") });
				list.createEl("li", { text: tx("embedToolbarDesc") });
			});
		addSection(tx("directToolbar"), function(wrap) {
			var list = wrap.createEl("ul");
			list.createEl("li", { text: tx("directZoomDesc") });
			list.createEl("li", { text: tx("directResetDesc") });
			list.createEl("li", { text: tx("directSearchDesc") });
			list.createEl("li", { text: tx("directRefreshDesc") });
			list.createEl("li", { text: tx("directExternalDesc") });
		});

			addSection(tx("rightClickMenu"), function(wrap) {
				var list = wrap.createEl("ul");
				list.createEl("li", { text: tx("rightClickOpenDesc") });
				list.createEl("li", { text: tx("rightClickAncestorsDesc") });
				list.createEl("li", { text: tx("rightClickActionsDesc") });
				list.createEl("li", { text: tx("rightClickHoverDesc") });
				list.createEl("li", { text: tx("rightClickCloseDesc") });
			});

			addSection(tx("embedBadge"), function(wrap) {
				var list = wrap.createEl("ul");
				list.createEl("li", { text: tx("embedBadgeDesc") });
				list.createEl("li", { text: tx("scrollGuardDesc") });
			});

		addSection(tx("searchTabs"), function(wrap) {
			wrap.createEl("p", { text: tx("searchTabsDesc") });
		});

		addSection(tx("darkThemeSync"), function(wrap) {
			wrap.createEl("p", { text: tx("darkThemeSyncDesc") });
		});

		addSection(tx("hotRefresh"), function(wrap) {
			wrap.createEl("p", { text: tx("hotRefreshGuideDesc") });
		});

		addSection(tx("mhtmlSupport"), function(wrap) {
			wrap.createEl("p", { text: tx("mhtmlGuideDesc") });
		});

		addSection(tx("supportedFormats"), function(wrap) {
			var list = wrap.createEl("ul");
			list.createEl("li", { text: "HTML: .html, .htm, .shtml, .xht, .xhtml" });
			list.createEl("li", { text: tx("mhtmlRequires") });
		});

		// Search logic
		searchInput.addEventListener("input", function() {
			var q = searchInput.value.trim().toLowerCase();
			if (!q) {
				searchResult.textContent = "";
				for (var i = 0; i < sections.length; i++) {
					sections[i].h4.style.background = "";
					sections[i].wrap.style.display = "";
				}
				return;
			}
			var matchCount = 0;
			var firstMatch = null;
			// If currently on settings tab, switch to guide
			// (searchInput is in guide, so user must be in guide to type)
			for (var j = 0; j < sections.length; j++) {
				var sec = sections[j];
				var text = (sec.title + " " + sec.wrap.textContent).toLowerCase();
				if (text.indexOf(q) !== -1) {
					sec.h4.style.background = "var(--text-selection)";
					sec.wrap.style.display = "";
					matchCount++;
					if (!firstMatch) firstMatch = sec;
				} else {
					sec.h4.style.background = "";
					sec.wrap.style.display = "none";
				}
			}
			searchResult.textContent = matchCount > 0 ? matchCount + tx("matches") : tx("noMatches");
			if (firstMatch) firstMatch.h4.scrollIntoView({ behavior: "smooth", block: "nearest" });
		});

		searchInput.addEventListener("keydown", function(e) {
			if (e.key === "Escape") {
				searchInput.value = "";
				searchInput.dispatchEvent(new Event("input"));
				searchInput.blur();
			}
		});
	};

	return HtmlViewerSettingsTab;
})(obsidian.PluginSettingTab);

// --- Main Plugin ---

function HtmlViewerPlusPlugin(app, pluginId) {
	obsidian.Plugin.call(this, app, pluginId);
}
HtmlViewerPlusPlugin.prototype = Object.create(obsidian.Plugin.prototype);
HtmlViewerPlusPlugin.prototype.constructor = HtmlViewerPlusPlugin;

HtmlViewerPlusPlugin.prototype.onload = function() {
	var self = this;
	_hvpLogPath = path.join(self.app.vault.adapter.basePath, ".obsidian", "plugins", "html-viewer-plus", "debug.log");
	try { require("fs").writeFileSync(_hvpLogPath, "=== HVP Debug Log " + new Date().toISOString() + " ===\n"); } catch(e) { console.log("[HVP] cannot write log: " + e.message); }
	return this.loadSettings().then(function() {
		var exts = HTML_EXT.slice();
		if (self.settings.mhtmlSupport) exts = exts.concat(MHTML_EXT);

		self.app.embedRegistry.registerExtensions(exts, function(embed, file, subpath) {
			var el = (embed && embed.containerEl) ? embed.containerEl : embed;
			return new HtmlEmbedComponent(self, el, file, subpath || "");
		});
		self.register(function() { self.app.embedRegistry.unregisterExtensions(exts); });

		self.app.viewRegistry.registerExtensions(exts, VIEW_TYPE);
		self.registerView(VIEW_TYPE, function(leaf) { return new HtmlFileView(leaf, self); });
		self.register(function() { self.app.viewRegistry.unregisterExtensions(exts); });

		self.addSettingTab(new HtmlViewerSettingsTab(self.app, self));

		if (self.app.plugins.getPlugin && self.app.plugins.getPlugin("embed-html")) {
			new obsidian.Notice(hvpText(self, "disableEmbedHtml"));
		}

		console.log("HTML Viewer Plus loaded");
	});
};

HtmlViewerPlusPlugin.prototype.onunload = function() {
	_clearAllBlobs();
	console.log("HTML Viewer Plus unloaded");
};

HtmlViewerPlusPlugin.prototype.loadSettings = function() {
	var self = this;
	return this.loadData().then(function(data) {
		self.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
	});
};

HtmlViewerPlusPlugin.prototype.saveSettings = function() {
	return this.saveData(this.settings);
};

module.exports = HtmlViewerPlusPlugin;
