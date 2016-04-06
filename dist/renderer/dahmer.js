"use strict";

module.exports.setTransition = function (el, transition) {
  //el.style.setProperty('-moz-transition', transition);
  //el.style.setProperty('-ms-transition', transition);
  //el.style.setProperty('-o-transition', transition);

  el.style.webkitTransition = transition;
  el.style.transition = transition;
};