// API Key
let apiKey = 'ee61b16184e1495892d5984cbe6581c9'; // 替换为你的API Key

// 预警类型和颜色的映射关系
const warningImageMap = {
    "台风蓝色": "TYblue.jpg",
    "台风黄色": "TYyellow.jpg",
    "台风橙色": "TYorange.jpg",
    "台风红色": "TYred.jpg",

    "雷电黄色": "thunderYellow.jpg",
    "雷电红色": "thunderRed.jpg",

    "暴雪蓝色": "snowBlue.jpg",
    "暴雪黄色": "snowYellow.jpg",
    "暴雪橙色": "snowOrange.jpg",
    "暴雪红色": "snowRed.jpg",

    "沙尘暴黄色": "sandYellow.jpg",
    "沙尘暴橙色": "sandOrange.jpg",
    "沙尘暴红色": "sandRed.jpg",

    "道路结冰黄色": "roadIcingYellow.jpg",
    "道路结冰橙色": "roadIcingOrange.jpg",
    "道路结冰红色": "roadIcingRed.jpg",

    "暴雨蓝色": "rainBlue.jpg",
    "暴雨黄色": "rainYellow.jpg",
    "暴雨橙色": "rainOrange.jpg",
    "暴雨红色": "rainRed.jpg",

    "高温黄色": "heatYellow.jpg",
    "高温橙色": "heatOrange.jpg",
    "高温红色": "heatRed.jpg",

    "霾黄色": "hazeYellow.jpg",
    "霾橙色": "hazeOrange.jpg",

    "冰雹橙色": "hailOrange.jpg",
    "冰雹红色": "hailRed.jpg",

    "大风蓝色": "galeBlue.jpg",
    "大风黄色": "galeYellow.jpg",
    "大风橙色": "galeOrange.jpg",
    "大风红色": "galeRed.jpg",

    "霜冻蓝色": "frostBlue.jpg",
    "霜冻黄色": "frostYellow.jpg",
    "霜冻橙色": "frostOrange.jpg",

    "大雾黄色": "fogYellow.jpg",
    "大雾橙色": "fogOrange.jpg",
    "大雾红色": "fogRed.jpg",

    "干旱橙色": "droughtOrange.jpg",
    "干旱红色": "droughtRed.jpg",

    "寒潮蓝色": "coldBlue.jpg",
    "寒潮黄色": "coldYellow.jpg",
    "寒潮橙色": "coldOrange.jpg",
    "寒潮红色": "coldRed.jpg",

  };

// 提取预警信息中的预警类型，如“大风蓝色”
function extractWarningType(warningTitle) {
    // 使用正则表达式匹配”发布“后面的文字，直到末尾的”预警“前面的文字
    const regex = /发布(.*)预警/;
    const match = warningTitle.match(regex);

    // 如果匹配成功，返回第一个捕获组（即预警类型）；否则返回空字符串
    if (match && match[1]) {
        return match[1].trim(); // 去掉可能的前后空格
    } else {
        return ''; // 如果没有匹配成功，返回空字符串
    }
}

// 获取预警信息并在地图上显示
async function fetchWarnings(lon, lat) {
  try {
    const response = await axios.get('https://devapi.qweather.com/v7/warning/now', {
      params: {
        key: apiKey,
        location: `${lon},${lat}`,
        lang: 'zh'
      }
    });

    if (response.data && Array.isArray(response.data.warning) && response.data.warning.length > 0) {
      console.log('response.data:', response.data);
      const warnings = response.data.warning;
      displayWarningsOnMap(warnings, lat, lon);
      
      const warningInfoDiv = document.getElementById('warningInfo'); // 获取 warningInfo div
      warningInfoDiv.style.display = 'block'; // 显示 warningInfo div
      displayWarnings(warnings); // 显示预警信息

      return warnings;
    } else {
      console.log("没有可用的预警信息");
      const warningInfoDiv = document.getElementById('warningInfo'); // 获取 warningInfo div
      warningInfoDiv.style.display = 'none'; // 隐藏 warningInfo div
    }
  } catch (error) {
    console.error('Error fetching warnings:', error);
    const warningInfoDiv = document.getElementById('warningInfo'); // 获取 warningInfo div
    warningInfoDiv.style.display = 'none'; // 隐藏 warningInfo div
    return []; // 返回空数组以防出错
  }
}


