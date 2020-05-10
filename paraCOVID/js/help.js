var head = document.getElementsByClassName("myhead")[0];
var blurb = document.getElementsByClassName("blurb")[0];
blacken("homebutton");

function clearMain() {
    // Adds an element to the document
    console.log("clearing");
    var p = document.getElementsByClassName("del");
    for (var e of p) {
      e.style.display = "none";
    }
}

function aboutUs() {
    blacken("aboutbutton");
    document.getElementsByClassName("banner")[0].style.display = "none";
    document.getElementsByClassName("aboutus")[0].style.display = "";
}

function notAboutUs() {
  document.getElementsByClassName("banner")[0].style.display = "";
  document.getElementsByClassName("aboutus")[0].style.display = "none";
}

function home() {
    notAboutUs();
    blacken("homebutton");
    document.getElementById("demobutton").innerHTML = "Get Free Legal Help";
    current_form = 0;
    document.getElementsByClassName("unhideme")[0].style.display = "none";
    document.getElementsByClassName("fullform")[0].style.display = "none";
    update();
}

function for_attorneys() {
  home();
  notAboutUs();
  document.getElementById("demobutton").innerHTML = "Try Our Product Demo";
  head.innerHTML = "If your firm is offering pro bono services during COVID-19, we want to provide you with the best modern web tools to reach out to those in need.";
  blurb.innerHTML = "Try our demo to see how we can automate your paralegal services. Thank you for your services to communities in need during this unprecedented global pandemic.";
  blacken("attorneysbutton");
}

function blacken(page) {
  document.getElementById("homebutton").style.color="";
  document.getElementById("attorneysbutton").style.color="";
  document.getElementById("demobutton").style.color="";
  document.getElementById("aboutbutton").style.color="";
  document.getElementById(page).style.color="Black";
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
    blacken("homebutton");
    var p = document.getElementsByClassName("del");
    for (var e of p) {
      e.style.display = "";
    }
    head.innerHTML = "Hundreds of lawyers have offered their pro bono aid."
    blurb.innerHTML = "Get matched with free volunteer law groups near you."
    document.getElementsByClassName("unhideme")[0].style.display = "none";

  } else if (current_form == 1) {
    blacken("demobutton");
    console.log("1 entered");
    // Populate the form, display first information
    document.getElementsByClassName("unhideme")[0].style.display = "";
    head.innerHTML = "Connect with those in need via modern web forms available 24/7 on mobile or a computer: walk through an early demo of our website."
    blurb.innerHTML = "This demo will ask you for some basic information and then autofill a PDF with that information. You can use this functionality in the languages shown above. Our goal is to automate COVID-related paralegal work so that pro bono law groups can provide people with aid efficiently under duress in these dificult times."

  } else if (current_form == 2) {
    console.log("2 entered");
    head.innerHTML = '"Courage – you develop courage by doing small things like just as if you wouldn’t want to pick up a 100-pound weight without preparing yourself" --Maya Angelou'
    blurb.innerHTML = "We want to remind people in need of legal help that we are all in this pandemic together with positive language and quotes. Inability to access healthcare or legal resources due to barriers such as language and financial resources perpetuates disparities. ParaCOVID will connect individuals with legal resources in a culturally sensitive way, and facilitate the process of connecting individuals with guidance to address the stressors brought on by the pandemic’s impacts. "
    document.getElementsByClassName("fullform")[0].style.display = "none";
  } else if (current_form == 3) {
    head.innerHTML = "Enter your information for a demonstration of auto-filling forms for your clients."
    blurb.innerHTML = ""

    document.getElementsByClassName("fullform")[0].style.display = ""
  }

  }
