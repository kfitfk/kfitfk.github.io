---
layout: post
title: Photoshop Action Manager Basics
category: programming
poster: https://img.alicdn.com/tfs/TB1ombVHBr0gK0jSZFnXXbRRXXa-1609-558.png
summary: This article discusses the basics of using action manager in Adobe Photoshop, mainly focusing on retrieving the layer style info of a selected layer.
---

## Intro

Adobe Photoshop CEP 提供了许多获取对象信息和操作软件功能的接口。但有一些操作，例如读取图层样式中某个属性的值，则需要通过 `AtionDescriptor` 类来间接取得。Photoshop 中可通过动作面板录制的功能，基本都可以在脚本中用 `AtionDescriptor` 来操作。下面就以获取一个图层的图层样式为例，来介绍整体流程。

## Setting up Script Listener

到 Adobe Photoshop Plugins 页面下载 [ScriptListener](https://helpx.adobe.com/photoshop/kb/downloadable-plugins-and-content.html#ScriptingListenerplugin) 插件。解压缩之后，把 `ScriptingListener.plugin` 文件放到如下位置：

```
Mac: /Applications/Adobe Photoshop [Photoshop_version]/Plug-ins/
Win 64-bit: Program Files\Adobe\Adobe Photoshop [Photoshop_version]\
Win 32-bit: Program Files (x86)\Adobe\Adobe Photoshop [Photoshop_version] (32 bit)\
```

例如，我写这篇文章的时候用的是 Photoshop 2020 for Mac，那么我的插件安装路径就是 `/Applications/Adobe Photoshop 2020/Plug-ins`。完成之后重启 Photoshop。

![cannot verify ps plugin](https://img.alicdn.com/tfs/TB1mytfaepyVu4jSZFhXXbBpVXa-1499-999.jpg)

若是在 macOS Catalina 下首次安装这个插件，在启动 PS 时会弹出如上提示，说无法校验插件来源。打开终端 (Terminal.app)，输入如下命令 (记得修改插件路径)：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Adobe\ Photoshop\ 2020/Plug-ins/ScriptingListener.plugin
```

再重启一次 Photoshop。

## Using Script Listener

新建一个文件，只做你需要录制的操作。以下是我的操作：

![steps of making a sample file](https://img.alicdn.com/tfs/TB1lHHMHpP7gK0jSZFjXXc5aXXa-1920-1080.jpg)

1. 新建一个文件；
2. 背景填充一个渐变；
3. 添加一个文案；
4. 添加若干图层混合模式；
5. 保存文件。

在后续分析之前，先退出 Photoshop，删除插件，以免以后忘记，导致 Photoshop 中的操作一直被记录，影响性能。

Script Listener 会在桌面上会生成一个 `ScriptingListenerJS.log` 的文件，里边包含刚才所做的操作。不同的步骤之间，会以 `// =======================================================` 来分隔。这个文件很长，里边有很多 `stringIDToTypeID` 的操作，来把相对对人友好的命令 ID 转成运行时命令 ID。我们以添加 DropShadow 这个步骤为例，并基于刚才生成的命令日志，来简单封装个方法。

![relations between scripting listener log and drop shadow panel](https://img.alicdn.com/tfs/TB1ombVHBr0gK0jSZFnXXbRRXXa-1609-558.png)

上图是 Script Listener 生成的命令与 Photoshop 图层样式面板里的 Drop Shadow 选项卡的各结构配置项的对应关系。注意角度的设置，全局和局部角度要配置在不同的层级上。

```js
/**
 * set selected layers' layer style to drop shadow
 * @param config {object} - drop shadow configs
 * @param config.blendMode {string} - layer blend mode, one of the following values
 *  'normal', 'dissolve',
 *  'darken', 'multiply', 'colorBurn', 'linearBurn', 'darkerColor',
 *  'lighten', 'screen', 'colorDodge', 'linearDodge', 'lighterColor',
 *  'overlay', 'softLight', 'hardLight', 'vividLight', 'linearLight', 'pinLight', 'hardMix',
 *  'difference', 'exclusion', 'blendSubtraction', 'blendDivide',
 *  'hue', 'saturation', 'color', 'luminosity'
 * @param config.rgbColor {object} - an object containing red/green/blue values ranging from 0 to 255
 * @param config.opacity {number} - an opacity value between 0 and 100
 * @param config.useGloalAngle {boolean} - whether "Use Global Light" is checked
 * @param config.angle {number} - an angle value in degrees
 * @param config.distance {number} - the distance of drop shadow
 * @param config.spread {number} - the spread value between 0 and 100
 * @param config.size {number} - the size value between 0 and 250
 */
function setDropShadow(config) {
  if (!config) {config = {};}
  if (typeof config.useGloalAngle !== 'boolean') {config.useGloalAngle = true;}

  var idset = stringIDToTypeID('set');
    var desc39 = new ActionDescriptor();
    var idnull = stringIDToTypeID('null');
      var ref6 = new ActionReference();
      var idproperty = stringIDToTypeID('property');
      var idlayerEffects = stringIDToTypeID('layerEffects');
      ref6.putProperty(idproperty, idlayerEffects);
      var idlayer = stringIDToTypeID('layer');
      var idordinal = stringIDToTypeID('ordinal');
      var idtargetEnum = stringIDToTypeID('targetEnum');
      ref6.putEnumerated(idlayer, idordinal, idtargetEnum);
    desc39.putReference(idnull, ref6);
    var idto = stringIDToTypeID('to');
      var desc40 = new ActionDescriptor();

      var iddropShadow = stringIDToTypeID('dropShadow');
        var desc41 = new ActionDescriptor();
        var idenabled = stringIDToTypeID('enabled');
        desc41.putBoolean(idenabled, true);
        var idpresent = stringIDToTypeID('present');
        desc41.putBoolean(idpresent, true);
        var idshowInDialog = stringIDToTypeID('showInDialog');
        desc41.putBoolean(idshowInDialog, false);

        if (config.blendMode) {
          var idmode = stringIDToTypeID('mode');
          var idblendMode = stringIDToTypeID('blendMode');
          var idnormal = stringIDToTypeID(config.blendMode);
          desc41.putEnumerated(idmode, idblendMode, idnormal);
        }

        if (config.rgbColor) {
          var idcolor = stringIDToTypeID('color');
            var desc42 = new ActionDescriptor();
            var idred = stringIDToTypeID('red');
            desc42.putDouble(idred, config.rgbColor.red);
            var idgrain = stringIDToTypeID('grain');
            desc42.putDouble(idgrain, config.rgbColor.green);
            var idblue = stringIDToTypeID('blue');
            desc42.putDouble(idblue, config.rgbColor.blue);
          var idRGBColor = stringIDToTypeID('RGBColor');
          desc41.putObject(idcolor, idRGBColor, desc42);
        }

        if (typeof config.opacity === 'number') {
          var idopacity = stringIDToTypeID('opacity');
          var idpercentUnit = stringIDToTypeID('percentUnit');
          desc41.putUnitDouble(idopacity, idpercentUnit, config.opacity);
        }

        var iduseGlobalAngle = stringIDToTypeID('useGlobalAngle');
        desc41.putBoolean(iduseGlobalAngle, config.useGloalAngle);

        if (!config.useGloalAngle && typeof config.angle === 'number') {
          var idlocalLightingAngle = stringIDToTypeID('localLightingAngle');
          var idangleUnit = stringIDToTypeID('angleUnit');
          desc41.putUnitDouble(idlocalLightingAngle, idangleUnit, config.angle);
        }

        if (typeof config.distance === 'number') {
          var iddistance = stringIDToTypeID('distance');
          var idpixelsUnit = stringIDToTypeID('pixelsUnit');
          desc41.putUnitDouble(iddistance, idpixelsUnit, config.distance);
        }

        if (typeof config.spread === 'number') {
          var idchokeMatte = stringIDToTypeID('chokeMatte');
          var idpixelsUnit = stringIDToTypeID('pixelsUnit');
          desc41.putUnitDouble(idchokeMatte, idpixelsUnit, config.spread);
        }

        if (typeof config.size === 'number') {
          var idblur = stringIDToTypeID('blur');
          var idpixelsUnit = stringIDToTypeID('pixelsUnit');
          desc41.putUnitDouble(idblur, idpixelsUnit, config.size);
        }

      var iddropShadow = stringIDToTypeID('dropShadow');
      desc40.putObject(iddropShadow, iddropShadow, desc41);

      if (config.useGloalAngle && typeof config.angle === 'number') {
        var idglobalLightingAngle = stringIDToTypeID('globalLightingAngle');
        var idangleUnit = stringIDToTypeID('angleUnit');
        desc40.putUnitDouble(idglobalLightingAngle, idangleUnit, config.angle);
      }
    var idlayerEffects = stringIDToTypeID('layerEffects');
    desc39.putObject(idto, idlayerEffects, desc40);
  executeAction(idset, desc39, DialogModes.NO);
}
```

## Example: Reading Layer Style Data

使用 Script Listener 操作图层混合样式，只能录制写操作，无法录制读操作。简单查阅文档，就会发现 `ActionDescriptor` 类上与写操作的 `putDouble`、`putBoolean` 等方法相对应的，还有 `getDouble`、`getBoolean` 等用于读操作的方法。类似地，上一节代码末尾处执行写操作的方法是 `executeAction`，而读操作则要使用 `executeActionGet` 方法。

以下代码可检测当前选中图层是否应用了图层样式：

```js
function currentLayer() {
  var ref0 = new ActionReference();
  var idlayer = stringIDToTypeID('layer');
  var idordinal = stringIDToTypeID('ordinal');
  var idtargetEnum = stringIDToTypeID('targetEnum');
  ref0.putEnumerated(idlayer, idordinal, idtargetEnum);
  return executeActionGet(ref0);
}

function hasLayerEffects() {
  var layer = currentLayer();
  return layer.hasKey(stringIDToTypeID('layerEffects'));
}
```

使用读操作获取图层样式属性时，需一层一层递进式地检测。例如，要获取当前图层所应用的渐变叠加的混合模式，则要先确认当前图层应用了图层混合模式，再检测它应用了渐变叠加效果，最后再获取与渐变叠加相关的混合模式属性值。

```js
function getKey(desc, stringId) {
  var key;
  for (var i = 0; i < desc.count; i += 1) {
    key = desc.getKey(i);
    trace(typeIDToStringID(key));
    if (typeIDToStringID(key) === stringId) {
      return key;
    }
  }
}

function getGradientOverlayBlendMode() {
  var layer = currentLayer();
  if (!layer.hasKey(stringIDToTypeID('layerEffects'))) {return;}

  var layerEffects = layer.getObjectValue(stringIDToTypeID('layerEffects'));
  if (!layerEffects.hasKey(stringIDToTypeID('gradientFill'))) {return;}

  var gradientOverlay = layerEffects.getObjectValue(stringIDToTypeID('gradientFill'));
  var key = getKey(gradientOverlay, 'enabled');
  if (gradientOverlay.getBoolean(key) === false) {return;}

  key = getKey(gradientOverlay, 'mode');
  return typeIDToStringID(gradientOverlay.getEnumerationType(key)) + '.' + typeIDToStringID(gradientOverlay.getEnumerationValue(key));
}
```

至于以上代码最后一条语句应使用哪一种取值方法，可以对照 Script Listener 所录制的命令文件来推断，也可以使用 `actionDescriptor.getType(key)` 来获取数据类型进而选取相应的取值方法。

有的属性，例如渐变的颜色信息，通过上述 `getType` 方法可知是数据类型为 `DescValueType.OBJECTTYPE` 的复杂结构，则需要进一步循环才可取得。

以下示例代码，封装了一个通用的 `getValue` 方法，会层层递进获取 `ActionDescriptor` 和 `ActionList` 的属性值，并以获取渐变叠加效果中渐变的颜色和透明度值为例，展示了如何将结果以 JavaScript 对象的形式输出。

```js
// 获取 actionDescriptor 或 actionList 的某个属性值
function getValue(entity, identifier) {
  var value;
  var type = entity.getType(identifier);
  if (type === DescValueType.ALIASTYPE) {
    value = entity.getPath(identifier);
  }
  else if (type === DescValueType.BOOLEANTYPE) {
    value = entity.getBoolean(identifier);
  }
  else if (type === DescValueType.CLASSTYPE) {
    value = 'Class ' + typeIDToStringID(entity.getClass(identifier));
  }
  else if (type === DescValueType.DOUBLETYPE) {
    value = entity.getDouble(identifier);
  }
  else if (type === DescValueType.ENUMERATEDTYPE) {
    value = typeIDToStringID(entity.getEnumerationType(identifier)) + '.' + typeIDToStringID(entity.getEnumerationValue(identifier));
  }
  else if (type === DescValueType.INTEGERTYPE) {
    value = entity.getInteger(identifier);
  }
  else if (type === DescValueType.LARGEINTEGERTYPE) {
    value = entity.getLargeInteger(identifier);
  }
  else if (type === DescValueType.LISTTYPE) {
    value = list2Array(entity.getList(identifier));
  }
  else if (type === DescValueType.OBJECTTYPE) {
    value = desc2Object(entity.getObjectValue(identifier));
  }
  else if (type === DescValueType.RAWTYPE) {
    value = entity.getReference(entity.getData(identifier));
  }
  else if (type === DescValueType.REFERENCETYPE) {
    value = entity.getReference(identifier);
  }
  else if (type === DescValueType.UNITDOUBLE) {
    value = typeIDToStringID(entity.getUnitDoubleType(identifier)) + '::' + entity.getUnitDoubleValue(identifier);
  }
  return value;
}

// 将 actionList 转为 JS 数组
function list2Array(list) {
  var arr = [];
  for (var i = 0; i < list.count; i += 1) {
    arr.push(getValue(list, i));
  }
  return arr;
}

// 将 actionDescriptor 转为 JS 对象
function desc2Object(desc) {
  var obj = {};
  var key, type, stringId;
  for (var i = 0; i < desc.count; i += 1) {
    key = desc.getKey(i);
    stringId = typeIDToStringID(key);
    obj[stringId] = getValue(desc, key);
  }
  return obj;
}

// 将渐变叠加效果所用渐变的颜色和透明度信息以 JS 对象输出
function gradientOverlayColorStops() {
  var layer = currentLayer();
  if (!layer.hasKey(stringIDToTypeID('layerEffects'))) {return;}

  var layerEffects = layer.getObjectValue(stringIDToTypeID('layerEffects'));
  if (!layerEffects.hasKey(stringIDToTypeID('gradientFill'))) {return;}

  var gradientOverlay = layerEffects.getObjectValue(stringIDToTypeID('gradientFill'));
  var key = getKey(gradientOverlay, 'enabled');
  if (gradientOverlay.getBoolean(key) === false) {return;}

  key = getKey(gradientOverlay, 'reverse');
  var isReversed = gradientOverlay.getBoolean(key);

  key = getKey(gradientOverlay, 'gradient');
  var gradient = gradientOverlay.getObjectValue(key);

  var stops = [];
  key = getKey(gradient, 'colors');
  var colors = gradient.getList(key);

  key = getKey(gradient, 'transparency');
  var transparencies = gradient.getList(key);

  return {
    reversed: isReversed,
    colors: list2Array(colors),
    transparencies: list2Array(transparencies)
  };
}
```

## Wapping up

若编写 CEP 扩展的过程中发现有的 API 并没有直接暴露，则可以试试本文所述方法，通过观察、修改、复用 Script Listener 录制的命令来达到想要的效果。当然，并不是所有被录制的动作都能还原。例如，将一个文件导出为 SVG 格式这个动作，虽然可以录制，但再次运行所得到的代码时会发现并不能将文件导出为 SVG。因此，在使用过程中还要多试错才行。
