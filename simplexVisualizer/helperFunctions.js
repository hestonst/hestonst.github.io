var recalculateModel = function() {
    lpPlot.updatePlot(linearModel);
//    calculateCanonicalForm();
//    lpCanonicalPlot.updatePlot(linearModelCanonical);
//    prettyPrintCanonicalForm();
}

var populatePredefinedCase = function(modelType) {
    for (var contraint in linearModel.constraints) {
        removeLastConstraint();
        removeLastConstraint();//TODO: figure out why an extra is needed
    }
    removeLastConstraint();
    linearModel.objectiveFunction.objective = "Maximize";
    if (modelType == "halfSpace") {
        addConstraint({x1: 1, x2: 1, equality: "≤", constant: 1});
    } else if (modelType == "simpleExample") {
        addConstraint({x1: 1, x2: 1, equality: "≤", constant: 1});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≥", constant: 0});
    } else if (modelType == "lowerBound") {
        addConstraint({x1: 1, x2: 1, equality: "≤", constant: 2});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≥", constant: 0});
        addConstraint({x1: 1, x2: 1, equality: "≥", constant: 1});
    } else if (modelType == "noFeasibleSet") {
        addConstraint({x1: 1, x2: 1, equality: "≥", constant: 1});
        addConstraint({x1: 1, x2: 0, equality: "≤", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≤", constant: 0});
    } else if (modelType == "unboundedFeasibleSetAndSolution") {
        addConstraint({x1: 1, x2: 1, equality: "≤", constant: 1});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
    } else if (modelType == "unboundedFeasibleSetAndNoSolution") {
        addConstraint({x1: 1, x2: 1, equality: "≤", constant: 1});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        linearModel.objectiveFunction.objective = "Minimize";
    } else if (modelType == "yAxisFeasibleNoSolutionWithoutRoundingError") {
        addConstraint({x1: 73, x2: 134, equality: "≥", constant: 1350});
        addConstraint({x1: 73, x2: 150, equality: "≤", constant: 1600});
        addConstraint({x1: 107, x2: 500, equality: "≥", constant: 5000});
        addConstraint({x1: 1, x2: 0, equality: "≤", constant: 10});
        addConstraint({x1: 0, x2: 1, equality: "≤", constant: 10});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≥", constant: 0});
    } 
    recalculateModel();
}

var checkIfInCanonicalInequalityForm = function() {
    for (var constraint of linearModel.constraints) {
        if (constraint.equality == "=") return false;
        if (constraint.equality == "≥" && ((constraint.x1 !=0 || constraint.x2 !=0) && constraint.constant != 0)) {
            return false;
        }
    }
    if (linearModel.objectiveFunction.objective == "Minimize") return false;
    return true;
}

var prettyPrintCanonicalForm = function() { 
    //print objective function:
    var canonicalModel = d3.select("span#canonicalModel");
    var bookKeepingVars = canonicalModel.select("span#bookKeepingVarsContainer");
    
    //print objective function
    canonicalModel.selectAll("text.x1ObjectiveCoefficient").text(linearModelCanonical.objectiveFunction.x1);
    if (linearModelCanonical.objectiveFunction.x1 == 1) {
        canonicalModel.select("span.x1ObjectiveVariable").attr("class","x1ObjectiveVariable");
        canonicalModel.select("text.x1ObjectiveCoefficient").text("");
    } else if (linearModelCanonical.objectiveFunction.x1 == 0) {
        canonicalModel.select("span.x1ObjectiveVariable").attr("class","x1ObjectiveVariable hidden");
    } else {
        canonicalModel.select("span.x1ObjectiveVariable").attr("class","x1ObjectiveVariable");
    }

    if (linearModelCanonical.objectiveFunction.x1 != 0 && linearModelCanonical.objectiveFunction.x2 !=0) {
        canonicalModel.select("span#objectiveFunctionContainer>span.plus>text").text("+");
    } else {
        canonicalModel.select("span#objectiveFunctionContainer>span.plus>text").text("");
    }
    
    if (linearModelCanonical.objectiveFunction.x2 < 0) {
        canonicalModel.selectAll("text.x2ObjectiveCoefficient").text(-1*linearModelCanonical.objectiveFunction.x2);
        canonicalModel.select("span#objectiveFunctionContainer>span.plus>text").text("-");
        canonicalModel.select("span.x2ObjectiveVariable").attr("class","x2ObjectiveVariable");
    } else if (linearModelCanonical.objectiveFunction.x2 == 1) {
        canonicalModel.select("text.x2ObjectiveCoefficient").text("");
        canonicalModel.select("span.x2ObjectiveVariable").attr("class","x2ObjectiveVariable");
    } else if (linearModelCanonical.objectiveFunction.x2 == 0) {
        canonicalModel.select("text.x2ObjectiveCoefficient").text("");
        canonicalModel.select("span.x2ObjectiveVariable").attr("class","x2ObjectiveVariable hidden");
    } else {
        canonicalModel.select("span.x2ObjectiveVariable").attr("class","x2ObjectiveVariable");
        canonicalModel.selectAll("text.x2ObjectiveCoefficient").text(linearModelCanonical.objectiveFunction.x2);
    }
    
    //decide if we need the comma separating the book keeping vars: 
    if (linearModelCanonical.objectiveFunction.x1 == 0 || linearModelCanonical.objectiveFunction.x2 == 0) {
        canonicalModel.select("span.comma").attr("class", "comma hidden");
    } else {
        canonicalModel.select("span.comma").attr("class", "comma");
    }
    
    //print book keeping vars:
    if (linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By == 0 && linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By == 0) { //we don't need book keeping vars
        bookKeepingVars.attr("class","hidden");
        canonicalModel.selectAll("span.constraint>text>sup").text("");
    } else if (linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By == 0 && linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By != 0) {
        bookKeepingVars.attr("class","");
        canonicalModel.selectAll("span.constraint>text>sup.x1").text("");
        canonicalModel.selectAll("span.constraint>text>sup.x2").text("'");
        bookKeepingVars.select("span.x1").attr("class","x1 hidden");
        bookKeepingVars.select("span.x2").attr("class","x2");
        if (linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By < 0) {
            bookKeepingVars.select("span.x2").select("span#x2PrimeIsInExcessOfx2By").text("- " + -1*linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By);
        } else {
            bookKeepingVars.select("span.x2").select("span#x2PrimeIsInExcessOfx2By").text("+ " + linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By);
        }
    } else if (linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By != 0 && linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By == 0) {
        bookKeepingVars.attr("class","");
        canonicalModel.selectAll("span.constraint>text>sup.x1").text("'");
        canonicalModel.selectAll("span.constraint>text>sup.x2").text("");
        bookKeepingVars.select("span.x1").attr("class","x1");
        bookKeepingVars.select("span.x2").attr("class","x2 hidden");
        if (linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By < 0) {
            bookKeepingVars.select("span.x1").select("span#x1PrimeIsInExcessOfx1By").text("- " + -1*linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By);
        } else {
            bookKeepingVars.select("span.x1").select("span#x1PrimeIsInExcessOfx1By").text("+ " + linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By);
        }
        
    }
    else { //we need x1prime and x2prime 
        bookKeepingVars.attr("class","");
        canonicalModel.selectAll("span.constraint>text>sup").text("'");
        bookKeepingVars.select("span.x1").attr("class","x1");
        bookKeepingVars.select("span.x2").attr("class","x2");
    }
}

//returns NaN if singular
var invertTwoByTwoMatrix = function(A) {
    if (A.length != 2) throw error;
    var determinant = A[1][1]*A[0][0]-A[0][1]*A[1][0];
    if (determinant === 0 ) return NaN; 
    determinant = (1/determinant); 
    var invA = [
        [determinant*A[1][1],
         determinant*-A[0][1]],
        [determinant*-A[1][0],
         determinant*A[0][0]]
    ];
    return invA;
}

var findAllIntersections = function(constraints) {
    var A = []; //A[row][col] 
    var b = [];
    for (var constraint of constraints) {
        var constant = constraint.constant;
        var row = [
            constraint.x1,
            constraint.x2,
        ];
        A.push(row);
        b.push(constant);
    }
    //solve for intersection of every pair of equations in Ab
    let x = [];
    for(var i = 0; i < A.length; i++) {
        for(var j = i+1; j < A.length; j++) { //(A.length Combine 2)  
            if (i!=j) {
                var invA = invertTwoByTwoMatrix([A[i],A[j]]);
                //Number.isNaN tests for NaN specifically
                //isNaN returns true for a matrix
                //then test if it's not an array of NaN, which is not NaN
                if (!Number.isNaN(invA)) { //if matrix not singular  
                    if (!Number.isNaN(invA[0][0])) {
                    x.push({x:invA[0][0]*b[i]+invA[0][1]*b[j], //Matrix mult.
                    y:invA[1][0]*b[i]+invA[1][1]*b[j]}); //TODO:make parallel
                    } else console.log("Nonsingular Matrix Returned NaN: " + [A[i],A[j]]);
                }
            }
        }
    }
    return x;
}

var deepCopyModel = function(model) {
    
    var constraints = [];
    for (var i = 0; i < model.constraints.length; i++) {
        var x1 = model.constraints[i].x1; //assigning immutable types to vars breaks pointer
        var x2 = model.constraints[i].x2;
        var constant = model.constraints[i].constant;
        var equality = model.constraints[i].equality;
        constraints.push({x1: x1, x2: x2, equality: equality, constant: constant});
    }
    var x1 = model.objectiveFunction.x1;
    var x2 = model.objectiveFunction.x2;
    var objective = model.objectiveFunction.objective;
    
    return {objectiveFunction: {x1: x1, x2: x2, objective: objective}, constraints: constraints};
}

var calculateCanonicalForm = function() {
    model = deepCopyModel(this.model);
    S = findAllIntersections(model);
    var minX = d3.min(S, function(d) { return d.x});
    var minY = d3.min(S, function(d) { return d.y});
    
    //Step 1: change from Minimization problem to a Maximization
    if (linearModelCanonical.objectiveFunction.objective == "Minimize") {
        linearModelCanonical.objectiveFunction.objective = "Maximize";
        linearModelCanonical.objectiveFunction.x1 *= (-1);
        linearModelCanonical.objectiveFunction.x2 *= (-1);
    }
    
    //Step 2: choose book-keeping variables so that model is anchored at origin
    //calculate x1Prime's offset from x1:
    linearModelCanonical.bookKeepingVars = {x1PrimeIsInExcessOfx1By: 0, x2PrimeIsInExcessOfx2By: 0};
    if (minX != 0) {
        //this is used for back-substitution later in the Simplex Algorithm
        linearModelCanonical.bookKeepingVars.x1PrimeIsInExcessOfx1By = minX; 
        //update xars in Canonical Form to be in terms of x1Prime
        // if x1 = x1Prime + minX --> 
        //x1Coefficient*(x1Prime + minX) + x2Coefficient * x2 = constant
        //hence, the constraint in terms of x1prime is 
        // x1Coefficient*x1Prime + x2Coefficient * x2 = constant - //(x1Coefficient*minX)
        for (var i = 0; i < linearModelCanonical.constraints.length; i++) {
            linearModelCanonical.constraints[i].constant -= (linearModelCanonical.constraints[i].x1*minX);
        } 
    }
    //calculate x2Prime's offset from x2:
    if (minY != 0) {
        linearModelCanonical.bookKeepingVars.x2PrimeIsInExcessOfx2By = minY; 
        for (var i = 0; i < linearModelCanonical.constraints.length; i++) {
            linearModelCanonical.constraints[i].constant -= (linearModelCanonical.constraints[i].x2*minY);
        } 
    }
    
}