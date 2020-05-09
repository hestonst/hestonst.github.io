var strings = ["Get free legal help"];


// function isAppleDevice() {
//   return (
//     (navigator.userAgent.toLowerCase().indexOf("ipad") > -1) ||
//     (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) ||
//     (navigator.userAgent.toLowerCase().indexOf("ipod") > -1)
//    );
// }
// if (isAppleDevice() {
//   $('body').addClass('is_apple')
// }


function load_Chinese() {
    // Adds an element to the document
    strings = ["获得免费的法律帮助"];
}

function load_Spanish() {
    // Adds an element to the document
    strings = ["Obtenga ayuda legal gratis"];
}

function load_Russian() {
    // Adds an element to the document
    strings = ["Получите бесплатную юридическую помощь"];
}

function load_English() {
    // Adds an element to the document
    strings = ["Get free legal help"];
}

function update_language() {
  for (var i of [0]) {
    var elem = document.getElementsByClassName(i.toString());
    if (elem.length > 0) {
      elem[0].innerHTML = strings[i.toString()];
    }
  }

}
