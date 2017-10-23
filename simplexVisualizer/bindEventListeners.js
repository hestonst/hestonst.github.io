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
    linearModel.constraints.push(constraint);
    var n = linearModel.constraints.length;
    var container = d3.select("span#model>span.constraintContainer").append("span").attr("class","constraint")
        container.append("br");
        container.append("text").text("Constraint " + n +":");
        var x1RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x1RestrictionCoefficient").attr("width","50").attr("value",constraint.x1);
        container.append("text").text("X").append("sub").text("1").append("text").text("+");
        var x2RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x2RestrictionCoefficient").attr("width","50").attr("value",constraint.x2);
        container.append("text").text("X").append("sub").text("2");
        var g = container.append("span").attr("style","display:inline-block;position:relative;width:31px;").append("g").attr("transform","translate(1,1)");
        var svg = g.append("svg").attr("class", "button equality").attr("style","width: 31; height: 31; margin: 0; position:absolute; top:-21px;");
        svg.append("rect").attr("class","button").attr("width","30").attr("height","30");
        svg.append("text").attr("class","button").text(constraint.equality);
        var constantRestrictionInput = container.append("input").attr("type","number").attr("class","constantRestriction").attr("width","50").attr("value",constraint.constant);
        svg.on('click', function(d, i) {
            var text = d3.select(this).select('text');
            if (text.text() == "≤") {
                text.text("≥");
                linearModel.constraints[n-1].equality = "≥";
                recalculateModel();
            } else if (text.text() == "≥") {
                text.text("=");
                linearModel.constraints[n-1].equality = "=";
                recalculateModel();
            } else {
                text.text("≤");
                linearModel.constraints[n-1].equality = "≤";
                recalculateModel();
            }
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


var removeConstraint = function() {
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



    LPContainer.select("svg.button#removeConstraint").on('click', function() {removeConstraint();});
    
   d3.select("span#model").select("svg.button#addConstraint").on('click', function() {addConstraint({x1:1,x2:1, equality:"≤", constant:1}); recalculateModel();});
    
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