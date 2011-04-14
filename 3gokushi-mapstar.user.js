// ==UserScript==
// @name           3gokushi-MapStar
// @namespace      3gokushi
// @description    ブラウザ三国志のマップに★の数を表示します。
// @include        http://*.3gokushi.jp/map.php*
// @version        1.1.3.3
// ==/UserScript==
initGMFunctions();
var $x = function (xpath, context){var nodes = [];try {var doc = context || document;var results = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);var node;while (node = results.iterateNext()) {nodes.push(node);}} catch (e) {throw new Error(e.message);}return nodes;};
var $ = function (id,pd) {return pd ? pd.getElementById(id) : document.getElementById(id);};
var $e = function(doc,event,func) {var eventList = event;if (typeof event == 'string') {eventList = new Object();eventList[event] = new Array(func);}else {for (var eType in eventList) {if (typeof eventList[eType] == 'object' && eventList[eType] instanceof Array) {continue;}eventList[eType] = [event[eType]];}}for (eType in eventList) {var eventName = eType;for (var i =0; i < eventList[eType].length;i++) {doc.addEventListener(eventName, eventList[eType][i], false);}}};

var myJSON = initJSON();

var mapStarBox = createElement('div', {'attribute' : {'id' : 'mapStarBox'}});
$x('id("mapboxInner")').forEach(function(self) {
                                    self.appendChild(mapStarBox);
                                });

/**
 * 設定データ初期化
 */

var dataTable;
if ((dataTable = GM_getValue('b3MapStar_dataTable',null)) == null) {
    dataTable = {
        w : { // white
            bgColor : '#FFFFFF',
            isVisible: true,
            title : '空地',
            low:1,
            middle:3,
            high:5
        },
        b : {   // blue
            bgColor : '#0000FF',
            isVisible: true,
            title : '自軍',
            low:1,
            middle:3,
            high:5
        },
        g : { // green
            bgColor : '#00FF00',
            isVisible: true,
            title : '同盟員',
            low:1,
            middle:3,
            high:5
        },
        bk : { // black
            bgColor : '#000000',
            isVisible: true,
            title : '自配下',
            low:1,
            middle:3,
            high:5
        },
        bg : { // sky blue
            bgColor : '#0066FF',
            isVisible: true,
            title : '親同盟',
            low:1,
            middle:3,
            high:5
        },
        y : { // yellow
            bgColor : '#FFFF00',
            isVisible: true,
            title : '不可侵',
            low:1,
            middle:3,
            high:5
        },
        r : { // red
            bgColor : '#FF0000',
            isVisible: true,
            title : '敵対',
            low:1,
            middle:3,
            high:5
        },
        o : { // orange
            bgColor : '#FFA500',
            isVisible: true,
            title : '他配下',
            low:1,
            middle:3,
            high:5
        },
        p : { // purple
            bgColor : '#FF00FF',
            isVisible: true,
            title : 'NPC',
            low:1,
            middle:3,
            high:5
        }
    };
} else {
    dataTable = myJSON.parse(dataTable);
}

/**
 * 設定on/off処理関数
 */
function onSettingClick(e) {
    var key = this.getAttribute('type');
    dataTable[key].isVisible = !dataTable[key].isVisible;
    GM_setValue('b3MapStar_dataTable',myJSON.stringify(dataTable));

    var clsName = 'mapStar_off';
    var displayVal = 'none';

    if (dataTable[key].isVisible) {
        clsName = 'mapStar_on';
        displayVal = 'block';
    }

    $x('id("mapStarItemWrapper")//div[contains(@class,"mapStar_' + key + '_")]')
        .forEach(function(self) {
        self.style.display = displayVal;
    });

    this.className = 'mapStar_' + key + '_ mapStar_outer ' + clsName;
}

/**
 * 設定ボックスの挿入
 */
var settingBox = createElement('div',{
                                        css : {
                                            'background-color' : '#FFFFFF',
                                            'padding-left' : '5px'
                                        }
                                    });

mapStarBox.appendChild(settingBox);

