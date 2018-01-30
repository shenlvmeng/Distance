/*
 * 无状态，与业务弱相关
 * 只渲染下拉菜单
 */

function renderDropdown(obj, dom, isInit) {
  if (!obj) {
    return;
  }
  dom.innerText = "";
  // render过程
  const fragment = document.createDocumentFragment();
  obj.map(node => {
    const div = document.createElement('DIV');
    div.className = `node_wrapper${node.isActive ? " active" : ""}`;
    const innerHTML = `<span>#${node.id}</span><span class="node-tag">${node.tag}</span>`;
    div.innerHTML = innerHTML;
    const operateBtn = document.createElement('DIV');
    operateBtn.className = "operateBtn";
    if (node.isActive) {
      operateBtn.className += " active"
      operateBtn.innerText = "Deactive!"
    } else {
      operateBtn.innerText = "Active!"
    }
    div.appendChild(operateBtn);
    // 方便统一事件绑定
    div.dataset.nid = node.id;
    return div;
  }).forEach(div => {
    fragment.appendChild(div);
  });
  dom.appendChild(fragment);

  // 多次调用只监听一次
  if (isInit) {
    // 下拉事件
    dom.parentNode.children[0].addEventListener("click", event => {
      if (dom.parentNode.className.search("hide") !== -1) {
        dom.parentNode.className = "dropdown dropdown_container";
      } else {
        dom.parentNode.className += " hide";
      }
    });
  }
}

/*
 * 根据两点坐标计算近似角度值
 */

function getDirection(p1, p2) {
  const pi = Math.PI;
  const [x2, y2, x1, y1] = [p1.lng, p1.lat, p2.lng, p2.lat];
  let rad = Math.atan2(y2 - y1, x2 - x1);
  let absRad = Math.abs(rad);
  let clockPointer;
  if (absRad < pi / 12) {
    clockPointer = 3;
  } else if (absRad < pi / 4) {
    clockPointer = rad > 0 ? 2 : 4;
  } else if (absRad < pi * 5 / 12) {
    clockPointer = rad > 0 ? 1 : 5;
  } else if (absRad < pi * 7 / 12) {
    clockPointer = rad > 0 ? 12 : 6;
  } else if (absRad < pi * 3 / 4) {
    clockPointer = rad > 0 ? 11 : 7;
  } else if (absRad < pi * 11 / 12) {
    clockPointer = rad > 0 ? 10 : 8;
  } else {
    clockPointer = 9;
  }
  return clockPointer;
}
