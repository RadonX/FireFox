// ==UserScript==
// @name        auto focus urlbar
// @namespace   autoFocusUrlbar@zbinlin[AT]gmail
// @filename    autoFocusUrlbar.uc.js
// @description 当键入字符[a-Z]时，自动定位到地址栏
// @author      zbinlin
// @version     1.0.20111005    添加 过滤 select 元素
// @version     0.9.20110609    修复 document.designMode = 'on' bug
// @version     0.8.20110603    修复 含有 frame 框架网页失效 bug
// @version     0.7.20110525    添加 如果选中文本，当键入字符后将取消选中状态
// @version     0.6.20110524    添加 auto focus url bar 开关
// @version     0.5.20110523    添加 自定义选中搜索功能
// @version     0.4.20110519    修复 模拟按键字符 bug
// @version     0.3.20110518    修复 输入第一个字符时，地址栏无法自动搜索 bug
// @version     0.2.20110518    修复 网页包含框架失效 bug
// @version     0.1.20110505
// ==/UserScript==

if (location == "chrome://browser/content/browser.xul") {

    //var gBrowser = document.getElementById("content");
    var AutoFocusUrlbar = {
        enabled: true,
        /* key2SMode: value // 
         * -1 : 键入即定位到地址栏（默认值）
         * 0  : 当选中文本时，键入即地址栏出现：“键入字符I 选中文本”I 为光标
         * 1  : 当选中文本时，键入即搜索选中文本（通过按键延时来决定搜索方式）
         *      
         */
        key2SMode: 1,
        keyStatus: -1, /* AutoFocusUrlbar 应用是否有效 */
        keyDelay: 500, /* 按键延时时间，默认：500ms */
        keyDV: false, /* true 前台新建标签页搜索；false 后台新建标签页搜索 */
        keyTimeID: 0,
        selObj: null,
        elm: null,
        handleEvent: function (e) {
            if (!this.enabled) return;
            switch (e.type) {
                case 'keydown' :
                    this.keyStatus = -1;
                    var elm = document.activeElement;
                    while (1) {
                        if (elm == null) return;
                        if (elm.localName == "browser" ||
                            elm.localName == "iframe" ||
                            elm.localName == "frame") {
                            elm = elm.contentDocument.activeElement;
                            continue;
                        }
                        break;
                    }
                    if (elm.ownerDocument.designMode == "on" ||
                        elm.localName == "select" ||
                        elm.localName == "input" ||
                        elm.localName == "textarea" ||
                        elm.getAttribute("contenteditable") == "true") return;
                    this.elm = elm;
                    var mod = e.ctrlKey || e.metaKey || e.altKey;
                    if (mod) return;
                    this.selObj = e.view.getSelection();
                    if (this.key2SMode == 1 && this.selObj.toString()) {
                        this.keyStatus = 1;
                        if (!this.keyTimeID) {
                            var that = this;
                            this.keyDV = false;
                            this.keyTimeID = setTimeout(function () {
                                that.keyDV = true;
                                this.keyTimeID = 0;
                            }, this.keyDelay);
                        }
                    } else {
                        this.keyStatus = 0;
                    }
                    break;
                case 'keypress' :
                    if (!this.elm) return;
                    var c = String.fromCharCode(e.charCode);
                    if (/[^a-zA-Z]/.test(c)) return;
                    if (this.keyStatus != 0) return;
                    var urlbar = document.getElementById("urlbar");
                    if (!urlbar) return;
                    e.preventDefault();
                    urlbar.focus();
                    try {
                        urlbar.value = '';
                        var evt = document.createEvent("KeyboardEvent");
                        evt.initKeyEvent('keypress', false, true, null,
                                         false, false, false, false,
                                         0, e.charCode);
                        var input = urlbar.inputField;
                        input.dispatchEvent(evt);
                        if (this.key2SMode == 0) {
                            urlbar.value += ' ' + this.selObj.toString();
                            urlbar.setSelectionRange(1, 1);
                        }
                    } catch (err) {
                        urlbar.value = c;
                    }
                    break;
                case 'keyup' :
                    if (!this.elm) return;
                    if (this.keyStatus != 1) return;
                    if (this.keyTimeID) {
                        clearTimeout(this.keyTimeID);
                        this.keyTimeID = 0;
                    }
                    var c = String.fromCharCode(e.keyCode);
                    if (/[^A-Z]/.test(c)) return;
                    var urlbar = document.getElementById("urlbar");
                    if (!urlbar) return;
                    urlbar.value = c.toLowerCase() + ' '
                                                   + this.selObj.toString();
                    var evt = document.createEvent("MouseEvent");
                    var ctrlKey = false, shiftKey = false, button = 0;
                    if (e.shiftKey) {
                        /* Shift + key：当前标签页打开搜索 */
                    } else if (this.keyDV) { // 前台新建标签页打开
                        button = 1;
                    } else { // 后台新建标签页打开
                        ctrlKey = true;
                        shiftKey = true;
                    }
                    this.selObj.removeAllRanges();
                    evt.initMouseEvent('click', false, true, window,
                                       0, 0, 0, 0, 0,
                                       ctrlKey, false, shiftKey, false,
                                       button, null);
                    var urlbarGB = document.getElementById("urlbar-go-button");
                    urlbarGB.dispatchEvent(evt);
                    break;
            }
        },
    }
    window.addEventListener("keydown", AutoFocusUrlbar, false);
    window.addEventListener("keypress", AutoFocusUrlbar, false);
    window.addEventListener("keyup", AutoFocusUrlbar, false);
    window.addEventListener("unload", function () {
        window.removeEventListener("unload", arguments.callee, false);
        window.removeEventListener("keydown", AutoFocusUrlbar, false);
        window.removeEventListener("keypress", AutoFocusUrlbar, false);
        window.removeEventListener("keyup", AutoFocusUrlbar, false);
    }, false);

}