async function displayWarnings(warnings) {
  const warningInfoDiv = document.getElementById('warningInfo'); // 获取对应的 div

  // 清空 div 内容
  warningInfoDiv.innerHTML = '';

  // 判断 warnings 数组是否有数据
  if (warnings.length > 0) {
    warnings.forEach((warning) => {
      const warningElement = document.createElement('div');
      warningElement.innerHTML = `
        <p><strong>预警类型:</strong> ${warning.title}</p>
        <p><strong>预警信息:</strong> ${warning.text}</p>
      `;
      warningInfoDiv.appendChild(warningElement); // 将新元素添加到 div 中
    });
  } else {
    warningInfoDiv.innerHTML = '<p>没有可用的预警信息</p>'; // 如果没有数据，显示提示信息
  }
}



function getMostSevereWarning(warnings) {
    const severityRank = {
      'White': 1,
      'Blue': 2,
      'Green': 3,
      'Yellow': 4,
      'Orange': 5,
      'Red': 6,
      'Black': 7
    };
  
    // 初始化为最轻的预警
    let mostSevereWarning = warnings[0];
  
    // 遍历所有预警，找到最严重的预警
    warnings.forEach(warning => {
      const currentSeverity = severityRank[warning.severityColor] || 0;
      const mostSevereSeverity = severityRank[mostSevereWarning.severityColor] || 0;
      if (currentSeverity > mostSevereSeverity) {
        mostSevereWarning = warning;
      }
    });
    return mostSevereWarning;
}


function displayWarningsOnMap(warnings, lat, lon) {
  let warningsPopupContent = '';
  warnings.forEach(warning => {
    // warningsPopupContent += `<b>预警类型:</b> ${warning.title}<br><b>预警信息:</b> ${warning.text}<br><br>`;
    warningsPopupContent += `
    <img src="assets/warningSignal/${warningImageMap[extractWarningType(warning.title)]}" alt="${warning.title}" width="50" height="50"> <br> 
                                <br>`;
  });

  // 找到最严重的预警
  const mostSevereWarning = getMostSevereWarning(warnings);

  // 获取该最严重预警的颜色
  const warningColor = mostSevereWarning.severityColor || '#CC0000'; // 如果没有指定颜色，使用默认颜色

// 创建自定义图标，使用HTML和CSS
var customIcon = L.divIcon({
    className: 'custom-marker',  // 自定义类名，可以在CSS中定义样式
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${warningColor.toLowerCase()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
        <path d="M21 10c0 8.837-9 13-9 13S3 18.837 3 10a9 9 0 1 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>`,
      iconSize: [20, 20],  // 图标大小
    popupAnchor: [0, -10]  // 弹出框的位置
  });

  // 使用自定义图标创建标记
  var currentWarningMarker = L.marker([lat, lon], { icon: customIcon })
    .addTo(map)
    .bindPopup(warningsPopupContent)
    .openPopup();

  // 监听弹出关闭事件，关闭时移除标记
  currentWarningMarker.on('popupclose', function () {
    map.removeLayer(currentWarningMarker);
  });
}

// 用户点击地图时获取当前位置的预警信息
window.onload = function() {
  // 确保地图已经加载
  if (window.map && !window.map._warnClickBound) {
    window.map.on('contextmenu', function (e) {
      let lat = e.latlng.lat;
      let lon = e.latlng.lng;
      displayWarnings(lon, lat); // 更新为调用 displayWarnings
    });
    
    // 标记已绑定事件，防止重复绑定
    window.map._warnClickBound = true;
  } else if (!window.map) {
    console.error('Map is not initialized.');
  }
};
  
