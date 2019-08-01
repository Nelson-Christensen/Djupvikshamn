/* Contact Form Textarea auto-expand
    Taken from "Yair Even Or" https://codepen.io/vsync/pen/czgrf
*/

var textarea = document.querySelector("textarea");

textarea.addEventListener("keydown", autosize);
             
function autosize(){
    var el = this;
    setTimeout(function(){
        el.style.cssText = "height:auto;";
        var newHeight = parseFloat(el.scrollHeight) + parseFloat($(el).css("padding-top"));
        el.style.cssText = "height:" + newHeight + "px";
    },0);
}