var css = [
        '.mapStar_outer{ width:10px;height:10px;margin:2px 4px 2px 0px;float:left;border:1px solid #000000;cursor:pointer; }',
        '.mapStar_on{ filter:alpha(opacity=100);opacity:1; }',
        '.mapStar_off{ filter:alpha(opacity=30);opacity:0.3;border:1px solid #999999; }',
        '.mapStar_box{ filter:alpha(opacity=60);opacity:0.6; position: absolute; width: 8px; height: 8px; font-size: 8px;}',
        '.mapStar_box_sol { border:1px solid #000;padding : 0px 2px 3px 2px;}',
        '.mapStar_box_bol { font-weight:bold; }',
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

    css.push('.mapStar_' + key + '_ {background-color:' + setting.bgColor
            + '; color:' + getFontColor(setting.bgColor) + '} ');

}

/**
 * MAPサイズ取得
 */
var mapSize = ($('rollover').style.zIndex || document.defaultView
        .getComputedStyle($('rollover'), '').zIndex) - 1;

/**
 * CSS設定
 */
var marginSize = '34px 0px 0px 23px';
if (400 <= mapSize) {
    marginSize = '18px 0px 0px 12px';
} else if (200 <= mapSize) {
    marginSize = '25px 0px 0px 17px';
}
css.push('.mapStar_margin{ margin:' + marginSize + '; z-index:' + (mapSize + 2)
        + '; }');
GM_addStyle(css.join("\n"));


/**
 * 地図データの取得
 */
var mapMap = new Array(mapSize+1);
var maps = $('mapsAll');

for (var i = 0;i <= mapSize;i++) {
    mapMap[i] = null;
}

var imgRegCmp = new RegExp(/img\/panel\/([^_]*)_([^_]*)_/);
$x('id("mapsAll")//img[contains(@class,"mapAll") and not(@class="mapAllOverlay")]')
        .forEach(function(self) {
    var matches =self.className.match(/mapAll(\d+)/);
    var mapIndex = matches[1] - 0;
    if ((matches = imgRegCmp.exec(self.src))) {
        if (matches[1] == 'resource') {
            mapMap[mapIndex] = null;
                } else {
            mapMap[mapIndex] = matches[2];
        }
    } else if (0 <= self.src.indexOf('blanc')) {
        mapMap[mapIndex] = false;
    }
});

/**
 * 地図へ埋め込み
 *
 */
var itemWrapper = document.createElement('div');
itemWrapper.setAttribute('id', 'mapStarItemWrapper');
mapStarBox.appendChild(itemWrapper);

itemWrapper.style.position = 'absolute';
setTimeout(function() {
    var parent = maps.offsetParent || maps.parentNode;
    itemWrapper.style.top = (parent.offsetTop + maps.offsetTop)+ 'px';
    itemWrapper.style.left = (parent.offsetLeft + maps.offsetLeft)+ 'px';

    var f = arguments.callee;
    setTimeout(function() { f();},1000);
},300);


var areas = $x('id("mapsAll")//area');
var areaLen = areas.length;

