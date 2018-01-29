(function(win, doc){
  const url4PC = 'https://api.map.baidu.com/api?v=2.0&ak=K4lj4WauSIagEIiRkVY0lVt6IGgR6WM4&callback=init';
  const init = win.init;
  const interval = 3000;

  // 在搜索时暂停
  let isUpdate = true;
  let timer = null;
  let map = null;

  // 为了能成功调用到callback
  win.init = () => {
    map = new BMap.Map('map');
    map.centerAndZoom("北京", 12);
    map.enableScrollWheelZoom(true);
    map.addEventListener("click", event => {
      doc.getElementById('position').blur();
    });
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
          timer = setTimeout(getCurrentLocation, interval);
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
          map.centerAndZoom(res, 18);
          map.addOverlay(new BMap.Marker(res));
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

  function loadMap() {
    const script = doc.createElement('script');
    script.src = url4PC;
    doc.body.appendChild(script);
  }

  function pauseUpdate() {
    clearTimeout(timer);
    isUpdate = false;
  }

  win.onload = loadMap;
})(window, document)