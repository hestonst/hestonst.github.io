var head = document.getElementsByClassName("myhead")[0];
var blurb = document.getElementsByClassName("blurb")[0];


function clearMain() {
    // Adds an element to the document
    console.log("clearing");
    var p = document.getElementsByClassName("del");
    for (var e of p) {
      e.style.display = "none";
    }
}

function aboutUs() {
    document.getElementsByClassName("banner")[0].style.display = "none";
    document.getElementsByClassName("aboutus")[0].style.display = "";
}

function notAboutUs() {
  document.getElementsByClassName("banner")[0].style.display = "";
  document.getElementsByClassName("aboutus")[0].style.display = "none";
}

function home() {
    notAboutUs();
    current_form = 0;
    document.getElementsByClassName("unhideme")[0].style.display = "none";
    document.getElementsByClassName("fullform")[0].style.display = "none";
    update();
}

function for_attorneys() {
  home();
  notAboutUs();
  head.innerHTML = "If your firm is offering pro bono services during COVID-19, we want to provide you with the best modern web tools to reach out to those in need.";
  blurb.innerHTML = "";
}


var current_form = 0

function back() {

  current_form -= 1;
  update();
}

function next() {
  current_form += 1;
  update()
}

var cont

function update() {
  notAboutUs();
  head = document.getElementsByClassName("myhead")[0];
  blurb = document.getElementsByClassName("blurb")[0];

  if (current_form == 0) {
    var p = document.getElementsByClassName("del");
    for (var e of p) {
      e.style.display = "";
    }
    head.innerHTML = "Hundreds of lawyers have offered their pro bono aid."
    blurb.innerHTML = "Get matched with free volunteer law groups near you."
    document.getElementsByClassName("unhideme")[0].style.display = "none";

  } else if (current_form == 1) {
    console.log("1 entered");
    // Populate the form, display first information
    document.getElementsByClassName("unhideme")[0].style.display = "";
    head.innerHTML = "Connect with those in need via modern web forms available 24/7 on mobile or a computer: walk through an early demo of our website."
    blurb.innerHTML = "This demo will ask you for some basic information and then autofill a PDF with that information. You can use this functionality in the languages shown above. Our goal is to automate COVID-related paralegal work so that pro bono law groups can provide people with aid efficiently under duress in these dificult times."

  } else if (current_form == 2) {
    console.log("2 entered");
    head.innerHTML = '"Courage – you develop courage by doing small things like just as if you wouldn’t want to pick up a 100-pound weight without preparing yourself" --Maya Angelou'
    blurb.innerHTML = "We're passionate about making an interface that is friendly and reaffirming because we believe many people are having to ask for help for the first time in their lives. We give you the tools to connect with populations in need no matter their language, struggles with homelessness, or the crisis they are facing."
    document.getElementsByClassName("fullform")[0].style.display = "none";
  } else if (current_form == 3) {
    head.innerHTML = "Enter your information for a demonstration of auto-filling forms for your clients."
    blurb.innerHTML = ""

    document.getElementsByClassName("fullform")[0].style.display = ""
  }

  }
