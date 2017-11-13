var recalculateModel = function() {
    primalPlot.updatePlot(linearModel);
    primalPlot.findDual();
    dualPlot.updatePlot(primalPlot.dualModel);
    prettyPrintDualModel(primalPlot.dualModel);
}

var oppositeInequality = function(inequality) {
    if (inequality == "≤") return "≥";
    if (inequality == "≥") return "≤";
    if (inequality == "=") return "urs";
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
    } else if (modelType == "simplePrimal") {
        changeObjectiveFunction(15,10);
        addConstraint({x1: 3, x2: 4, equality: "≤", constant: 68});
        addConstraint({x1: 5, x2: 6, equality: "≤", constant: 107});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≥", constant: 0});
    } else if (modelType == "simpleDual") {
        changeObjectiveFunction(68,107);
        addConstraint({x1: 3, x2: 5, equality: "≥", constant: 15});
        addConstraint({x1: 4, x2: 6, equality: "≥", constant: 10});
        addConstraint({x1: 1, x2: 0, equality: "≥", constant: 0});
        addConstraint({x1: 0, x2: 1, equality: "≥", constant: 0});
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

var prettyPrintDualModel = function(dualModel) { 
   d3.select("span#dualModel").select("span.constraintContainer").selectAll("span").remove();
   var container = d3.select("span#dualModel");
   container.select("text#objective").text(dualModel.objectiveFunction.objective);
   container.select("text.x1ObjectiveCoefficient").text(dualModel.objectiveFunction.x1);
   container.select("text.x2ObjectiveCoefficient").text(dualModel.objectiveFunction.x2);
   for (var constraint of dualModel.constraints) {
       addDualConstraint(constraint);
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