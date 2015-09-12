// ==UserScript==
// @name         Advanced Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace    http://www.xuldev.org/
// @description  轻量级鼠标手势脚本（可自定义手势代码）
// @include      main
// @author       Raqbgxue + Gomita
// @version      10.1.17 (folk from original 9.5.18)
// @homepage     http://www.xuldev.org/misc/ucjs.php
// @homepage     http://d.hatena.ne.jp/raqbgxue/20090624/1245848856
// @note         Ctrl+(right-click-up) => Reset Gesture
//==/UserScript==

var ucjsMouseGestures = {
	// options
	enableWheelGestures : true,
	enableRockerGestures : true,

	_lastX : 0,
	_lastY : 0,
	_directionChain : '',
	_isMouseDownL : false,
	_isMouseDownR : false,
	_hideFireContext : false, //for windows
	_shouldFireContext : false, //for linux
	GESTURES : {
		/*'L':{name:'后退/上一页',cmd:function(){var nav = gBrowser.webNavigation;
		if (nav.canGoBack) nav.goBack();  else nextPage.next();}},
		'R':{name:'前进/下一页',cmd:function(){var nav = gBrowser.webNavigation;
		if (nav.canGoForward) nav.goForward(); else nextPage.next(true);}},*/
		'L' : {
			name : '后退',
			cmd : function () {
				var nav = gBrowser.webNavigation;
				if (nav.canGoBack)
					nav.goBack();
			}
		},
		'R' : {
			name : '前进',
			cmd : function () {
				var nav = gBrowser.webNavigation;
				if (nav.canGoForward)
					nav.goForward();
			}
		},
		'U' : {
			name : '上一页',
			cmd : function () {
				nextPage.next();
			}
		},
		'D' : {
			name : '下一页',
			cmd : function () {
				nextPage.next(true);
			}
		},
		'LU' : {
			name : '滚动到页面顶部',
			cmd : function () {
				goDoCommand("cmd_scrollTop");
			}
		},
		'LD' : {
			name : '滚动到页面底部',
			cmd : function () {
				goDoCommand("cmd_scrollBottom");
			}
		},
		'DU' : {
			name : '刷新',
			cmd : function () {
				document.getElementById("Browser:Reload").doCommand();
			}
		},
		'DUD' : {
			name : '强制刷新',
			cmd : function () {
				document.getElementById("Browser:ReloadSkipCache").doCommand();
			}
		},
		'ULU' : {
			name : '到上一层',
			cmd : function () {
				var uri = gBrowser.currentURI;
				if (uri.path == "/")
					return;
				var pathList = uri.path.split("/");
				if (!pathList.pop())
					pathList.pop();
				loadURI(uri.prePath + pathList.join("/") + "/");
			}
		},
		'DUDU' : {
			name : '刷新所有页面',
			cmd : function () {
				gBrowser.reloadAllTabs(gBrowser.mCurrentTab);
			}
		},
		'DLDL' : {
			name : '关闭其他标签页',
			cmd : function () {
				gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);
			}
		},
		'URD' : {
			name : '全屏模式',
			cmd : function () {
				document.getElementById("View:FullScreen").doCommand();
			}
		},
		'DR' : {
			name : '关闭当前标签页',
			cmd : function () {
				gBrowser.removeCurrentTab();
			}
		},
		'DL' : {
			name : '撤销关闭标签页',
			cmd : function () {
				try {
					document.getElementById('History:UndoCloseTab').doCommand();
				} catch (ex) {
					if ('undoRemoveTab' in gBrowser)
						gBrowser.undoRemoveTab();
					else
						throw "Session Restore feature is disabled."
				}
			}
		},
		'UL' : {
			name : '上个标签页',
			cmd : function () {
				gBrowser.mTabContainer.advanceSelectedTab(-1, true);
			}
		},
		'UR' : {
			name : '下个标签页',
			cmd : function () {
				gBrowser.mTabContainer.advanceSelectedTab(+1, true);
			}
		},
		'DLU' : {
			name : '重启浏览器',
			cmd : function () {
				Services.appinfo.invalidateCachesOnRestart() || Application.restart();
			}
		},
		'LR' : {
			name : '在当前域内搜索( Google )',
			cmd : function () {
				var _document = document.commandDispatcher.focusedWindow.document;
				var p = prompt('请输入想要在当前域内搜索的关键字(' + _document.location.hostname + '):', '');
				if (p)
					_document.location.href = 'http://www.google.com/search?q=site:' + _document.location.href.split('/')[2] + ' ' + encodeURIComponent(p);
			}
		},
		'UD' : {
			name : '阅读适应',
			cmd : function () {content.window.wrappedJSObject.X_readability();}
		},

		//'RU':{name:'记录当前网页位置',cmd:function( ){Marker.mark();}},
		//'RD':{name:'移动到记录的网页位置',cmd:function( ){Marker.go();}},
		//'W+':{name:'弹出网页位置标记列表',cmd:function( ){Marker.list();}},
		'W-' : {
			name : '页面放大',
			cmd : function () {
				FullZoom.enlarge();
			}
		},
		'W+' : {
			name : '页面缩小',
			cmd : function () {
				FullZoom.reduce();
			}
		},
		'L<R' : {
			name : '页面重置',
			cmd : function () {
				FullZoom.reset();
			}
		},
		/*=== Browser UI ===*/
		'RL' : {
			name : '显示/隐藏侧边',
			cmd : function () {
				toggleSidebar();
			}
		},
		'RD' : {
			name : 'WordHighlightToolbar高亮关键字',
			cmd : function () {
				var p = prompt('\u8BF7\u8F93\u5165\u60F3\u8981\u9AD8\u4EAE\u7684\u5173\u952E\u5B57( \u5F53\u524D\u7F51\u9875 ):', '');
				if (p)
					window.gWHT.addWord(p);
			}
		},
		'RU' : {
			name : '关闭WordHighlightToolbar',
			cmd : function () {
				window.gWHT.destroyToolbar();
			}
		},

		'DLD' : {
			name : '关闭左侧所有标签页',
			cmd : function () {
				var tabs = gBrowser.mTabContainer.childNodes;
				for (var i = tabs.length - 1; tabs[i] != gBrowser.mCurrentTab; i--){}
				for (i--; i >=0 ; i--){
					gBrowser.removeTab(tabs[i]);
				}
			}
		},

		'DRD' : {
			name : '关闭右侧所有标签页',
			cmd : function () {
				var tabs = gBrowser.mTabContainer.childNodes;
				for (var i = tabs.length - 1; tabs[i] != gBrowser.selectedTab; i--)
				{
					gBrowser.removeTab(tabs[i]);
				}
			}
		},

	},

	init : function () {
		var self = this;
		var events = ["mousedown", "mousemove", "mouseup", "contextmenu"];
		if (this.enableRockerGestures)
			events.push("draggesture");
		if (this.enableWheelGestures)
			events.push("DOMMouseScroll");
		function registerEvents(aAction, eventArray) {
			eventArray.forEach(function (aType) {
				getBrowser().mPanelContainer[aAction + "EventListener"](aType, self, aType == "contextmenu");
			});
		};
		registerEvents("add", events);
		window.addEventListener("unload", function () {
			registerEvents("remove", events);
		}, false);
	},

	handleEvent : function (event) {
		switch (event.type) {
		case "mousedown":
			if (event.button == 2) {
				this._isMouseDownR = true;
				this._hideFireContext = false;
				this._startGesture(event);
			}
			if (this.enableRockerGestures) {
				if (event.button == 2 && this._isMouseDownL) {
					this._isMouseDownR = false;
					this._shouldFireContext = false;
					this._hideFireContext = true;
					this._directionChain = "L>R";
					this._stopGesture(event);
				} else if (event.button == 0) {
					this._isMouseDownL = true;
					if (this._isMouseDownR) {
						this._isMouseDownL = false;
						this._shouldFireContext = false;
						this._hideFireContext = true;
						this._directionChain = "L<R";
						this._stopGesture(event);
					}
				}
			}
			break;
		case "mousemove":
			if (this._isMouseDownR) {
				this._hideFireContext = true;
				this._progressGesture(event);
			}
			break;
		case "mouseup":
			if (event.ctrlKey && event.button == 2) {
				this._isMouseDownL = false;
				this._isMouseDownR = false;
				this._shouldFireContext = false;
				this._hideFireContext = false;
				this._directionChain = '';
				event.preventDefault();
				XULBrowserWindow.statusTextField.label = "Reset Gesture";
				break;
			}
			if (this._isMouseDownR && event.button == 2) {
				if (this._directionChain)
					this._shouldFireContext = false;
				this._isMouseDownR = false;
				this._stopGesture(event);
				if (this._shouldFireContext && !this._hideFireContext) {
					this._shouldFireContext = false;
					this._displayContextMenu(event);
				}
			} else if (this.enableRockerGestures && event.button == 0 && this._isMouseDownL) {
				this._isMouseDownL = false;
				this._shouldFireContext = false;
			}
			break;
		case "contextmenu":
			if (this._isMouseDownL || this._isMouseDownR || this._hideFireContext) {
				event.preventDefault();
				event.stopPropagation();
				this._shouldFireContext = true;
				this._hideFireContext = false;
			}
			break;
		case "DOMMouseScroll":
			if (this.enableWheelGestures && this._isMouseDownR) {
				event.preventDefault();
				event.stopPropagation();
				this._shouldFireContext = false;
				this._hideFireContext = true;
				this._directionChain = "W" + (event.detail > 0 ? "+" : "-");
				this._stopGesture(event);
			}
			break;
		case "draggesture":
			this._isMouseDownL = false;
			break;
		}
	},

	_displayContextMenu : function (event) {
		var evt = event.originalTarget.ownerDocument.createEvent("MouseEvents");
		evt.initMouseEvent("contextmenu", true, true, event.originalTarget.defaultView, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 2, null);
		event.originalTarget.dispatchEvent(evt);
	},

	_startGesture : function (event) {
		this._lastX = event.screenX;
		this._lastY = event.screenY;
		this._directionChain = "";
		this.createTrail(event);
	},

	_progressGesture : function (event) {
		var x = event.screenX,
		y = event.screenY;
		var lastX = this._lastX,
		lastY = this._lastY;
		var subX = x - lastX,
		subY = y - lastY;
		var distX = (subX > 0 ? subX : (-subX)),
		distY = (subY > 0 ? subY : (-subY));
		var direction;
		if (distX < 10 && distY < 10)
			return;
		if (distX > distY)
			direction = subX < 0 ? "L" : "R";
		else
			direction = subY < 0 ? "U" : "D";
		var dChain = this._directionChain;
		this.drawTrail(this._lastX, this._lastY, x, y);
		if (direction != dChain.charAt(dChain.length - 1)) {
			dChain += direction;
			this._directionChain += direction;
			var gesture = this.GESTURES[dChain];
			XULBrowserWindow.statusTextField.label = "手势: " + dChain + (gesture ? ' (' + gesture.name + ')' : '');
		}
		this._lastX = x;
		this._lastY = y;
	},

	_stopGesture : function (event) {
		try {
			if (dChain = this._directionChain) {
				if (typeof this.GESTURES[dChain].cmd == "function")
					this.GESTURES[dChain].cmd(this, event);
				else
					eval(this.GESTURES[dChain].cmd);
				XULBrowserWindow.statusTextField.label = "";
			}
		} catch (e) {
			XULBrowserWindow.statusTextField.label = '手势未定义或函数定义错误: ' + dChain;
		}
		this._directionChain = "";
		this.eraseTrail();
	},

	_trailDot: null,
	_trailArea: null,
	_trailLastDot: null,
	_trailOffsetX: 0,
	_trailOffsetY: 0,
	_trailZoom: 1,
	_trailSize: 2,
	_trailColor: "#33FF33",

	createTrail: function FGH_createTrail(event) {
		var win = event.view;
		if (win.top.document instanceof Ci.nsIDOMHTMLDocument)
			win = win.top;
		else if (win.document instanceof Ci.nsIDOMHTMLDocument === false)
			return;
		var doc = win.document;
		var insertionNode = doc.documentElement ? doc.documentElement : doc;
		var win = doc.defaultView;
		this._trailZoom = win.QueryInterface(Ci.nsIInterfaceRequestor).
		                  getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		this._trailOffsetX = (win.mozInnerScreenX - win.scrollX) * this._trailZoom;
		this._trailOffsetY = (win.mozInnerScreenY - win.scrollY) * this._trailZoom;
		this._trailArea = doc.createElementNS("http://www.w3.org/1999/xhtml", "xdTrailArea");
		insertionNode.appendChild(this._trailArea);
		this._trailDot = doc.createElementNS("http://www.w3.org/1999/xhtml", "xdTrailDot");
		this._trailDot.style.width = this._trailSize + "px";
		this._trailDot.style.height = this._trailSize + "px";
		this._trailDot.style.background = this._trailColor;
		this._trailDot.style.border = "0px";
		this._trailDot.style.position = "absolute";
		this._trailDot.style.zIndex = 2147483647;
	},

	drawTrail: function FGH_drawTrail(x1, y1, x2, y2) {
		if (!this._trailArea)
			return;
		var xMove = x2 - x1;
		var yMove = y2 - y1;
		var xDecrement = xMove < 0 ? 1 : -1;
		var yDecrement = yMove < 0 ? 1 : -1;
		x2 -= this._trailOffsetX;
		y2 -= this._trailOffsetY;
		if (Math.abs(xMove) >= Math.abs(yMove))
			for (var i = xMove; i != 0; i += xDecrement)
				this._strokeDot(x2 - i, y2 - Math.round(yMove * i / xMove));
		else
			for (var i = yMove; i != 0; i += yDecrement)
				this._strokeDot(x2 - Math.round(xMove * i / yMove), y2 - i);
	},

	eraseTrail: function FGH_eraseTrail() {
		if (this._trailArea && this._trailArea.parentNode) {
			while (this._trailArea.lastChild)
				this._trailArea.removeChild(this._trailArea.lastChild);
			this._trailArea.parentNode.removeChild(this._trailArea);
		}
		this._trailDot = null;
		this._trailArea = null;
		this._trailLastDot = null;
	},

	_strokeDot: function FGH__strokeDot(x, y) {
		if (this._trailArea.y == y && this._trailArea.h == this._trailSize) {
			var newX = Math.min(this._trailArea.x, x);
			var newW = Math.max(this._trailArea.x + this._trailArea.w, x + this._trailSize) - newX;
			this._trailArea.x = newX;
			this._trailArea.w = newW;
			this._trailLastDot.style.left  = newX.toString() + "px";
			this._trailLastDot.style.width = newW.toString() + "px";
			return;
		}
		else if (this._trailArea.x == x && this._trailArea.w == this._trailSize) {
			var newY = Math.min(this._trailArea.y, y);
			var newH = Math.max(this._trailArea.y + this._trailArea.h, y + this._trailSize) - newY;
			this._trailArea.y = newY;
			this._trailArea.h = newH;
			this._trailLastDot.style.top    = newY.toString() + "px";
			this._trailLastDot.style.height = newH.toString() + "px";
			return;
		}
		if (this._trailZoom != 1) {
			x = Math.floor(x / this._trailZoom);
			y = Math.floor(y / this._trailZoom);
		}
		var dot = this._trailDot.cloneNode(true);
		dot.style.left = x + "px";
		dot.style.top = y + "px";
		this._trailArea.x = x;
		this._trailArea.y = y;
		this._trailArea.w = this._trailSize;
		this._trailArea.h = this._trailSize;
		this._trailArea.appendChild(dot);
		this._trailLastDot = dot;
	},

};

ucjsMouseGestures.init();