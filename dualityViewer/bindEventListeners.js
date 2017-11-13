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

var changeObjectiveFunction = function(x1,x2) {
    var container = d3.select("span#model");
    linearModel.objectiveFunction.x1 = x1;
    container.select("input.x1ObjectiveCoefficient").attr("value",x1);
    linearModel.objectiveFunction.x2 = x2;
    container.select("input.x2ObjectiveCoefficient").attr("value",x2);
}

var addConstraint = function(constraint) {
    var n = linearModel.constraints.length;
    var container = d3.select("span#model>span.constraintContainer").append("span").attr("class","constraint");
        container.append("br");
        container.append("text").text("Constraint " + (n+1) +":");
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            var x1RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x1RestrictionCoefficient").attr("width","50").attr("value",constraint.x1);
        }
        if (constraint.x1 != 0) {
            container.append("text").attr("class","label").text("X").append("sub").text("1");
        }
    
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            container.append("text").text("+");
        }
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            var x2RestrictionCoefficientInput = container.append("input").attr("type","number").attr("class","x2RestrictionCoefficient").attr("width","50").attr("value",constraint.x2);
        }
    
        if (constraint.x2 != 0) {
            container.append("text").attr("class","label").text("X").append("sub").text("2");
        }
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            var g = container.append("span").attr("style","display:inline-block;position:relative;width:31px;").append("g").attr("transform","translate(1,1)");
            var equalitySVG = g.append("svg")
                .attr("class", "button equality")
                .attr("style","width: 31; height: 31; margin: 0; position:absolute; top:-21px;");
            equalitySVG.append("rect").attr("class","button").attr("width","30").attr("height","30");
            equalitySVG.append("text").attr("class","button").text(constraint.equality);
            var constantRestrictionInput = container.append("input").attr("type","number").attr("class","constantRestriction").attr("width","50").attr("value",constraint.constant);
        } else {
            container.append("text").text(" ≥ 0");
        }
    
        //draw remove Constraint button:
        if (constraint.x1 == 0 || constraint.x2 == 0) {
            var g = container.append("span").attr("style","display:inline-block;position:relative;width:31px;").append("g").attr("transform","translate(1,1)");
            var removeSVG = g.append("svg").attr("class", "button remove").attr("style","width: 91; height: 31; margin: 0; position:absolute; top:-21px;");
            removeSVG.append("rect").attr("class","button").attr("width","90").attr("height","30");
            removeSVG.append("text").attr("class","button").text("Remove");
        }
        constraint.inputReference = container;
        linearModel.constraints.push(constraint);
    
    
    
        //bind event listeners: 
        if (constraint.x1 != 0 && constraint.x2 != 0) {
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
        }
    
        //bind event listeners: 
        if (constraint.x1 == 0 || constraint.x2 == 0) {

            removeSVG.on('click', function(d, i) {
                var currentIndex = linearModel.constraints.indexOf(constraint);
                linearModel.constraints[currentIndex].inputReference.selectAll("input").remove();
                linearModel.constraints[currentIndex].inputReference.select("text.constraintNum").remove()
                linearModel.constraints[currentIndex].inputReference.selectAll("svg").remove();
                linearModel.constraints[currentIndex].inputReference.select("text.label").append("text").text(" unrestricted");
                linearModel.constraints.splice(currentIndex, 1);
                //relabel constraints:
                var i = 0;
                for (;currentIndex < linearModel.constraints.length; currentIndex++) {
                    linearModel.constraints[currentIndex].inputReference.select("text").text("Constraint " + (currentIndex+1) + ":");
                }
                recalculateModel();
            });
        }
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            x1RestrictionCoefficientInput.on("input", function(d, i) {
                var currentIndex = linearModel.constraints.indexOf(constraint);
                linearModel.constraints[currentIndex].x1 = checkOnInput(this);
                recalculateModel();
            }).on("change",function() {checkOnChange(this);});
            x2RestrictionCoefficientInput.on("input", function(d, i) {
                var currentIndex = linearModel.constraints.indexOf(constraint);
                linearModel.constraints[currentIndex].x2 = checkOnInput(this);
                recalculateModel();
            }).on("change",function() {checkOnChange(this);});
        }    
        if (constraint.x1 != 0 && constraint.x2 != 0) {
            constantRestrictionInput.on("input", function(d, i) {
                var currentIndex = linearModel.constraints.indexOf(constraint);
                linearModel.constraints[currentIndex].constant = checkOnInput(this);
                recalculateModel();
            }).on("change",function() {checkOnChange(this);});
        }
    
