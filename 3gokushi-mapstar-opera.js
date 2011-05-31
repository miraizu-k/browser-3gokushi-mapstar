// ==UserScript==
// @name           3gokushi-MapStar
// @namespace      3gokushi
// @description    ブラウザ三国志のマップに★の数を表示します。
// @include        http://*.3gokushi.jp/map.php*
// @include        http://*.1kibaku.jp/map.php*
// @include        http://*.17pk.com.tw/map.php*
// @include        http://*.landsandlegends.com/map.php*
// @include        http://*.sdsam.nexon.com/map.php*
// @include        http://*.lordsofdynasty.com/map.php*
// @include        http://*.sangokushi.in.th/map.php*
// @version        2.0.0.0
// ==/UserScript==
document.addEventListener('DOMContentLoaded', function() {
var crossBrowserUtility = initCrossBrowserSupport();

var $ = function (id,pd) {return pd ? pd.getElementById(id) : document.getElementById(id);};

/**
 * $x xpathを評価し結果を配列で返す
 * @param {String} xp
 * @param {HTMLElement|HTMLDocument} dc
 * @returns {Array}
 * @throws
 * @function
 */
var $x = function(xp, dc) {function c(f) {var g = '';if (typeof f === 'string') {g = f;}var h = function(a) {var b = document.implementation.createHTMLDocument('');var c = b.createRange();c.selectNodeContents(b.documentElement);c.deleteContents();b.documentElement.appendChild(c.createContextualFragment(a));return b;};if (0 <= navigator.userAgent.toLowerCase().indexOf('firefox')) {h = function(a) {var b = document.implementation.createDocumentType('html','-//W3C//DTD HTML 4.01//EN','http://www.w3.org/TR/html4/strict.dtd');var c = document.implementation.createDocument(null, 'html', b);var d = document.createRange();d.selectNodeContents(document.documentElement);var e = c.adoptNode(d.createContextualFragment(a));c.documentElement.appendChild(e);return c;};}return h(g);}var m = [], r = null, n = null;var o = dc || document.documentElement;var p = o.ownerDocument;if (typeof dc === 'object' && typeof dc.nodeType === 'number') {if (dc.nodeType === 1 && dc.nodeName.toUpperCase() === 'HTML') {o = c(dc.innerHTML);p = o;}else if (dc.nodeType === 9) {o = dc.documentElement;p = dc;}}else if (typeof dc === 'string') {o = c(dc);p = o;}try {r = p.evaluate(xp, o, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);for ( var i = 0, l = r.snapshotLength; i < l; i++) m.push(r.snapshotItem(i));}catch (e) {try {var q = p.evaluate(xp, o, null, XPathResult.ANY_TYPE, null);while (n = q.iterateNext()) m.push(n);}catch (e) {throw new Error(e.message);}}return m;};

/**
 * $s xpathを評価し1つの結果を返す
 * @param {String} xp
 * @param {HTMLElement|HTMLDocument} dc
 * @returns {Node}
 * @throws
 * @see $x
 * @function
 */
var $s = function(xp, dc) { return $x(xp,dc).shift();};

/**
 * $e
 * @param {HTMLElement|HTMLDocument|Window} doc
 * @param {String|Object} event string or event.click=f or event.click=[f,f,f]
 * @param {Function} event handler
 * @param {Boolean} [useCapture=false]
 * @function
 */
var $e = function(doc, event, func, useCapture) {var eventList = event;var eType = null;var capture = useCapture || false;if (typeof event == 'string') {eventList = new Object();eventList[event] = new Array(func);} else {for (eType in eventList) {if (typeof eventList[eType] == 'object'&& eventList[eType] instanceof Array) {continue;}eventList[eType] = [ event[eType] ];}}for (eType in eventList) {var eventName = eType;for ( var i = 0; i < eventList[eType].length; i++) {doc.addEventListener(eventName, eventList[eType][i], capture);}}};


var mapStarBox = createElement('div', {
    'attribute' : {
        'id' : 'mapStarBox'
    }
});

$x('id("mapboxInner")').forEach(function(self) {
    self.appendChild(mapStarBox);
});

/**
 * 設定データ初期化
 */

var dataTable;
if ((dataTable = GM_getValue('b3MapStar_dataTable', null)) == null) {
    dataTable = {
        w : { // white
            bgColor : '#FFFFFF',
            isVisible : true,
            title : '空地',
            low : 1,
            middle : 3,
            high : 5
        },
        b : { // blue
            bgColor : '#0000FF',
            isVisible : true,
            title : '自軍',
            low : 1,
            middle : 3,
            high : 5
        },
        g : { // green
            bgColor : '#00FF00',
            isVisible : true,
            title : '同盟員',
            low : 1,
            middle : 3,
            high : 5
        },
        bk : { // black
            bgColor : '#000000',
            isVisible : true,
            title : '自配下',
            low : 1,
            middle : 3,
            high : 5
        },
        bg : { // sky blue
            bgColor : '#0066FF',
            isVisible : true,
            title : '親同盟',
            low : 1,
            middle : 3,
            high : 5
        },
        y : { // yellow
            bgColor : '#FFFF00',
            isVisible : true,
            title : '不可侵',
            low : 1,
            middle : 3,
            high : 5
        },
        r : { // red
            bgColor : '#FF0000',
            isVisible : true,
            title : '敵対',
            low : 1,
            middle : 3,
            high : 5
        },
        o : { // orange
            bgColor : '#FFA500',
            isVisible : true,
            title : '他配下',
            low : 1,
            middle : 3,
            high : 5
        },
        p : { // purple
            bgColor : '#FF00FF',
            isVisible : true,
            title : 'NPC',
            low : 1,
            middle : 3,
            high : 5
        }
    };
}
else {
    dataTable = crossBrowserUtility.JSON.parse(dataTable);
}

/**
 * 設定on/off処理関数
 */
function onSettingClick(e) {
    var key = this.getAttribute('type');
    dataTable[key].isVisible = !dataTable[key].isVisible;
    GM_setValue('b3MapStar_dataTable', crossBrowserUtility.JSON.stringify(dataTable));

    var clsName = 'mapStar_off';
    var displayVal = 'none';

    if (dataTable[key].isVisible) {
        clsName = 'mapStar_on';
        displayVal = 'block';
    }

    $x('id("mapStarItemWrapper")//div[contains(@class,"mapStar_' + key + '_")]').forEach(function(self) {
        self.style.display = displayVal;
    });

    this.className = 'mapStar_' + key + '_ mapStar_outer ' + clsName;
}

/**
 * 設定エディタ
 */

GM_addStyle([
        '.mapStar_editor {', 'border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px;',
        'background-color: white; position:absolute; padding:5px; z-index: 500;', '}', '.mapStar_editor li{', 'margin:3px;', '}', '.mapStar_editor li div{',
        'position:static;', 'margin-left:10px;', 'float:left;', 'width:10px;height:10px;', 'font-size: 8px;', '}',
].join("\n"));

var editorBox = createElement('div', {
    attribute : {
        'class' : 'mapStar_editor'
    },
    css : {
        display : 'none'
    }
});
var ul = createElement('ul');
var li = createElement('li');
var label = createElement('label');

var editorCache = {
    caption : null,
    bgColor : null,
    lowLevelText : null,
    middleLevelText : null,
    highLevelText : null,
    lowLevel : null,
    middleLevel : null,
    highLevel : null
};

// 色選択する所
var colorSelect = li.cloneNode(true);
var colorSelectLabel = label.cloneNode(true);
colorSelectLabel.appendChild(createText('変更する色選択\u00A0：\u00A0'));
var colorSelectSelectNode = createElement('select', {
    events : {
        change : function(e) {
            removeEditorColor();
            var dataKey = e.target.value;
            var setting = dataTable[dataKey];
            editorCache.caption.value = setting.title;
            editorCache.bgColor.value = setting.bgColor.substr(1);

            editorCache.lowLevelText.innerHTML = setting.low;
            editorCache.lowLevelText.className = 'mapStar_on mapStar_' + dataKey + '_ mapStar_padding';
            editorCache.middleLevelText.innerHTML = setting.middle;
            editorCache.middleLevelText.className = 'mapStar_on mapStar_' + dataKey + '_ mapStar_box_sol';
            editorCache.highLevelText.innerHTML = setting.high;
            editorCache.highLevelText.className = 'mapStar_on mapStar_' + dataKey + '_ mapStar_box_sol mapStar_box_bol';
            editorCache.lowLevel.value = setting.low;
            editorCache.middleLevel.value = setting.middle;
            editorCache.highLevel.value = setting.high;
        }
    }
});
colorSelectLabel.appendChild(colorSelectSelectNode);
colorSelect.appendChild(colorSelectLabel);
ul.appendChild(colorSelect);

// 簡易説明の所
var caption = li.cloneNode(true);
var captionLabel = label.cloneNode(true);
captionLabel.appendChild(createText('簡易説明\u00A0：\u00A0'));
editorCache.caption = createElement('input', {
    attribute : {
        'type' : 'text',
        'maxlength' : '10',
        'size' : '11',
        'name' : 'title'
    }
});
captionLabel.appendChild(editorCache.caption);
caption.appendChild(captionLabel);
ul.appendChild(caption);

// 背景色の所
var bgColor = li.cloneNode(true);
var bgColorLabel = label.cloneNode(true);
bgColorLabel.style.setProperty('float', 'left');
bgColorLabel.appendChild(createText('背景色\u00A0：\u00A0#'));
editorCache.bgColor = createElement('input', {
    attribute : {
        'type' : 'text',
        'maxlength' : '6',
        'size' : '7',
        'name' : 'bgColor'
    },
    events : {
        input : (function () {
                    var isRunning = false;
                    
                    return function (e) {
                        if (isRunning) {
                            return ;
                        }
                        var self = this;
                        isRunning = true;
                        setTimeout(function () {
                            var colorCode = self.value.replace(/^\s*#?|\s*$/g,'');
                            if (isRGBCode(colorCode)) {
                                setEditorColor('#'+colorCode);
                            }
                            else if (colorCode.length === 0) {
                                removeEditorColor();
                            }
                            isRunning = false;
                        },50);
                    };
                })()
    }
});
bgColorLabel.appendChild(editorCache.bgColor);
bgColor.appendChild(bgColorLabel);
ul.appendChild(bgColor);

// レベル関係の所
var levelDatas = {
    low : {
        caption : '最低Lv\u00A0：\u00A0'
    },
    middle : {
        caption : '中Lv\u00A0：\u00A0'
    },
    high : {
        caption : '高Lv\u00A0：\u00A0'
    }
};
for ( var level in levelDatas)
    (function(level, levelData) {
        var levelLi = li.cloneNode(true);
        levelLi.style.setProperty('float', 'left');
        if (level == 'low') {
            levelLi.style.setProperty('clear', 'both');
        }
        var levelLabel = label.cloneNode(true);
        levelLabel.appendChild(createText(levelData.caption));
        editorCache[level + 'Level'] = createElement('input', {
            attribute : {
                'type' : 'text',
                'maxlength' : '1',
                'size' : '1',
                'name' : 'low'
            },
            events : {
                input : (function (e) {
                    var isRunning = false,isNum = /^\d+$/;
                    
                    return function (e) {
                        if (isRunning) {
                            return ;
                        }
                        isRunning = true;
                        var self = this;
                        setTimeout(function () {
                            if (isNum.test(self.value)) {
                                setEditorColor('#'+colorCode);
                            }
                            isRunning = false;
                        },50);
                    };
                })()
            }
        });
        levelLabel.appendChild(editorCache[level + 'Level']);
        levelLi.appendChild(levelLabel);
        ul.appendChild(levelLi);

        editorCache[level + 'LevelText'] = createElement('div', {
            attribute : {
                'class' : levelData.className
            }
        });
        bgColor.appendChild(editorCache[level + 'LevelText']);
    })(level, levelDatas[level]);

// 各種ボタン
var buttons = li.cloneNode(true);
buttons.style.setProperty('clear', 'both');
buttons.style.setProperty('padding-top', '3px');
buttons.appendChild(createElement('input', {
    attribute : {
        'type' : 'submit',
        'value' : '保存'
    }
}));
buttons.appendChild(createText('\u00A0'));
buttons.appendChild(createElement('input', {
    attribute : {
        'type' : 'button',
        'value' : 'キャンセル'
    },
    events : {
        click : function(e) {
            editorBox.style.display = 'none';
        }
    }
}));
//buttons.appendChild(createText('\u00A0'));
//buttons.appendChild(createElement('input', {
//    attribute : {
//        'type' : 'button',
//        'value' : '削除'
//    },
//    css : {
//        display : 'none'
//    },
//    events : {
//        click : function(e) {
//            alert('削除!');
//            editorBox.style.display = 'none';
//        }
//    }
//}));

ul.appendChild(buttons);

var form = createElement('form', {
    events : {
        submit : function(e) {
            editorBox.style.display = 'none';
            var isNum = /^\d+$/,dataKey = colorSelectSelectNode.item(colorSelectSelectNode.selectedIndex).value,
            setting = dataTable[dataKey],
            bgColorCode = editorCache.bgColor.value.replace(/^\s*#?|\s*$/g,''),
            lowLevel = editorCache.lowLevel.value,
            middleLevel = editorCache.middleLevel.value,
            highLevel = editorCache.highLevel.value;
            
            if (isRGBCode(bgColorCode)) {
                setting.bgColor = '#'+bgColorCode;
                addAreaTypeCSS(key,setting.bgColor);
            }
            setting.title = editorCache.caption.value;
            
            if (isNum.test(lowLevel)) {
                setting.low = +lowLevel;
            }
            if (isNum.test(middleLevel)) {
                setting.middle = +middleLevel;
            }
            if (isNum.test(highLevel)) {
                setting.high = +highLevel;
            }
            
            GM_setValue('b3MapStar_dataTable', crossBrowserUtility.JSON.stringify(dataTable));
            
            alert('保存しました。更新で設定が適用されます。');
            e.preventDefault();
            return false;
        }
    }
});

form.appendChild(ul);
editorBox.appendChild(form);

mapStarBox.appendChild(editorBox);

/**
 * 設定ボックスの挿入
 */
var settingBox = createElement('div', {
    css : {
        'background-color' : '#FFFFFF',
        'padding-left' : '5px'
    }
});

mapStarBox.appendChild(settingBox);

var css = [
        '.mapStar_outer{ width:10px;height:10px;margin:2px 4px 2px 0px;float:left;border:1px solid #000000;cursor:pointer; }',
        '.mapStar_on{ filter:alpha(opacity=100);opacity:1; }', '.mapStar_off{ filter:alpha(opacity=30);opacity:0.3;border:1px solid #999999; }',
        '.mapStar_box{ filter:alpha(opacity=60);opacity:0.6; position: absolute; width: 8px; height: 8px; font-size: 8px;}',
        '.mapStar_box_sol { border:1px solid #000;padding : 0px 2px 3px 2px;}', '.mapStar_box_bol { font-weight:bold; }',
        '.mapStar_padding { padding : 1px 2px 4px 3px; }',
];

for ( var key in dataTable) {
    var setting = dataTable[key];
    var onoff = setting.isVisible ? 'mapStar_on' : 'mapStar_off';
    var setItem = document.createElement('div');
    setItem.className = 'mapStar_' + key + '_ mapStar_outer ' + onoff;
    setItem.style.backgroundColor = setting.bgColor;

    setItem.title = setting.title;

    settingBox.appendChild(setItem);
    setItem.setAttribute('type', key);

    $e(setItem, {
        click : onSettingClick
    });

    addAreaTypeCSS(key,setting.bgColor,css);

    // editor option
    colorSelectSelectNode.appendChild(createElement('option', {
        attribute : {
            'value' : key,
            'class' : 'mapStar_' + key + '_'
        },
        innerText : setting.title
    }));
}
// default select dispatch
var e = document.createEvent('HTMLEvents');
e.initEvent('change', true, true);
colorSelectSelectNode.selectedIndex = 0;
colorSelectSelectNode.dispatchEvent(e);

var edit = createElement('A',{
    css : {
        'text-decoration' : 'underline',
        'cursor' : 'pointer',
        'color' : '#000000'
    },
    innerText : '編集',
    events : {
        click : function(e) {
            editorBox.style.display = 'block';
            editorBox.style.top = e.target.parentNode.offsetTop - editorBox.offsetHeight - 3 + 'px';
            editorBox.style.left = e.target.parentNode.offsetLeft + 3 + 'px';
            e.preventDefault();
        }
    }
});

settingBox.appendChild(edit);

/**
 * MAPサイズ取得
 */
var mapSize = ($('rollover').style.zIndex || document.defaultView.getComputedStyle($('rollover'), '').zIndex) - 1;

/**
 * CSS設定
 */
var marginSize = '34px 0px 0px 23px';
if (400 <= mapSize) {
    marginSize = '18px 0px 0px 12px';
}
else if (200 <= mapSize) {
    marginSize = '25px 0px 0px 17px';
}
css.push('.mapStar_margin{ margin:' + marginSize + '; z-index:' + (mapSize + 2) + '; }');
GM_addStyle(css.join("\n"));

/**
 * 地図データの取得
 */
var mapMap = new Array(mapSize + 1);
var maps = $('mapsAll');

for ( var i = 0; i <= mapSize; i++) {
    mapMap[i] = null;
}

var imgRegCmp = new RegExp(/img\/panel\/([^_]*)_([^_]*)_/);
$x('id("mapsAll")//img[contains(@class,"mapAll") and not(@class="mapAllOverlay")]').forEach(function(self) {
    var matches = self.className.match(/mapAll(\d+)/);
    var mapIndex = matches[1] - 0;
    if ((matches = imgRegCmp.exec(self.src))) {
        if (matches[1] == 'resource') {
            mapMap[mapIndex] = null;
        }
        else {
            mapMap[mapIndex] = matches[2];
        }
    }
    else if (0 <= self.src.indexOf('blanc')) {
        mapMap[mapIndex] = false;
    }
});

/**
 * 地図へ埋め込み
 */
var itemWrapper = document.createElement('div');
itemWrapper.setAttribute('id', 'mapStarItemWrapper');
mapStarBox.appendChild(itemWrapper);

itemWrapper.style.position = 'absolute';
setTimeout(function() {
    var parent = maps.offsetParent || maps.parentNode;
    if (parent) {
        var top = (parent.offsetTop + maps.offsetTop),
            left = (parent.offsetLeft + maps.offsetLeft);
        if (top !== parseInt(itemWrapper.style.top,10) || left === parseInt(itemWrapper.style.left,10)) {
            setTimeout(arguments.callee, 100);
        }

        itemWrapper.style.top = (parent.offsetTop + maps.offsetTop) + 'px';
        itemWrapper.style.left = (parent.offsetLeft + maps.offsetLeft) + 'px';
    }
}, 30);

var areas = $x('id("mapsAll")//area');
var areaLen = areas.length;

for ( var i = 1, j = 0; i < mapMap.length; i++) {
    if (mapMap[i] === false) {
        continue;
    }

    var areaInfo = null,
        mo = areas[j++].getAttribute('onmouseover');

    if ((areaInfo = getAreaInfo(mo))) {
        var dataKey = (mapMap[i] === null) ? 'w' : mapMap[i];
        setting = dataTable[dataKey];
        
        if (areaInfo.starLength < setting.low) {
            continue;
        }

        var item = createElement('div',{
            attribute : {
                'class' : 'mapStar_margin mapStar_box mapStar_' + dataKey + '_',
                'id' :  'mapStar_' + i
            },
            css : {
                'left' : areaInfo.left + 'px',
                'top' : areaInfo.top + 'px'
            },
            innerText : String(areaInfo.starLength)
        });

        if (setting.isVisible == false) {
            item.style.display = 'none';
        }
        
        if (areaInfo.starLength < setting.middle) {
            item.className += ' mapStar_padding';
        }
        if (setting.middle <= areaInfo.starLength) {
            item.className += ' mapStar_box_sol';
        }
        if (setting.high <= areaInfo.starLength) {
            item.className += ' mapStar_box_bol';
        }

        itemWrapper.appendChild(item);
    }
}


/**
 * @param {String} dataKey is dataTable key
 * @param {String} bgColor is RGBCode
 * @param {Array} [container]
 */
function addAreaTypeCSS(dataKey,bgColor,container) {
    if (!isRGBCode(bgColor)) {
        return ;
    }
    
    bgColor = toValidRGBCode(bgColor);
    
    var addCSS = '.mapStar_' + dataKey + '_ {background-color:' + bgColor + '; color:' + getFontColor(bgColor) + '} ';
    if (container instanceof Array) {
        container.push(addCSS);
        return container;
    }

    GM_addStyle(addCSS);
}

function setEditorColor (color) {
    if (!isRGBCode(color)) {
        return ;
    }
    color = toValidRGBCode(color);
    
    editorCache.lowLevelText.style.setProperty('background-color',color,'');
    editorCache.lowLevelText.style.setProperty('color',getFontColor(color),'');
    editorCache.middleLevelText.style.setProperty('background-color',color,'');
    editorCache.middleLevelText.style.setProperty('color',getFontColor(color),'');
    editorCache.highLevelText.style.setProperty('background-color',color,'');
    editorCache.highLevelText.style.setProperty('color',getFontColor(color),'');
}

function removeEditorColor () {
    editorCache.lowLevelText.style.removeProperty('background-color');
    editorCache.lowLevelText.style.removeProperty('color');
    editorCache.middleLevelText.style.removeProperty('background-color');
    editorCache.middleLevelText.style.removeProperty('color');
    editorCache.highLevelText.style.removeProperty('background-color');
    editorCache.highLevelText.style.removeProperty('color');
}

/**
 * @param {String} rgbCode
 * @returns {String|Boolean} boolean type is error
 */
function toValidRGBCode(rgbCode) {
    if (!isRGBCode(rgbCode)) {
        return false;
    }
    
    if (rgbCode.indexOf('#') === 0) {
        rgbCode = rgbCode.substr(1);
    }
    if (rgbCode.length === 3) {
        var r = rgbCode[0],
            g = rgbCode[1],
            b = rgbCode[2];
        rgbCode = Array(3).join(r) + Array(3).join(g) + Array(3).join(b);
    }
    return '#'+rgbCode;
}

/**
 * @param {String} color is RGB code string
 * @returns {String} #000 or #FFF
 */
function getFontColor(color) {
    if (!isRGBCode(color)) {
        return false;
    }
    color = toValidRGBCode(color).substr(1);
    
    var r = parseInt(color[0], 16);
    var g = parseInt(color[1], 16);
    var b = parseInt(color[2], 16);
    if (color.length == 6) {
        r = parseInt(color.substring(0, 2), 16);
        g = parseInt(color.substring(2, 4), 16);
        b = parseInt(color.substring(4, 6), 16);
    }

    getLightness = function(r, g, b) {
        return Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
    };

    var bgLightness = getLightness(r, g, b);
    var bLightness = getLightness(0, 0, 0);
    var wLightness = getLightness(255, 255, 255);

    var fontColer = 'FFF';
    if (Math.abs(wLightness - bgLightness) < Math.abs(bLightness - bgLightness)) {
        fontColer = '000';
    }

    return '#' + fontColer;
}

/**
 * @param {String} rgbCode
 * @returns {Boolean}
 */
function isRGBCode(rgbCode) {
    return /^#?(?:[a-fA-F0-9]{3}){1,2}$/.test(rgbCode);
}

/**
 * @param {String} mouseoverText
 * @returns {Object}
 */
function getAreaInfo (mouseoverText) {
    var ary = mouseoverText.replace(/\\'/g,'"').match(/'[^']*'/g);
    if (!ary || ary.length !== 15) {
        return null;
    }
    
    ary = ary.map(function (raw) {
        return raw.replace(/^\s*'|'\s*$/g,'');
    });
    
    var xy = ary[3].substring(1,ary[3].length - 1).split(/,/),
        starLength = ary[5].length;
    
    if (1 <= ary[5].length && /\u2605/.test(ary[5]) === false) {
        starLength = ary[5].split(/>\s*</).length;
    }

    return {
        'name' : ary[0],
        'owner' : ary[1],
        'population' : ary[2] !== '' ? Number(ary[2]) : '',
        'location' : {
            'x' : xy[0],
            'y' : xy[1]
        },
        'ownerAlly' : ary[4],
        'starLength' : starLength,
        'distance' : Number(ary[6]),
        'wood' : Number(ary[7]),
        'stone' : Number(ary[8]),
        'iron' : Number(ary[9]),
        'crop' : Number(ary[10]),
        'isNPC' : !!ary[11],
        'left' : parseInt(ary[13],10),
        'top' : parseInt(ary[14],10)
    };
}


/**
 * @param {String} text
 * @returns {Node}
 */
function createText(text) {
    return document.createTextNode(text);
}

/**
 * Function createElement
 * @param {String} elementName
 * @param {Object} option
 * @param {HTMLDocument} doc
 * @returns {Element}
 * @see $e is event attach method
 */
function createElement(elementName, option, doc) {
    var pageDocument = doc ? doc : document;
    var retElement = elementName === 'img' ? new Image() : pageDocument.createElement(elementName);

    if (typeof option === 'object') {
        if (typeof option.attribute === 'object') {
            for ( var attrName in option.attribute) {
                if (option.attribute.hasOwnProperty(attrName)) {
                    retElement.setAttribute(attrName, option.attribute[attrName]);
                }
            }
        }
        if (typeof option.events === 'object') {
            $e(retElement, option.events);
        }
        if (typeof option.innerText === 'string') {
            retElement.appendChild(pageDocument.createTextNode(option.innerText));
        }
        if (typeof option.css === 'object') {
            for ( var cssProp in option.css) {
                if (option.css.hasOwnProperty(cssProp)) {
                    retElement.style.setProperty(cssProp, option.css[cssProp], '');
                }
            }
        }
        else if (option.css === 'string') {
            retElement.style.cssText = option.css;
        }
    }
    return retElement;
}

// GM関数初期化
function initGMFunctions() {
    // @copyright 2009, James Campos
    // @license cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
    if ((typeof GM_getValue != 'undefined') && (GM_getValue('a', 'b') != undefined)) {
        return;
    }

    GM_addStyle = function(css) {
        var style = document.evaluate('//head/style[last()]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        style = style && style.singleNodeValue || document.createElement('style');
        style.textContent += '\n' + css;
        if (!(style.parentNode || style.parentElement)) {
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    };

    GM_deleteValue = function(name) {
        localStorage.removeItem(name);
    };

    GM_getValue = function(name, defaultValue) {
        var value = localStorage.getItem(name);
        if (!value)
            return defaultValue;
        var type = value[0];
        value = value.substring(1);
        switch (type) {
            case 'b':
                return value == 'true';
            case 'n':
                return Number(value);
            default:
                return value;
        }
    };

    GM_log = function(message) {
        if (typeof console === 'object' && 'log' in console) {
            console.log(message);
        }
        else if (typeof opera == 'object' && 'postError' in opera) {
            opera.postError(message);
        }
    };

    GM_registerMenuCommand = function(name, funk) {
        // todo
    };

    GM_setValue = function(name, value) {
        switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
                break;
            default:
                throw new TypeError();
        }

        value = (typeof value)[0] + value;
        localStorage.setItem(name, value);
    };

    // additional functions
    GM_listValues = function() {
        var len = localStorage.length;
        var res = new Object();
        var key = '';
        for ( var i = 0; i < len; i++) {
            key = localStorage.key(i);
            res[key] = key;
        }
        return res;
    };

    GM_openInTab = function(url) {
        window.open(url, '');
    };
}

// JSONがない場合とprototype.jsとJSONオブジェクトの衝突回避用(forOpera)
function initJSON() {
    var myJSON = function() {
        if (typeof JSON != 'object' || typeof Prototype == 'object') {
            this.__proto__ = {
                stringify : function(obj) {
                    switch (typeof obj) {
                        case 'string':
                            return quote(obj);
                        case 'number':
                            return isFinite(obj) ? String(obj) : 'null';
                        case 'boolean':
                        case 'null':
                            return String(obj);
                        case 'object':
                            if (!obj) {
                                return 'null';
                            }

                            if (obj instanceof Date) {
                                return isFinite(obj) ? obj.getUTCFullYear() + '-' + complementZero(obj.getUTCMonth() + 1) + '-'
                                        + complementZero(obj.getUTCDate()) + 'T' + complementZero(obj.getUTCHours()) + ':'
                                        + complementZero(obj.getUTCMinutes()) + ':' + complementZero(obj.getUTCSeconds()) + 'Z' : 'null';
                            }

                            var partial = new Array();
                            var prefix = '{';
                            var suffix = '}';
                            if (obj instanceof Array) {
                                prefix = '[';
                                suffix = ']';

                                length = obj.length;
                                for ( var i = 0; i < length; i++) {
                                    partial[i] = arguments.callee(obj[i]) || 'null';
                                }
                            }
                            else {
                                for ( var key in obj) {
                                    if (Object.hasOwnProperty.call(obj, key)) {
                                        partial.push(quote(key) + ':' + (arguments.callee(obj[key]) || 'null'));
                                    }
                                }
                            }

                            return prefix + partial.join(',') + suffix;
                            break;
                        default:
                            return null;
                    }

                    function quote(str) {
                        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                        var meta = { // table of character substitutions
                            '\b' : '\\b',
                            '\t' : '\\t',
                            '\n' : '\\n',
                            '\f' : '\\f',
                            '\r' : '\\r',
                            '"' : '\\"',
                            '\\' : '\\\\'
                        };

                        return escapable.test(str) ? '"' + str.replace(escapable, function(a) {
                            var c = meta[a];
                            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }) + '"' : '"' + str + '"';
                    }

                    function complementZero(number) {
                        return number < 10 ? '0' + number : number;
                    }
                },
                parse : function(jsonStrings) {
                    return eval('(' + jsonStrings + ')');
                }
            };
        }
    };

    if (typeof JSON == 'object') {
        myJSON.prototype = JSON;
    }

    return new myJSON();
}

function initCrossBrowserSupport() {
    var crossBrowserUtility = {
        'JSON' : null
    };
    // GM関数の初期化
    initGMFunctions();

    // 配列のindexOf対策 from MDC
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /* , from */) {
            var len = this.length;

            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) {
                from += len;
            }

            for (; from < len; from++) {
                if (from in this && this[from] === elt) {
                    return from;
                }
            }

            return -1;
        };
    }

    // ArrayのforEach対策 from MDC
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /* , thisp */) {
            var len = this.length;
            if (typeof fun != "function") {
                throw new TypeError();
            }

            var thisp = arguments[1];
            for ( var i = 0; i < len; i++) {
                if (i in this) {
                    fun.call(thisp, this[i], i, this);
                }
            }
        };
    }

    // Arrayのmap対策 from MDC
    if (!Array.prototype.map) {
        Array.prototype.map = function(fun /*, thisp*/) {
            var len = this.length;
            if (typeof fun != "function") {
                throw new TypeError();
            }

            var res = new Array(len);
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in this) {
                    res[i] = fun.call(thisp, this[i], i, this);
                }
            }
            return res;
        };
    }

    // JSONのサポート
    crossBrowserUtility.JSON = initJSON();
    return crossBrowserUtility;
}

},false);
