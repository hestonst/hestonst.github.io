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
  current_form -= 1;
}

var head
var blurb
var cont

function next() {
  clearMain();
  if (current_form == 0) {
    // Populate the form, display first information
    c = document.getElementsByClassName("content")[0];
    var form = document.createElement('div');
    var div = document.createElement('div');
    cont = document.createElement('a');
    var back = document.createElement('a');
    cont.classList.add("button");
    cont.classList.add("2");
    cont.style.float = "right";
    cont.href = "#";
    cont.style.textAlign = "center";
    cont.innerHTML = "Continue";
    cont.onclick = next;
    back.classList.add("button");
    back.classList.add("1");
    back.classList.add("icons");
    back.href = "#";
    back.style.textAlign = "center";
    back.innerHTML = "Back";

    div.appendChild(back);
    div.appendChild(cont);
    form.appendChild(div);
    head = document.createElement('h1');
    head.innerHTML = "Connect with those in need via modern web forms available 24/7 on mobile or a computer: walk through an early demo of our website."
    blurb = document.createElement('p');
    blurb.innerHTML = "This demo will ask you for some basic information and then autofill a PDF with that information. You can use this functionality in the languages shown above. Our goal is to automate COVID-related paralegal work so that pro bono law groups can provide people with aid efficiently under duress in these dificult times."

    form.appendChild(head);
    form.appendChild(blurb);
    form.appendChild(div);
    c.appendChild(form);

  }
  if (current_form == 1) {
    head.innerHTML = '"Courage – you develop courage by doing small things like just as if you wouldn’t want to pick up a 100-pound weight without preparing yourself --Maya Angelou"'
    blurb.innerHTML = "We're passionate about making an interface that is friendly and reaffirming because we believe many people are having to ask for help for the first time in their lives. We give you the tools to connect with populations in need no matter their language, struggles with homelessness, or the crisis they are facing."
  }
  current_form += 1;


}
