// ==UserScript==
// @name			LinkLocationbarLite.uc.js
// @description		鼠标悬停链接，地址栏显示该链接地址
// @version			2013/01/16
// @include			main
// @author          myfriday9 && w13998686967
// @compatibility	Firefox 18
// ==/UserScript==

(function(){
	if (!isElementVisible(gURLBar)) return;//地址栏不可见，则返回
	var urlbarIcons = document.getElementById('urlbar-icons');
//	var urlbarIcons = document.getElementById('omnibar-in-urlbar');//使用omnibar扩展修正
	if(!urlbarIcons)	return;
		
	var loadingStat = 1;	//载入状态显示的位置：0-左下角（默认位置），1-地址栏
	
	var additionBar = document.createElement('label');
	additionBar.setAttribute('id','addtion-link');
	additionBar.setAttribute('value','');
	additionBar.setAttribute('crop','center');// 文本长度超出时，省略中间内容
	additionBar.setAttribute('text-align','right');
	additionBar.setAttribute('style', "-moz-box-ordinal-group: 2 !important;");  ////地址栏显示位置 0最左边 1中间 2最右边
	additionBar.style.maxWidth = '400px';//显示的长度，如果发现挡住网页地址严重的情况，可以相应调小
	additionBar.style.color = 'red';//字体颜色
	additionBar.style.margin = "0 0 -1px 0";//字体位置微调
	
	// 添加到地址栏
	gURLBar.appendChild(additionBar);
	
	XULBrowserWindow.statusTextField.__defineGetter__('label', function() {
		return this.getAttribute("label");
  	});
	XULBrowserWindow.statusTextField.__defineSetter__('label', function(str) {
		if (str) {
			this.setAttribute('label', str);
			this.style.opacity = 1;
			if(str.charCodeAt(0) < 128) {		// 显示目标链接
				this.style.opacity = 0;
				if(str.length > 80) {
					additionBar.setAttribute('value',' > ' + str.substr(0, 39) + '...' + str.substr(str.length - 39, 39));
				} else {
					additionBar.setAttribute('value',' > ' + str);
				}
				urlbarIcons.style.display = 'visible';//显示地址栏里面的图标
			} else {		
				if(loadingStat == 1){	// 在地址栏显示
					this.style.opacity = 0;
					additionBar.setAttribute('value',str);
				} else {		// 在左下角显示
					additionBar.setAttribute('value','');
				}
				urlbarIcons.style.display = 'inherit';
			}
			
		} else {
			this.style.opacity = 0;
			
			additionBar.setAttribute('value','');
			urlbarIcons.style.display = 'inherit';
	    }
	    if(this.style.opacity == 0) {
	    	XULBrowserWindow.statusTextField.removeAttribute('mirror');
	    }
	    return str;
	});
	
	
})();