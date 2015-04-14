$(function() {
  var pageWrapperInsetTop = 56;
  var scrollTop = 0;

  function syncCanvasPosition() {
    scrollTop = $(window).scrollTop();
    var insetTop = pageWrapperInsetTop - scrollTop;
    // if (insetTop < 0) { insetTop = 0; }
    $('#canvas')
      .css('-webkit-transform', 'translatey(' + insetTop.toString() + 'px)')
      .css('transform', 'translatey(' + insetTop.toString() + 'px)');
  }

  function initBlurEffect() {
    html2canvas($('.page-wrapper'), {
      onrendered: function(canvas) {
        $('.blur-header').append(canvas);
        $('canvas').attr('id', 'canvas');
        stackBlurCanvasRGB('canvas', 0, 0, $('#canvas').width(), $('#canvas').height(), 8);
        syncCanvasPosition();
        $(window).scrollTop(scrollTop);
      }
    });

    $(window).scroll(syncCanvasPosition);
  }

  function isInternetExplorer() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
      return true;
    else
      return false;
  }

  if (!isInternetExplorer()) {
    initBlurEffect();
  }
});