//        container.on("mouseover", function() {
//            d3.select(this).attr("style","background-color: #efefeb; pointer-events: all;");
//        });
//        container.on("mouseout", function() {
//            d3.select(this).attr("style","background-color: none");
//        }); //TODO: this works
}

var addDualConstraint = function(constraint) { 
    var n = d3.select("span#dualModel>span.constraintContainer").selectAll("span")._groups[0].length;
    var container = d3.select("span#dualModel").select("span.constraintContainer").append("span").attr("class","constraint");
    container.append("br");
    container.append("text").text("Constraint " + (n+1) +":");
    
    if (constraint.x1 != 0) {
        var x1RestrictionCoefficientInput = container.append("text").attr("class","x1RestrictionCoefficient").text(" " + constraint.x1 + " ");
        container.append("text").attr("class","label").text("Y").append("sub").text("1");
    }

    if (constraint.x1 != 0 && constraint.x2 != 0) {
        container.append("text").text("+");
    }

    if (constraint.x2 != 0) {
        var x2RestrictionCoefficientInput = container.append("text").attr("class","x2RestrictionCoefficient").text(" " + (constraint.x2!=1 ? constraint.x2: " ") + " ");
        container.append("text").attr("class","label").text("Y").append("sub").text("2");
    }
    
    var equalityLabel = container.append("text").attr("class","equalityLabel").text(" " + constraint.equality + " ");
    
    var constantLabel = container.append("text").attr("class","constantLabel").text(" " + constraint.constant + " ");
    
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
       if (primalPlot.isZoomed) {
           d3.select("span#model").select("svg.button#zoomOnFeasibleSet").select("text").text("Crop Plot to Feasible Set");
           primalPlot.isZoomed = false; 
       }
       else {
           d3.select("span#model").select("svg.button#zoomOnFeasibleSet").select("text").text("Show All Basic Solutions");
           primalPlot.isZoomed = true;
       } 
       
       recalculateModel();
   });
    
   d3.select("span#dualModel").select("svg.button#zoomOnFeasibleSet").on('click', function() {
       if (dualPlot.isZoomed) {
           d3.select("span#dualModel").select("svg.button#zoomOnFeasibleSet").select("text").text("Crop Plot to Feasible Set");
           dualPlot.isZoomed = false; 
       }
       else {
           d3.select("span#dualModel").select("svg.button#zoomOnFeasibleSet").select("text").text("Show All Basic Solutions");
           dualPlot.isZoomed = true;
       } 
       
       recalculateModel();
   });
   
   
   d3.select("span#model").select("svg.button#optimize").on('click', function() {
       primalPlot.optimize();
   });
    
   d3.select("span#dualModel").select("svg.button#optimize").on('click', function() {
       dualPlot.optimize();
   });
    
    
    // objective function inputs:
    LPContainer.select("input.x1ObjectiveCoefficient").on("input", function() {
            linearModel.objectiveFunction.x1 = checkOnInput(this);
            console.log(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});
    
        // objective function inputs:
    LPContainer.select("input.contourConstant").on("input", function() {
            contourConstant = checkOnInput(this);
            recalculateModel();
        }).on("change",function() {checkOnChange(this);});
    
    d3.select("#dualModel").select("input.contourConstant").on("input", function() {
            contourConstant = checkOnInput(this);
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

//    LPContainer.selectAll("span.constraint").on("mouseover", function(d, i) {
//        d3.select(this).style("pointer-events: all; background:#DA704B");
//    }); //TODO: this works

    LPContainer.selectAll("span.constraint>input.x2RestrictionCoefficient").on("input", function(d, i) {
        linearModel.constraints[i].x2 = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});
    LPContainer.selectAll("span.constraint>input.constantRestriction").on("input", function(d, i) {
        linearModel.constraints[i].constant = checkOnInput(this);
        recalculateModel();
    }).on("change",function() {checkOnChange(this);});



}