var regCmp = new RegExp(/(\'[^\']*\'[^\']*){5}\'(\u2605+)\'.*overOperation\(\'.*\'.*\'(.*)\'.*\'(.*)\'/);


for (var i = 1,j=0; i < mapMap.length; i++) {
    if (mapMap[i] === false) {
        continue;
    }

    var mo = areas[j++].getAttribute('onmouseover');
    if (mo.search(/\u2605/) < 0) {
        continue;
    }

    var matches = null;

    if ((matches = regCmp.exec(mo))) {
        var dataKey = (mapMap[i] === null) ? 'w' : mapMap[i];
        setting  = dataTable[dataKey];

        var item = document.createElement('div');

        if (setting.isVisible == false) {
            item.style.display = 'none';
        }

        item.className = 'mapStar_margin mapStar_box mapStar_' + dataKey + '_';
        item.setAttribute('id', 'mapStar_' + i);
        item.style.left = matches[3];
        item.style.top = matches[4];
        item.innerHTML = matches[2].length;

        if (matches[2].length < setting.low) {
            continue;
        }
        if (matches[2].length < setting.middle) {
            item.className += ' mapStar_padding';
        }
        if (setting.middle <= matches[2].length) {
            item.className += ' mapStar_box_sol';
        }
        if (setting.high <= matches[2].length) {
            item.className += ' mapStar_box_bol';
        }

        itemWrapper.appendChild(item);
    }
}




function getFontColor(colStr) {
    if (colStr[0] == '#') {
        colStr = colStr.substring(1);
    }
    var r = parseInt(colStr[0], 16);
    var g = parseInt(colStr[1], 16);
    var b = parseInt(colStr[2], 16);
    if (colStr.length == 6) {
        r = parseInt(colStr.substring(0, 2), 16);
        g = parseInt(colStr.substring(2, 4), 16);
        b = parseInt(colStr.substring(4, 6), 16);
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

function initGMFunctions() {
    //@copyright      2009, James Campos
    //@license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
    if ((typeof GM_getValue != 'undefined')
            && (GM_getValue('a', 'b') != undefined)) {
        return;
    }
    GM_addStyle = function(css) {
        var style = document.createElement('style');
        style.textContent = css;
        document.getElementsByTagName('head')[0].appendChild(style);
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
        if (typeof opera == 'object') {
            opera.postError(message);
            return;
        }
        console.log(message);
    };

    GM_registerMenuCommand = function(name, funk) {
        //todo
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
        for (var i = 0;i < len;i++) {
            key = localStorage.key(i);
            res[key] = key;
        }
        return res;
    };

    GM_openInTab = function (url) {
        window.open(url,'');
    };
}

function initJSON() {
    var myJSON = function() {
        if (typeof JSON == 'object') {
            this.__proto__ = JSON;
        }
    };
    if (typeof JSON != 'object' || typeof Prototype == 'object') {
        myJSON.prototype.stringify = function(obj) {
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
                    return isFinite(obj) ? obj.getUTCFullYear() + '-'
                            + complementZero(obj.getUTCMonth() + 1) + '-'
                            + complementZero(obj.getUTCDate()) + 'T'
                            + complementZero(obj.getUTCHours()) + ':'
                            + complementZero(obj.getUTCMinutes()) + ':'
                            + complementZero(obj.getUTCSeconds()) + 'Z'
                            : 'null';
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
                } else {
                    for ( var key in obj) {
                        if (Object.hasOwnProperty.call(obj, key)) {
                            partial.push(quote(key) + ':'
                                    + (arguments.callee(obj[key]) || 'null'));
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

                return escapable.test(str) ? '"'
                        + str.replace(escapable, function(a) {
                                    var c = meta[a];
                                    return typeof c === 'string' ? c : '\\u'
                                            + ('0000' + a.charCodeAt(0).toString(16))
                                                    .slice(-4);
                                }) + '"' : '"' + str + '"';
            }

            function complementZero(number) {
                return number < 10 ? '0' + number : number;
            }
        };

        if (typeof JSON != 'object') {
            myJSON.prototype.parse = function(jsonStrings) {
                return eval('(' + jsonStrings + ')');
            };
        }
    }

    return new myJSON();
}

function createText(text) {
    return document.createTextNode(text);
}

function createElement(elementName, option, doc) {
    var pageDocument = doc ? doc : document;
    var retElement = elementName == 'img' ? new Image() : pageDocument
            .createElement(elementName);

    if (typeof option == 'object') {
        if (typeof option.attribute == 'object') {
            for ( var attrName in option.attribute) {
                retElement.setAttribute(attrName, option.attribute[attrName]);
            }
        }
        if (typeof option.events == 'object') {
            $e(retElement, option.events);
        }
        if (typeof option.innerText == 'string') {
            retElement.appendChild(pageDocument.createTextNode(option.innerText));
        }
        if (typeof option.css == 'object') {
            var cssString = '';
            for ( var cssProp in option.css) {
                retElement.style.setProperty(cssProp, option.css[cssProp],'');
            }
        } else if (option.css == 'string') {
            retElement.style.cssText = option.css;
        }
    }
    return retElement;
}