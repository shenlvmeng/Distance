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

