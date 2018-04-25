// Saves options to localStorage.
var bgPage = chrome.extension.getBackgroundPage();
function save_options() {
    var data_text = $("#adintercept_data_list").val();
    localStorage["adintercept_data_list_src"] = data_text;
    var arrData = data_text.split('\n');
    var arrSaveData = [];
    var j = 0;
    for (var i = 0; i<arrData.length; i++) {
        var wll = arrData[i].replace(/[\s]/g,"");
        if (!wll || wll.indexOf('#') === 0){
            continue;
        }
        var lszs = wll.indexOf("#");
        if (lszs > 0 ) {
            wll = wll.substr(0,lszs);
        }
        wll = wll.replace(/\*/g,"[\\S]*");
        wll = wll.replace(/\./g,"\\.");
        wll = wll.replace(/\//g,"\\/");
        arrSaveData[j] = wll;
        j++;
    }
    var jsonstr = JSON.stringify(arrSaveData);
    console.log(jsonstr);

    localStorage["adintercept_data_list"] = jsonstr;

    // Update status to let user know options were saved.
    var ojstatus = $("#status")
    ojstatus.html("Options Saved.");
    setTimeout(function() {
        ojstatus.html("");
    }, 750);
    bgPage.arrDataList = arrSaveData;
}

// Restores select box state to saved value from localStorage.
function restore_options() {

    var data_text = localStorage["adintercept_data_list_src"];
    if (data_text && data_text != null) {
        $("#adintercept_data_list").val(data_text);
    }
    data_text = localStorage["adintercept_data_content_src"];
    if (data_text && data_text != null) {
        $("#adintercept_data_content").val(data_text);
    }


    var blocking_sw = localStorage["blocking_switch"];
    if (blocking_sw !== "YES") {
        blocking_sw = "NO";
    }
    $("label[for=blocking_switch]").attr("data-sw", blocking_sw);
    if(blocking_sw === "YES"){
        $("#blocking_switch").attr("checked", true);
    }else{
        $("#blocking_switch").attr("checked", false);
    }

    var image_sw = localStorage["image_switch"];
    if (image_sw !== "YES") {
        image_sw = "NO";
    }
    $("label[for=image_switch]").attr("data-sw", image_sw);
    if(image_sw === "YES"){
        $("#image_switch").attr("checked", true);
    }else{
        $("#image_switch").attr("checked", false);
    }

    var xmlhttprequest_sw = localStorage["xmlhttprequest_switch"];
    if (xmlhttprequest_sw !== "YES") {
        xmlhttprequest_sw = "NO";
    }
    $("label[for=xmlhttprequest_switch]").attr("data-sw", xmlhttprequest_sw);
    if(xmlhttprequest_sw === "YES"){
        $("#xmlhttprequest_switch").attr("checked", true);
    }else{
        $("#xmlhttprequest_switch").attr("checked", false);
    }

    var contentfilter_sw = localStorage["contentfilter_switch"];
    if (contentfilter_sw !== "YES") {
        contentfilter_sw = "NO";
    }
    $("label[for=contentfilter_switch]").attr("data-sw", contentfilter_sw);
    if(contentfilter_sw === "YES"){
        $("#contentfilter_switch").attr("checked", true);
    }else{
        $("#contentfilter_switch").attr("checked", false);
    }

    //copy_switch
    var copy_sw = localStorage["copy_switch"];
    if (copy_sw !== "YES") {
        copy_sw = "NO";
    }
    $("label[for=copy_switch]").attr("data-sw", copy_sw);
    if(copy_sw === "YES"){
        $("#copy_switch").attr("checked", true);
    }else{
        $("#copy_switch").attr("checked", false);
    }


}
function testUrlData(){
    var vurl = $("#test_url_text").val();
    var objs = $("#test_status");
    if(bgPage.searchMatchUrl(vurl) === 2){
        objs.attr("class", "f_green");
        objs.html('Blocking success');
    }else{
        objs.attr("class", "f_red");
        objs.html('Blocking failure');
    }
}
function save_contentfilter() {
    var data_text = $("#adintercept_data_content").val();
    localStorage["adintercept_data_content_src"] = data_text;
    var arrData = data_text.split('\n');
    var arrSaveData = [];
    var j = 0;
    for (var i = 0; i<arrData.length; i++) {
        //var wll = arrData[i].replace(/[\s]/g,"");
        var wll = arrData[i];
        if (!wll){
            continue;
        }
        arrSaveData[j] = wll;
        j++;
    }
    var jsonstr = JSON.stringify(arrSaveData);
    console.log(JSON.stringify(jsonstr));
    // localStorage["adintercept_data_content"] = jsonstr;
    chrome.storage.local.set({"adintercept_data_content": jsonstr}, function() {
        console.log("local.set adintercept_data_content : "+ jsonstr);
    });

    /*
    chrome.storage.local.remove("adintercept_data_content", function () {

    });
    */

    // Update status to let user know options were saved.
    var ojstatus = $("#contentstatus")
    ojstatus.html("Options Saved.");
    setTimeout(function() {
        ojstatus.html("");
    }, 750);
    bgPage.setContentFilterList();
}
$(document).ready(function(){

    restore_options();
    $("#savebt").click(function(){
        save_options();
    });
    $("#testbt").click(function () {
        testUrlData();
    });
    $("#savecontentbt").click(function () {
        save_contentfilter();
    });
    $("label").click(function () {
        var tobj = $(this);
        var swname = tobj.attr("for");
        var swst = "YES";
        if(tobj.attr("data-sw") === "YES") {
            tobj.attr("data-sw", "NO");
            swst = "NO";
        }else{
            tobj.attr("data-sw", "YES");
        }
        localStorage[swname] = swst;
        switch(swname){
            case "blocking_switch":
                bgPage.enable_blocking = swst;
                break;
            case "image_switch":
                bgPage.disable_image = swst;
                break;
            case "xmlhttprequest_switch":
                bgPage.disable_xmlhttprequest = swst;
                break;
            case "contentfilter_switch":
                chrome.storage.local.set({"contentfilter_switch": swst}, function() {
                    console.log("local.set contentfilter_switch : "+ swst);
                });
                break;
            case "copy_switch":
                chrome.storage.local.set({"copy_switch": swst}, function() {
                    console.log("local.set copy_switch : "+ swst);
                });
        }
    });
    $("#depth_option_box").show(100);
});
