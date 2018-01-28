(function(win, doc){
  const url4PC = 'https://api.map.baidu.com/api?v=2.0&ak=K4lj4WauSIagEIiRkVY0lVt6IGgR6WM4&callback=init';
  const init = window.init;
  // const interval = 500000;
  let map = null;

  // 为了能成功调用到callback
  window.init = () => {
    map = new BMap.Map('map');
    map.centerAndZoom(new BMap.Point(121.491, 31.233), 11);
    map.enableScrollWheelZoom(true);
    getCurrentLocation();
    window.init = init;
  } 

  // 获取当前位置
  function getCurrentLocation() {
    const location = new BMap.Geolocation();
    location.getCurrentPosition(res => {
      if (res) {
        const mark = new BMap.Marker(res.point);
        map.addOverlay(mark);
        map.panTo(res.point);
        // setTimeout(getCurrentLocation(), interval);
      } else {
        alert('无法获取当前位置');
      }
    },{enableHighAccuracy: true});
  }

  function loadMap() {
    const script = document.createElement('script');
    script.src = url4PC;
    document.body.appendChild(script);
  }

  window.onload = loadMap;
})(window, document)