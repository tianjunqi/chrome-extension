
function filterContent(){
    chrome.storage.local.get(["contentfilter_switch"], function(result) {
        var switchv = result.contentfilter_switch;
        if(switchv === "YES") {
            chrome.storage.local.get(["adintercept_data_content"], function(result2) {
                var filter_content = result2.adintercept_data_content;
                if(filter_content){
                    var thurl = window.location.href;
                    var thurlReg = /^([^:]+):\/\/([^\\\/]+)([^\?\&\#\s]+)\/+/i;
                    var arrMat = thurl.match(thurlReg);
                    var arrContent = JSON.parse(filter_content);
                    for (var i = 0; i < arrContent.length; i++) {
                        var temArr = arrContent[i].split("`");
                        var re = false;
                        if (temArr[0] !== "*"){
                            var domReg = new RegExp(temArr[0],'i');
                            if (domReg.test(arrMat[0]) || domReg.test(arrMat[1]) || domReg.test(arrMat[2])) {
                                re = true;
                            }else{
                                re = false;
                            }
                        }else{
                            re = true;
                        }
                        if(re){
                            pageTagContentRemove(temArr[1], null);
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
        }
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
        console.log(obj);
        obj.parentNode.removeChild(obj);
    }
}
function pageTagContentRemove(lstr, parobj) {
    var arr1 = lstr.split("~");
    var len = arr1.length;
    // noinspection LoopStatementThatDoesntLoopJS
    for (var i=0; i<len; i++) {
        var temstr = arr1[i];
        var thtemarr = temstr.split("$");
        var thobj;
        if(thtemarr[0] === "obj"){
            var thtm2 = thtemarr[1].split("=");
            if(thtm2[0] === "id"){
                parobj = document.getElementById(thtm2[1]);
            }else{
                // parobj = getElementsByClassName(thtm2[1]);
                var arCObj = getElementsByClassName(thtm2[1]);
                parobj = null;
                if(arCObj){
                    parobj = arCObj[0];
                    parobj = parobj?parobj:null;
                }
            }
            thobj = parobj;
        }
        if(thtemarr[0] === "text" && thtemarr.length>3){
            // console.log("aa--11");
            return textFiter(thtemarr);
        }
        if(thtemarr[0] === "textad"){
            //return textAdFiter(thtemarr);
        }
        if (i === len-1 || thtemarr[0] === "text"){

            if(thobj) {
                return removeNode(thobj);
            }
            if(thtemarr[0] === "text"){
                if (!parobj) {
                    //parobj = document.body;
                    parobj = document.getElementsByTagName('html')[0];
                }
                var subStr=new RegExp(thtemarr[1], "igm");
                var content = parobj.innerHTML;
                parobj.innerHTML = content.replace(subStr,"");
            }

            return true;
        }else{
            return selObj(arr1[i+1], parobj);
        }
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
        var tReg = /(id=[\S]*)|(class=[\S]*)/i;
        var arrMat = stext.match(tReg);
        if (arrMat) {
            var tmarr = arrMat[0].split("=");
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
        }


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
        //console.log(stnum);

        var qzNum = subMatchTag(preArr, stnum, false);
        var hzNum = subMatchTag(sufArr, stnum, true);
        //console.log(qzNum)
        //console.log(hzNum);
        //console.log("---")
        if(qzNum>0 && qzNum>0){
            //console.log(qzNum + "   "+ qzNum);
            var mhText = htmlText.substring(qzNum,hzNum);
            //console.log(mhText);
            document.getElementsByTagName('html')[0].innerHTML = htmlText.replace(mhText,"");
        }

    }while (true);

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
window.setTimeout("filterContent()", 300);
