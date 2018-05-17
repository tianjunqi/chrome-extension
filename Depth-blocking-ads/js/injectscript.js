
function filterContent(){
    chrome.storage.local.get(["copy_switch"], function(result) {
        var switchv = result.copy_switch;
        if(switchv !== "YES") {
            return;
        }

        (function() { function R(a){ona = "on"+a; if(window.addEventListener) window.addEventListener(a, function (e) { for(var n=e.originalTarget; n; n=n.parentNode) n[ona]=null; }, true); window[ona]=null; document[ona]=null; if(document.body) document.body[ona]=null; } R("contextmenu"); R("click"); R("mousedown"); R("mouseup"); R("selectstart");})()

    });

    chrome.storage.local.get(["contentfilter_switch"], function(result) {
        var switchv = result.contentfilter_switch;
        if(switchv !== "YES") {
            return;
        }
        chrome.storage.local.get(["adintercept_data_content"], function (result2) {
            var filter_content = result2.adintercept_data_content;
            if (filter_content) {
                var thurl = window.location.href;
                var thurlReg = /^([^:]+):\/\/([^\\\/]+)([^\?\&\#\s]+)\/+/i;
                var arrMat = thurl.match(thurlReg);
                var arrContent = JSON.parse(filter_content);
                for (var i = 0; i < arrContent.length; i++) {
                    var temArr = arrContent[i].split("`");
                    var re = false;
                    if (temArr[0] !== "*") {
                        var domReg = new RegExp(temArr[0], 'i');
                        if (domReg.test(arrMat[0]) || domReg.test(arrMat[1]) || domReg.test(arrMat[2])) {
                            re = true;
                        } else {
                            re = false;
                        }
                    } else {
                        re = true;
                    }
                    if (re) {

                        var outtimenum = temArr[2] ? parseInt(temArr[2]) : 0;
                        if (outtimenum) {
                            window.setTimeout("pageTagContentRemove('" + temArr[1] + "')", outtimenum);
                        } else {
                            pageTagContentRemove(temArr[1]);
                        }

                    }
                    /*
                    var domReg = new RegExp(arrContent[i],'i');

                    if (domReg.test(arrMat[0]) || domReg.test(arrMat[1]) || domReg.test(arrMat[2])) {
                        return 2;
                    }
                    */
                }
            }
        });

    });
}
/*
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});
*/

function getElementsByClassName(n) {
    var classElements = [],allElements = document.getElementsByTagName('*');
    for (var i=0; i< allElements.length; i++ )
    {
        if (allElements[i].className == n ) {
            classElements[classElements.length] = allElements[i];
        }
    }
    if(classElements.length === 0){
        return null;
    }
    return classElements;
}
function removeNode(obj) {
    if(obj){
        console.log("blocking-ad-context: ", obj);
        obj.parentNode.removeChild(obj);
    }
}
function pageTagContentRemove(lstr) {
    var arr1 = lstr.split("~");
    var len = arr1.length;
    var parobj=[];
    // noinspection LoopStatementThatDoesntLoopJS
    for (var i=0; i<len; i++) {
        var temstr = arr1[i];
        var thtemarr = temstr.split("$");
        var thobj;
        if(thtemarr[0] === "obj"){
            var thtm2 = thtemarr[1].split("=");
            if(thtm2[0] === "id"){
                parobj[0] = document.getElementById(thtm2[1]);
            }else{
                // parobj = getElementsByClassName(thtm2[1]);
                var arCObj = getElementsByClassName(thtm2[1]);
                //parobj = null;
                if(arCObj){
                    //console.log(arCObj);
                    //parobj = arCObj[0];
                    //parobj = parobj?parobj:null;
                    parobj=arCObj;
                }
            }
            thobj = parobj;
        }
        if(thtemarr[0] === "comad"){
            comadFiter(temstr);
            return;
        }
        if(thtemarr[0] === "soad"){
            soadFiter(temstr);
            return;
        }
        if(thtemarr[0] === "text" && thtemarr.length>3){
            // console.log("aa--11");

            return textFiter(thtemarr);
        }
        if(thtemarr[0] === "iframe") {
            return iframeFiter(thtemarr);
        }
        if(thtemarr[0] === "textad"){
            //return textAdFiter(thtemarr);
        }
        //console.log(thobj);
        if (i === len-1 || thtemarr[0] === "text"){

            if(thobj.length>0){
                for (var q=0;q<thobj.length;q++){
                    return removeNode(thobj[q]);
                }
            }
            //if(thobj) {
            //    return removeNode(thobj);
            //}
            /*
            if(thtemarr[0] === "text"){
                if (!parobj) {
                    //parobj = document.body;
                    parobj = document.getElementsByTagName('html')[0];
                }
                var subStr=new RegExp(thtemarr[1], "igm");
                var content = parobj.innerHTML;
                parobj.innerHTML = content.replace(subStr,"");
            }
            */
            return true;
        }else{
            //return selObj(arr1[i+1], parobj);
        }
    }
}
function iframeFiter(thtemarr) {
    if (self === top) {
        return false;
    }
    //
    //匹配域名`iframe$匹配的内容`延时执行时间毫秒
    //例：*`iframe$<title>网盟推广</title>`100
    var searchTagName = thtemarr[1];
    var htmlText = document.getElementsByTagName('html')[0].innerHTML;
    var stnum = htmlText.indexOf(searchTagName);
    if(stnum>0) {
        document.body.innerHTML="";
    }

}
function textFiter(thtemarr){
    // console.log(thtemarr);
    var stnum = 0, stnum2 = 0;
    // var nnum=0;
    // var arrStnum = [];
    var searchStr = thtemarr[1];
    var nextSearchStr = thtemarr[2];
    var nntextStrNum = parseInt(thtemarr[3]);
    var htmlText = document.getElementsByTagName('html')[0].innerHTML;
    do {
        if (stnum < 0) {
            break;
        }
        //nnum = nnum+1;
        stnum = searchStr.length + stnum;
        stnum = htmlText.indexOf(searchStr, stnum);
        if (stnum < 0) {
            break;
        }
        stnum2 = nextSearchStr.length + stnum + stnum2;
        stnum2 = htmlText.indexOf(nextSearchStr, stnum2);
        if(stnum2 < 0){
            continue;
        }
        var stext = htmlText.substr(stnum2, nntextStrNum);
        //var tReg = /(id=[\S]*)|(class=[\S]*)/i;
        var tReg = /(id=[\S]*["|'])|(class=[\S]*["|'])/gi;
        var arrMat = stext.match(tReg);

        if(!arrMat || arrMat.length<=0){
            continue;
        }
        var objidstr,objclassstr;
        var arr01 = arrMat[0].split("=");
        if(arr01[0] === "id"){
            objidstr = arr01[1];
        }else if(arr01[0] === "class"){
            objclassstr = arr01[1];
        }
        if(arrMat.length>1&&arrMat[1]){
            var arr02 = arrMat[1].split("=");
            if(arr02[0] === "id"){
                objidstr = arr02[1];
            }else if(arr02[0] === "class"){
                objclassstr = arr02[1];
            }
        }
        if(objidstr){
            var sidname = objidstr.replace(/["']/g, "");
            removeNode(document.getElementById(sidname));
        }else if(objclassstr) {
            var csname = objclassstr.replace(/["']/g, "");
            if(!csname){
                continue;
            }
            var arrObj = getElementsByClassName(csname);
            if (arrObj) {
                for (var m = 0; m < arrObj.length; m++) {
                    removeNode(arrObj[m]);
                }
            }
        }


        /*
        var isidtag = false;
        var tmarr;
        if (arrMat[0]) {
            tmarr = arrMat[0].split("=");
            if (tmarr[0].toLocaleLowerCase() === "id") {
                isidtag = true;
            }
        }
        if (arrMat[1] && !isidtag) {
            tmarr = arrMat[1].split("=");
        }
        if (tmarr) {
            var tgname = tmarr[1].replace(/\"/g, "");
            if (tmarr[0].toLocaleLowerCase() === "id") {
                removeNode(document.getElementById(tgname));
            } else if (tmarr[0].toLocaleLowerCase() === "class") {
                var arrObj = getElementsByClassName(tgname);
                if (arrObj) {
                    for (var m = 0; m < arrObj.length; m++) {
                        removeNode(arrObj[m]);
                    }
                }
            }
        }
        */

        /*
        var tmarr = arrMat[0].split("=");
        //console.log(tmarr);
        var tgname = tmarr[1].replace(/\"/g, "");
        if (tmarr[0].toLocaleLowerCase() === "id") {
            removeNode(document.getElementById(tgname));
        } else if (tmarr[0].toLocaleLowerCase() === "class") {
            var arrObj = getElementsByClassName(tgname);
            if(arrObj){
                for (var m = 0; m < arrObj.length; m++) {
                    removeNode(arrObj[m]);
                }
            }
        }
        */



        //arrStnum[nnum] = stnum;
    } while (true);
}
function textAdFiter(thtemarr) {
    // div>p>span^xxx^span>p>div
    var arrMah = thtemarr[1].split("^");
    var preArr = arrMah[0].split(">");
    var medStr = arrMah[1];
    var sufArr = arrMah[2].split(">");
    var stnum = 0;
    var htmlText = document.getElementsByTagName('html')[0].innerHTML;
    do {
        stnum = medStr.length + stnum;
        stnum = htmlText.indexOf(medStr, stnum);
        if (stnum < 0) {
            break;
        }
        var qzNum = subMatchTag(preArr, stnum, false);
        var hzNum = subMatchTag(sufArr, stnum, true);
        if(qzNum>0 && qzNum>0){
            var mhText = htmlText.substring(qzNum,hzNum);
            document.getElementsByTagName('html')[0].innerHTML = htmlText.replace(mhText,"");
        }

    }while (true);

}

function comadFiter(thtemstr){
    var thtemarr = thtemstr.split("$");
    var sObj=[];
    var arrSelStr = thtemarr[1].split("&");
    var s_tagname=null,s_textcontent=null,s_parent=null;
//console.log(arrSelStr);
    for (var i=0;i<arrSelStr.length;i++) {
        var tema = arrSelStr[i].split("=");
        var skname = tema[0].toLocaleLowerCase();
        var skvalue = tema[1];
        if( skname === "class"){
            sObj = getElementsByClassName(skvalue);
            //console.log(sObj);
            if(!sObj){
                continue;
            }
            continue;
        }else if( skname === "id"){
            sObj[0] = document.getElementById(skvalue);
            if(!sObj[0]){
                continue;
            }
            continue;
        }
        if(skname !== "tagname" && skname !== "textcontent" && skname !== "parent"){
            return;
        }
        if (skname === "tagname"){
            s_tagname = skvalue;
        }else if(skname === "textcontent"){
            s_textcontent = skvalue;
        }else if(skname === "parent"){
            s_parent = skvalue;
        }


    }

    //console.log(sObj);
    if (!sObj||s_parent==null||(s_tagname==null&&s_textcontent==null)) {
        return;
    }
    var s0=false;
    for (var u=0;u<sObj.length;u++){
        var onObj = sObj[u];
        if(s_tagname){
            s0 = true;
            if(onObj.tagName !== s_tagname.toLocaleUpperCase()){
                continue;
            }
        }
        if(s_textcontent){
            s0 = true;
            var onTextConten = onObj.textContent;
            //console.log(onObj);
            if(onTextConten.indexOf(s_textcontent) < 0)
            {
                continue;
            }
        }
        if(!s0){
            return;
        }

        var pint = parseInt(s_parent);
        if (pint === 0) {
            removeNode(onObj);
        } else if (pint > 0) {
            var ssObj = onObj;
            for (; pint > 0; pint--) {
                if (!ssObj.parentElement) {
                    return;
                }
                ssObj = ssObj.parentElement;
            }
            if (ssObj) {
                removeNode(ssObj);
            }
        } else {
            return;
        }

    }
}
function soadFiter(thtemstr){
    // soad$<a[^>]+>广告<\/a>/ig$parent_num$outTime
    // parent_num父级层次，2=父级的父级；outTime延迟执行的时间
    var thtemarr = thtemstr.split("$");

    var tReg = /(id=[\S]*["|'])|(class=[\S]*["|'])/gi;
    var htmlText = document.getElementsByTagName('html')[0].innerHTML;
    var subStr=new RegExp(thtemarr[1], "igm");
    var s_parent = parseInt(thtemarr[2]);
    var mhd  = htmlText.match(subStr);
    for (var i=0;i<mhd.length;i++) {
        if(!mhd[i]){
            continue;
        }
        var arrMat = mhd[i].match(tReg);
        if(!arrMat || arrMat.length<=0){
            continue;
        }
        var objidstr,objclassstr;
        var arr01 = arrMat[0].split("=");
        if(arr01[0] === "id"){
            objidstr = arr01[1];
        }else if(arr01[0] === "class"){
            objclassstr = arr01[1];
        }
        if(arrMat[1]){
            var arr02 = arrMat[1].split("=");
            if(arr02[0] === "id"){
                objidstr = arr02[1];
            }else if(arr02[0] === "class"){
                objclassstr = arr02[1];
            }
        }
        var arrObj = [];
        if(objidstr){
            objidstr = objidstr.replace(/["']/g, "");
            arrObj[0] = document.getElementById(objidstr);
        }else if(objclassstr){
            objclassstr = objclassstr.replace(/["']/g, "");
            arrObj = getElementsByClassName(objclassstr);
        }
        if(arrObj.length<1){
            continue;
        }
        for(var p=0;p<arrObj.length;p++){
            var onObj = arrObj[p];

            var pint = s_parent;
            if (pint === 0) {
                removeNode(onObj);
            } else if (pint > 0) {
                var ssObj = onObj;
                for (; pint > 0; pint--) {
                    if (!ssObj.parentElement) {
                        return;
                    }
                    ssObj = ssObj.parentElement;
                }
                if (ssObj) {
                    removeNode(ssObj);
                }
            } else {
                return;
            }
        }



    }

}

function subMatchTag(tagArr, sxtnum, hz){
    var htmlText = document.getElementsByTagName('html')[0].innerHTML;
    for (var i0=0;i0<tagArr.length;i0++){
        if(!tagArr[i0]) {
            continue;
        }
        //var preStr = htmlText.substr(stnum-subNumber, subNumber);
        if (sxtnum < 0){
            break;
        }
        if(hz){
            var snSufNum = htmlText.indexOf("<"+tagArr[i0]+" ", sxtnum+1);
            //console.log("www = " + snSufNum);
            if(snSufNum > 0){
                sxtnum = snSufNum;
            }else{
                sxtnum = -1;
            }
        }else{
            var snPreNum = htmlText.lastIndexOf("<"+tagArr[i0]+" ", sxtnum-1);
            //console.log("xxxx = " + snPreNum);
            if(snPreNum > 0){

                sxtnum = snPreNum;
            }else{
                sxtnum = -1;
            }
        }
    }
    return sxtnum;

}
/**
 url`type$strReg~.....
 url = match url
 type = obj object  or text
 strReg obj = tagName,class=name or id=name
 strReg text = start text ..... end text
 */
filterContent();
