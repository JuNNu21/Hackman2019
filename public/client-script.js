function getCookie(a) {
    var b = decodeURIComponent(document.cookie).match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}