var arrDataList;
var enable_blocking = "YES";
var disable_image = "NO";
var disable_xmlhttprequest = "NO";

function initvar(){
    var lsdata = localStorage["adintercept_data_list"];
    arrDataList = lsdata ? JSON.parse(lsdata) : null;
    enable_blocking = localStorage["blocking_switch"];
    disable_image = localStorage["image_switch"];
    disable_xmlhttprequest = localStorage["xmlhttprequest_switch"];
    if(!enable_blocking) {
        enable_blocking = "YES";
        localStorage["blocking_switch"] = "YES";
    }
    if (!disable_image) {
        disable_image = "NO";
    }
    if(!disable_xmlhttprequest) {
        disable_xmlhttprequest = "NO";
    }
}


function searchMatchUrl(url) {
    if(!arrDataList){
        return 0;
    }
    // var thurlReg = /^http[s]?:\/\/([^\\\/]+)([^\?\&\#\s]+)\/+/i;
    var thurlReg = /^([^:]+):\/\/([^\\\/]+)([^\?\&\#\s]+)\/+/i;
    var arrMat = url.match(thurlReg);
    if(!arrMat) {
        return 0;
    }
    if(arrMat[2] === "localhost" || arrMat[1] === "chrome-extension" || arrMat[1] === "data"){
        return 1;
    }
    for (var i = 0; i < arrDataList.length; i++) {
        var domReg = new RegExp(arrDataList[i],'i');
        if (domReg.test(arrMat[0]) || domReg.test(arrMat[1]) || domReg.test(arrMat[2])) {
            return 2;
        }
    }
    return 0;
}
initvar();
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    if(enable_blocking === "NO") {
        return {};
    }
    var mak = searchMatchUrl(details.url);
    if(mak === 1) {
        return {};
    }else if(mak === 2){
        return {cancel: true};
    }else if(mak === 0) {
        if(disable_image === "YES" && details.type === "image"){
            // return { redirectUrl: newUrl };
            var imgdata= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQImWP4DwQACfsD/eNV8pwAAAAASUVORK5CYII=";
            return { redirectUrl: imgdata };
        }
        //console.log(details);
        //console.log(details.requestBody);
        if(disable_xmlhttprequest === "YES" && details.type==="xmlhttprequest") {
            return { redirectUrl: "data:text/html;" };
        }
    }

}, {urls: ["<all_urls>"]}, ["blocking"]);

chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.create({ url: 'options.html' });
});
chrome.webRequest.onCompleted.addListener(function (details){
    if (details.type==="xmlhttprequest"){
        chrome.tabs.executeScript(null, {file: "js/injectscript.js", allFrames: true});
    }
},{urls: ["<all_urls>"]},["responseHeaders"]);
/*
chrome.webRequest.onResponseStarted.addListener(function (details){
    console.log("=======    ");
},{urls: ["<all_urls>"]},["responseHeaders"]);
*/

