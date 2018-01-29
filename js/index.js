(function(win, doc){
  const url4PC = "https://api.map.baidu.com/api?v=2.0&ak=K4lj4WauSIagEIiRkVY0lVt6IGgR6WM4&callback=init";
  const STORAGE_KEY = "Distance_beacon_nodes";
  const init = win.init;
  const INTERVAL = 3000;

  let map = null;
  // 导入持久化的Beacon点
  let beaconNodes = [];
  // 序列号，永远是第一个可用的id
  let seq = 1;
  // 在搜索时暂停
  let isUpdate = true;
  let timer = null;

  // 为了能成功调用到callback
  win.init = () => {
    map = new BMap.Map('map');
    map.centerAndZoom("北京", 12);
    map.enableScrollWheelZoom(true);
    initMap();
    getCurrentLocation();
    initSearchLocation();
    win.init = init;
  } 

  // 获取当前位置
  function getCurrentLocation() {
    const location = new BMap.Geolocation();
    location.getCurrentPosition(res => {
      if (res) {
        // 自定义图标
        const icon = new BMap.Icon("imgs/circle.png", new BMap.Size(40, 40));
        const mark = new BMap.Marker(res.point, { icon });
        map.clearOverlays();
        map.addOverlay(mark);
        map.panTo(res.point);
        if (isUpdate) {
          timer = setTimeout(getCurrentLocation, INTERVAL);
        }
      } else {
        alert('无法获取当前位置');
      }
    },{enableHighAccuracy: true});
  }

  // 搜索目标位置
  function initSearchLocation() {
    // 工厂方法，每次聚焦时新创建一个AutoComplete对象
    function setAutoComplete() {
      const lastVal = doc.getElementById('position').value.trim();
      // 建立一个自动完成的对象
      const searchBox = new BMap.Autocomplete({
        input: "position",
        location: map
      });

      doc.getElementById('position').value = lastVal;

      // 鼠标放在下拉列表上的事件
      // searchBox.addEventListener("onhighlight", function(e) {
      // });

      // 鼠标点击下拉列表后的事件
      searchBox.addEventListener("onconfirm", event => {
        const value = event.item.value;
        const searchWord = `${value.province}${value.city}${value.district}${value.street}${value.business}`;
        setPlace(searchWord);
      });
    }

    function setPlace(searchWord){
      map.clearOverlays();
      // 搜索
      const cleverSearch = new BMap.LocalSearch(map, {
        onSearchComplete: () => {
          pauseUpdate();
          if (!cleverSearch.getResults().getPoi(0)) {
            alert('未找到指定地点，换个关键词试试？');
            return;
          }
          // 获取第一个智能搜索的结果
          const res = cleverSearch.getResults().getPoi(0).point;
          const marker = new BMap.Marker(res);
          map.centerAndZoom(res, 18);
          map.addOverlay(marker);
          // 增加点击事件
          marker.addEventListener('click', event => { addToBeacons(marker.getPosition()); });
        }
      });
      cleverSearch.search(searchWord);
    }

    // 不使用自动补全，直接回车或点击图标
    doc.getElementById("position").addEventListener("keyup", event => {
      if (event.keyCode !== 13) {
        return;
      }
      const searchWord = event.target.value.trim();
      searchWord && setPlace(searchWord);
    });

    doc.getElementById("position").addEventListener("focus", event => {
      setAutoComplete();
    });

    doc.getElementById("searchBtn").addEventListener("click", event => {
      const searchWord =  doc.getElementById("position").value.trim();
      searchWord && setPlace(searchWord);
    });
  }

  // 从页面新增目标点
  function addToBeacons(point) {
    let tag = win.prompt("给Beacon点起个名字吧");
    if (tag === null) {
      return;
    }
    tag = tag.trim().substr(0, 20) || `未知地点#${seq}`;
    // 第一个点默认活跃
    beaconNodes.push({
      id: seq,
      point,
      tag,
      isActive: !beaconNodes.length
    });
    addBeacon(seq, point, tag, beaconNodes.length === 1);
    paintDropdown();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beaconNodes));
  }

  function removeFromBeacon(id) {
    if (!beaconNodes.length) {
      return;
    }
    beaconNodes.splice(beaconNodes.findIndex(node => node.id == id), 1);
    paintDropdown();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beaconNodes));
  }

  // 在地图上新增目标点，方便复用
  function addBeacon(id, point, tag, isActive) {
    const icon = new BMap.Icon(`imgs/location-${2-isActive}.png`, new BMap.Size(50, 50));
    const mark = new BMap.Marker(point, { icon, enableMassClear: false });
    const label = new BMap.Label(tag,{ offset: new BMap.Size(32, 2) });
    label.setStyle({
      border: "#dedede",
      padding: "3px 5px",
      "font-size": "14px",
      "font-weight": "bold"
    });
    mark.setLabel(label); 
    mark.getLabel().setTitle(tag);
    mark.addEventListener('click', event => {
      if (win.confirm(`确认要删除Beacon:${mark.getLabel().getTitle()}`)) {
        map.removeOverlay(mark);
        removeFromBeacon(id);
      }
    });
    map.addOverlay(mark);
    seq = id + 1;
  }

  function initDropdown() {
    paintDropdown(true);
    // 事件监听
    // ...
  }

  function paintDropdown(isInit) {
    // 位于dom.js中
    renderDropdown && renderDropdown(beaconNodes, document.getElementById('dropdown'), isInit);
  }

  function initMap() {
    // 根据storage填充地图
    // 注意这里必须使用Point类
    beaconNodes.forEach(node => {
      addBeacon(node.id, new BMap.Point(node.point.lng, node.point.lat), node.tag, node.isActive);
    });
    initDropdown();

    map.addEventListener("click", event => {
      doc.getElementById('position').blur();
    });
    // 避免和其他事件冲突，使用暂无占用的右键点击
    map.addEventListener("rightclick", event => {
      addToBeacons(event.point);
    });
    // 支持移动设备，长按
    map.addEventListener("longpress", event => {
      addToBeacons(event.point);
    })
    doc.getElementById("update").addEventListener("click", event => {
      isUpdate ? pauseUpdate() : restartUpdate();
    });
  }

  function prepareMap() {
    const script = doc.createElement('script');
    script.src = url4PC;
    doc.body.appendChild(script);
    // 异步下载脚本时，从localStorage中取历史Beacon点
    const nodesStr = win.localStorage.getItem(STORAGE_KEY) || "\"\"";
    try {
      beaconNodes = JSON.parse(nodesStr) || [];
    } catch(e) {
      console.warn(e);
    }
  }

  function pauseUpdate() {
    clearTimeout(timer);
    isUpdate = false;
    doc.getElementById("update").innerText = "开启位置更新";
  }

  function restartUpdate() {
    timer = setTimeout(getCurrentLocation, INTERVAL);
    isUpdate = true;
    doc.getElementById("update").innerText = "暂停位置更新";
  }

  win.onload = prepareMap;
})(window, document)