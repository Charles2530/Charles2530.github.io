!(function (e, t) {
  function n() {
    c(
      ".heart{width:10px;height:10px;position:fixed;background:#f00;transform:rotate(45deg);-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);pointer-events:none}.heart:after,.heart:before{content:'';width:inherit;height:inherit;background:inherit;border-radius:50%;-webkit-border-radius:50%;-moz-border-radius:50%;position:fixed}.heart:after{top:-5px}.heart:before{left:-5px}"
    );
    o();
    r();
  }

  function r() {
    for (var index = 0; index < d.length; index += 1) {
      if (d[index].alpha <= 0) {
        t.body.removeChild(d[index].el);
        d.splice(index, 1);
        index -= 1;
      } else {
        d[index].y -= 1;
        d[index].scale += 0.004;
        d[index].alpha -= 0.013;
        d[index].el.style.cssText =
          "left:" +
          d[index].x +
          "px;top:" +
          d[index].y +
          "px;opacity:" +
          d[index].alpha +
          ";transform:scale(" +
          d[index].scale +
          "," +
          d[index].scale +
          ") rotate(45deg);background:" +
          d[index].color +
          ";z-index:99999;pointer-events:none";
      }
    }
    e.requestAnimationFrame(r);
  }

  function o() {
    var t = "function" == typeof e.onclick && e.onclick;
    e.onclick = function (e) {
      t && t(e);
      i(e);
    };
  }

  function i(e) {
    var a = t.createElement("div");
    a.className = "heart";
    d.push({
      el: a,
      x: e.clientX - 5,
      y: e.clientY - 5,
      scale: 1,
      alpha: 1,
      color: s()
    });
    t.body.appendChild(a);
  }

  function c(e) {
    var a = t.createElement("style");
    a.type = "text/css";
    try {
      a.appendChild(t.createTextNode(e));
    } catch (t) {
      a.styleSheet.cssText = e;
    }
    t.getElementsByTagName("head")[0].appendChild(a);
  }

  function s() {
    return (
      "rgb(" +
      ~~(255 * Math.random()) +
      "," +
      ~~(255 * Math.random()) +
      "," +
      ~~(255 * Math.random()) +
      ")"
    );
  }

  var d = [];
  e.requestAnimationFrame =
    e.requestAnimationFrame ||
    e.webkitRequestAnimationFrame ||
    e.mozRequestAnimationFrame ||
    e.oRequestAnimationFrame ||
    e.msRequestAnimationFrame ||
    function (e) {
      setTimeout(e, 1e3 / 60);
    };
  n();
})(window, document);
