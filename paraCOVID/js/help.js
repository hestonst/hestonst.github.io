function clearMain() {
    // Adds an element to the document
    console.log("clearing");
    var p = document.getElementsByClassName("del");
    for (var e of p) {
      e.style.display = "none";
    }
}

var current_form = 0

function back() {
  // current_form -= 1;
}

var cont

function next() {
  var head = document.getElementsByClassName("myhead")[0];
  var blurb = document.getElementsByClassName("blurb")[0];
  if (current_form == 0) {
    console.log("0 entered");
    // Populate the form, display first information
    document.getElementsByClassName("unhideme")[0].style.display = "";
    head.innerHTML = "Connect with those in need via modern web forms available 24/7 on mobile or a computer: walk through an early demo of our website."
    blurb.innerHTML = "This demo will ask you for some basic information and then autofill a PDF with that information. You can use this functionality in the languages shown above. Our goal is to automate COVID-related paralegal work so that pro bono law groups can provide people with aid efficiently under duress in these dificult times."

  } else if (current_form == 1) {
    console.log("1 entered");
    head.innerHTML = '"Courage – you develop courage by doing small things like just as if you wouldn’t want to pick up a 100-pound weight without preparing yourself --Maya Angelou"'
    blurb.innerHTML = "We're passionate about making an interface that is friendly and reaffirming because we believe many people are having to ask for help for the first time in their lives. We give you the tools to connect with populations in need no matter their language, struggles with homelessness, or the crisis they are facing."
  } else if (current_form == 2) {
    head.innerHTML = "Enter your information for a demonstration of auto-filling forms for your clients."
    blurb.innerHTML = ""
    
    document.getElementsByClassName("fullform")[0].style.display = ""
  }
    current_form += 1;
  }
