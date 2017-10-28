var checkOnInput = function(input) {
    if (input.value == "") {
        return 1;
    }
    var toReturn = parseFloat(input.value);
    if (isNaN(toReturn)) {
        alert("Values must be valid numbers.");
        input.value = 1;
        return 1;
    }
    return toReturn;
}

var checkOnChange = function(input) {
    if (input.value == "") {
        input.value = 1;
    }
}


var addConstraint = function(constraint) {
    var n = linearModel.constraints.length;
    var container = d3.select("span#model>span.constraintContainer").append("span").attr("class","constraint")
        container.append("br");
        container.append("text").text("Constraint " + (n+1) +":");
        var x1RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x1RestrictionCoefficient").attr("width","50").attr("value",constraint.x1);
        container.append("text").text("X").append("sub").text("1").append("text").text("+");
        var x2RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x2RestrictionCoefficient").attr("width","50").attr("value",constraint.x2);
        container.append("text").text("X").append("sub").text("2");
        var g = container.append("span").attr("style","display:inline-block;position:relative;width:31px;").append("g").attr("transform","translate(1,1)");
        var equalitySVG = g.append("svg")
            .attr("class", "button equality")
            .attr("style","width: 31; height: 31; margin: 0; position:absolute; top:-21px;");
        equalitySVG.append("rect").attr("class","button").attr("width","30").attr("height","30");
        equalitySVG.append("text").attr("class","button").text(constraint.equality);
        var constantRestrictionInput = container.append("input").attr("type","number").attr("class","constantRestriction").attr("width","50").attr("value",constraint.constant);
    
        //draw remove Constraint button:
        var g = container.append("span").attr("style","display:inline-block;position:relative;width:31px;").append("g").attr("transform","translate(1,1)");
        var removeSVG = g.append("svg").attr("class", "button remove").attr("style","width: 91; height: 31; margin: 0; position:absolute; top:-21px;");
        removeSVG.append("rect").attr("class","button").attr("width","90").attr("height","30");
        removeSVG.append("text").attr("class","button").text("Remove");
        constraint.inputReference = container;
        linearModel.constraints.push(constraint);
    
    
    
        //bind event listeners: 
        equalitySVG.on('click', function(d, i) {
            var currentIndex = linearModel.constraints.indexOf(constraint);
            var text = linearModel.constraints[currentIndex].inputReference.select("svg.equality").select('text');
            if (text.text() == "≤") {
                text.text("≥");
                linearModel.constraints[currentIndex].equality = "≥";
                recalculateModel();
            } else if (text.text() == "≥") {
                text.text("=");
                linearModel.constraints[currentIndex].equality = "=";
                recalculateModel();
            } else {
                text.text("≤");
                linearModel.constraints[currentIndex].equality = "≤";
                recalculateModel();
            }
        });
    
        //bind event listeners: 
        removeSVG.on('click', function(d, i) {
            var currentIndex = linearModel.constraints.indexOf(constraint);
            linearModel.constraints[currentIndex].inputReference.remove();
            linearModel.constraints.splice(currentIndex, 1);
            //relabel constraints:
            var i = 0;
            console.log(currentIndex);
            console.log(linearModel.constraints.length);
            for (;currentIndex < linearModel.constraints.length; currentIndex++) {
                linearModel.constraints[currentIndex].inputReference.select("text").text("Constraint " + (currentIndex+1) + ":");
            }
            recalculateModel();
        });
    
        x1RestrictionCoefficientInput.on("input", function(d, i) {
            linearModel.constraints[n-1].x1 = checkOnInput(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});
    
        x2RestrictionCoefficientInput.on("input", function(d, i) {
            linearModel.constraints[n-1].x2 = checkOnInput(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});
    
        constantRestrictionInput.on("input", function(d, i) {
            linearModel.constraints[n-1].constant = checkOnInput(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});
}


var removeLastConstraint = function() {
    d3.selectAll("span#model").selectAll("span.constraint").filter(function(d, i,list) {
        return i === list.length - 1;
    }).remove();
    linearModel.constraints.pop();
    recalculateModel();
}

var bindEventListeners = function() {

    var LPContainer = d3.select("div.container");
    var modelSpan = d3.select("span#model");
    // buttons
    d3.select("svg.button#maximize").on('click', function(d, i) {
        var text = d3.select(this).select('text');
        if (text.text() == "Maximize") {
            text.text("Minimize");
            linearModel.objectiveFunction.objective = "Minimize";
        } else {
            text.text("Maximize");
            linearModel.objectiveFunction.objective = "Maximize";
        }
        recalculateModel();
    });



//    LPContainer.select("svg.button#removeConstraint").on('click', function() {removeConstraint();});
    
   d3.select("span#model").select("svg.button#addConstraint").on('click', function() {addConstraint({x1:1,x2:1, equality:"≤", constant:1, inputReference: 0}); recalculateModel();});
    
   d3.select("span#model").select("svg.button#zoomOnFeasibleSet").on('click', function() {
       if (isZoomed) {
           d3.select("span#model").select("svg.button#zoomOnFeasibleSet").select("text").text("Crop Plot to Feasible Set");
           isZoomed = false; 
       }
       else {
           d3.select("span#model").select("svg.button#zoomOnFeasibleSet").select("text").text("Show All Basic Solutions");
           isZoomed = true;
       } 
       
       recalculateModel();
   });
    
    
    // objective function inputs:
    LPContainer.select("input.x1ObjectiveCoefficient").on("input", function() {
            linearModel.objectiveFunction.x1 = checkOnInput(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});

    LPContainer.select("input.x2ObjectiveCoefficient").on("input", function() {
        linearModel.objectiveFunction.x2 = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});



    LPContainer.selectAll("svg.button.equality")
        .on('click', function(d, i) {
            //TODO: add index constraint linearModel
            var text = d3.select(this).select('text');
            if (text.text() == "≤") {
                text.text("≥");
                linearModel.constraints[i].equality = "≥";
            } else if (text.text() == "≥") {
                text.text("=");
                linearModel.constraints[i].equality = "=";
            } else {
                text.text("≤");
                linearModel.constraints[i].equality = "≤";
            }
            recalculateModel();
        });

    LPContainer.selectAll("span.constraint>input.x1RestrictionCoefficient").on("input", function(d, i) {
        linearModel.constraints[i].x1 = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});

    LPContainer.selectAll("span.constraint").on("mouseover", function(d, i) {
        d3.select(this).style("pointer-events: all; background:#DA704B");
    });

    LPContainer.selectAll("span.constraint>input.x2RestrictionCoefficient").on("input", function(d, i) {
        linearModel.constraints[i].x2 = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});
    LPContainer.selectAll("span.constraint>input.constantRestriction").on("input", function(d, i) {
        linearModel.constraints[i].constant = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});



}