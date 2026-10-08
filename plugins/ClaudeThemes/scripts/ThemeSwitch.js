var x1 = document.documentElement;
var thing = function () {
  var q = getComputedStyle(x1).getPropertyValue("--v-claude-base");
  if (q != undefined && q.trim() != "") {
    if (x1.classList.contains("claude-ui") == false) {
      x1.classList.add("claude-ui");
    }
  } else {
    if (x1.classList.contains("claude-ui") == true) {
      x1.classList.remove("claude-ui");
    }
  }
};
if (window.asdf123 != true) {
  window.asdf123 = true;
  var o = new MutationObserver(function (a, b) {
    thing();
  });
  o.observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  thing();
  setTimeout(thing, 500);
  setTimeout(thing, 2000);
}
