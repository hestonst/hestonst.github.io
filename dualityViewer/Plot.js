//Plot constructor function
//arg container: d3 selection that will contain the new plot 
function Plot(container, model, plotTitle, inputContainer, variableName) {
    console.log(typeof(variableName));
    //Class variables: 
    this.contourConstant = 1;
    this.isZoomed = false;
    this.width = 600;
    this.height = 400;
    this.padding = 75; 
    //TODO: make square 
    this.model = model;
    this.shadedTriangles = 0;
    this.plotPadding = 0.2; //percentage


    //set up svg and tooltip div
    this.svg = container.append("svg")
        .attr("id", "plot")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("pointer-events", "none");
    this.gZoom = this.svg.append("g").attr("id","zoom");
    this.gStatic = this.svg.append("g");

    this.tooltip = container.append("div")
        .attr("class", "tooltip")
        .attr("style", "position:absolute;")
        .attr("width", "50px")
        .attr("height", "28px");
    var rotuloGrafico = this.gStatic.append("text") //to be included outside SVG, in container
        .text(plotTitle)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .attr("x", (this.width) / 2)
        .attr("y", (0.1 * this.height));
    var xLabel = this.gStatic.append("text")
        .text(" " + variableName)
        .attr("text-anchor", "middle")
        .attr("x", (this.width - this.padding / 2))
        .attr("y", this.height - this.padding + 10);
    xLabel.append("tspan")
        .text("1")
        .attr("baseline-shift", "sub");
    var yLabel = this.gStatic.append("text")
        .text(" " + variableName)
        .attr("text-anchor", "middle")
        .attr("x", this.padding)
        .attr("y", this.padding - 15);
    yLabel.append("tspan")
        .text("2")
        .attr("baseline-shift", "sub");

    this.calculateIfBounded = function() {
        var feasiblePointsAtBorder = [];
        
        this.isBounded = true;
        
        var xMin = this.xMin;
        var yMin = this.yMin;
        var xMax = this.xMax;
        var yMax = this.yMax;
        for (var point of this.SwithBorders) {
            if ((point.x === xMin || point.x === xMax || point.y === yMin || point.y === yMax) && this.isFeasibleWithRoundingError(point)) {
                this.isBounded = false;
                break;
            }
        }
        
        return this.isBounded;
        
    }
    
    this.shadeFeasibleSet = function(intersections, extrema) {
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);
        //note that in linear programming we do not need to test for concavity; it is not possible
        var trianglesToShade = [];
        //for loop to select all S choose 3 points 
        for (var i = 0; i < intersections.length; i++) {
            for (var j = i + 1; j < intersections.length; j++) {
                for (var k = j + 1; k < intersections.length; k++) {
                    if (this.isFeasibleWithRoundingError(intersections[i]) && this.isFeasibleWithRoundingError(intersections[j]) && this.isFeasibleWithRoundingError(intersections[k])) {
                        var triangleString = "";
                        //d3 polyline accepts string with spaces between points and commas between x and y
                        //e.g.  points="05,30 15,30"
                        triangleString += " " + xScale(intersections[i].x) + "," + yScale(intersections[i].y);
                        triangleString += " " + xScale(intersections[j].x) + "," + yScale(intersections[j].y);
                        triangleString += " " + xScale(intersections[k].x) + "," + yScale(intersections[k].y);
                        triangleString += " " + xScale(intersections[i].x) + "," + yScale(intersections[i].y);
                        //revisit first point to close the polygon
                        trianglesToShade.push(triangleString);
                        this.shadedTriangles++;
                    } 
                }
            }
        }

        for (var triangle of trianglesToShade) {
            this.gZoom.append('polyline')
                .attr("clip-path", "url(#clip)")
                .attr("class", "feasible")
                .attr('points', triangle)
                .attr("stroke-width", "4")
                .attr("fill","lightgreen");
        }


        //Case 2: feasible set is a line. We select all combinations choose 2
        //of the basic solutions and test their midpoints for feasibilty. 

        if (this.shadedTriangles < 1) { //only consider if feasible region isn't polygon
            var lineSegmentsToShade = [];
            for (var i = 0; i < intersections.length; i++) {
                for (var j = i + 1; j < intersections.length; j++) {
                    if (this.isFeasibleWithRoundingError(intersections[i]) && this. isFeasibleWithRoundingError(intersections[j])) {
                        lineSegmentsToShade.push([intersections[i], intersections[j]]);
                    }
                }
            }
            var xScale = this.scaleX;
            var yScale = this.scaleY;

            var lineFunction = d3.line()
                .x(function(d) {
                    return xScale(d.x);
                })
                .y(function(d) {
                    return yScale(d.y);
                });
            for (var line of lineSegmentsToShade) {

                var linePlot = this.gZoom.append("path")
                    .attr("d", lineFunction(line))
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "feasible");
            }
        }

        //Case 3: Feasible region is a point 
        //will be graphed by drawPoints method

    }

    this.findFeasibleSet = function() {

        var allBoundsConstraints = deepCopyModel(this.model).constraints;
        
    
        allBoundsConstraints.push({
            x1: 1,
            x2: 0,
            equality: "=",
            constant: this.xMin
        });
        allBoundsConstraints.push({
            x1: 0,
            x2: 1,
            equality: "=",
            constant: this.yMin
        });
        allBoundsConstraints.push({
            x1: 1,
            x2: 0,
            equality: "=",
            constant: this.xMax
        });
        allBoundsConstraints.push({
            x1: 0,
            x2: 1,
            equality: "=",
            constant: this.yMax
        });
        
        
        
        
        this.SwithBorders = findAllIntersections(allBoundsConstraints);
        this.SwithBorders.push({
            x: this.xMin,
            y: this.yMin
        });

        this.shadedTriangles = 0;
    }

    this.clearPlot = function() {
        this.gZoom.selectAll("g").remove();
        this.gStatic.selectAll("g").remove();
        this.svg.selectAll("div").remove();
        this.svg.selectAll("path").remove();
        this.svg.selectAll("polyline").remove();
        this.svg.selectAll("circle").remove();
        this.svg.selectAll("clipPath").remove();
    }
    
    this.findFeasiblePoints =function() {
        this.nonFeasiblePoints = [];
        this.feasiblePoints = [];
        for (var i = 0; i < this.S.length; i++) {
            if (this.isFeasibleWithRoundingError(this.S[i])) this.feasiblePoints.push(this.S[i]);
            else this.nonFeasiblePoints.push(this.S[i]);
        }
    }

    this.drawPoints = function(extrema) {
        //TODO: figure out how to refer to object attributes within loop
        var tooltip = this.tooltip; //make pass by value into foreach 
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);

        this.gZoom.selectAll("circle.infeasible")
            .data(this.nonFeasiblePoints).enter()
            .append("circle")
            .attr("class", "infeasible")
            .attr("style", "pointer-events:all")
            .attr("id", "basicSolution")
            .attr("clip-path", "url(#clip)")
            .attr("cx", function(d) {
                return xScale(d.x);
            })
            .attr("cy", function(d) {
                return yScale(d.y);
            })
            .attr("r", "8px")
            .attr("fill", "black")
            .on("mouseover", function(d) {
                tooltip.html("(" + Number((d.x).toFixed(2)) + ", " + Number((d.y).toFixed(2)) + ")")
                    .style("left", (xScale(d.x) + 10) + "px")
                    .style("top", (yScale(d.y) - 10) + "px")
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });



        this.gZoom.selectAll("circle.feasible")
            .data(this.feasiblePoints).enter()
            .append("circle")
            .attr("class", "feasible")
            .attr("style", "pointer-events:all")
            .attr("id", "basicSolution")
            .attr("clip-path", "url(#clip)")
            .attr("cx", function(d) {
                return xScale(d.x);
            })
            .attr("cy", function(d) {
                return yScale(d.y);
            })
            .attr("r", "8px")
            .on("mouseover", function(d) {
                tooltip.html("(" + Number((d.x).toFixed(2)) + ", " + Number((d.y).toFixed(2)) + ")")
                    .style("left", (xScale(d.x) + 10) + "px")
                    .style("top", (yScale(d.y) - 10) + "px")
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
    
    this.calculatePadding = function(xMin, xMax, yMin, yMax) {
        var yOffset = yMax - yMin;
        var xOffset = xMax - xMin;

        //add aesthetic padding
        //Deal with all cases:

        var yPadding = yOffset * this.plotPadding;
        var xPadding = xOffset * this.plotPadding;
        //case 1: feasible set is a polygon or slanted line
        if (yOffset != 0 && xOffset != 0) {
            xMax += xPadding;
            yMax += yPadding;
            xMin -= xPadding;
            yMin -= yPadding;
        }

        //case 2: feasible set is a verticle line
        else if (xOffset == 0 && yOffset != 0) {
            xMax += yPadding;
            yMax += yPadding;
            xMin -= yPadding;
            yMin -= yPadding; // adding the yPadding centeres the plot 
        }

        //case 3: feasible set is a horizontal line
        else if (yOffset == 0 && xOffset != 0) {
            xMax += xPadding;
            yMax += xPadding;
            xMin -= xPadding;
            yMin -= xPadding; // adding the xPadding centeres the plot 
        }

        //case 4: feasible set is a point
        else if (yOffset == 0 && xOffset == 0) {
            xMax += 1;
            yMax += 1;
            xMin -= 1;
            yMin -= 1; // a box side 2 is sufficient to center point
        }
        return {xMin:xMin, xMax: xMax, yMin:yMin, yMax:yMax};
    }

    this.calculateExtrema = function() {
        //find extrema of all intersections of contraints and the axes
        //include the axes in the constraints, so that any parallel
        //lines that do not intersect with any other contraints are 
        //included
        var constraintsAndAxes = deepCopyModel(this.model).constraints;
        constraintsAndAxes.push({
            x1: 1,
            x2: 0,
            equality: "=",
            constant: 0
        });
        constraintsAndAxes.push({
            x1: 0,
            x2: 1,
            equality: "=",
            constant: 0
        });
        SwithAxes = findAllIntersections(constraintsAndAxes);
        this.xMax = d3.max(SwithAxes, function(d) {
            return d.x;
        });
        this.xMin = d3.min(SwithAxes, function(d) {
            return d.x;
        });
        this.yMax = d3.max(SwithAxes, function(d) {
            return d.y;
        });
        this.yMin = d3.min(SwithAxes, function(d) {
            return d.y;
        });
        
        var extrema = this.calculatePadding(this.xMin, this.xMax, this.yMin, this.yMax);
        this.xMin = extrema.xMin;
        this.xMax = extrema.xMax;
        this.yMin = extrema.yMin;
        this.yMax = extrema.yMax;
        


        //TODO:decide if needed
        //force the inclusion of axes
        if (this.yMin > 0) this.yMin = 0;
        if (this.xMin > 0) this.xMin = 0;
        if (this.yMax < 0) this.yMax = 0;
        if (this.xMax < 0) this.yMin = 0;

        this.scaleY = d3.scaleLinear()
            .domain([this.yMin, this.yMax])
            .range([this.height - this.padding, this.padding]);
        this.scaleX = d3.scaleLinear()
            .domain([this.xMin, this.xMax])
            .range([this.padding, this.width - this.padding]);
    }

    this.findSolution = function() {
        if (this.feasiblePoints.length == 0) {
            this.optimalValue = NaN;
            this.optimalSolution = {x:NaN, y: NaN};
            return; //there is no solution
        }
        this.optimalSolution = {
            x: this.feasiblePoints[0].x,
            y: this.feasiblePoints[0].y,
            isUnique: true
        };
        if (this.model.objectiveFunction.objective == "Maximize") {
            for (var point of this.feasiblePoints) {
                if ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) >
                    (this.optimalSolution.x * this.model.objectiveFunction.x1 + this.optimalSolution.y * this.model.objectiveFunction.x2)) {
                    this.optimalSolution.x = point.x;
                    this.optimalSolution.y = point.y;
                } else if ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) ==
                    (this.optimalSolution.x * this.model.objectiveFunction.x1 + this.optimalSolution.y * this.model.objectiveFunction.x2)) {
                    this.optimalSolution.isUnique = false;
                }
            }
        } else {
            for (var point of this.feasiblePoints) {
                if ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) <
                    (this.optimalSolution.x * this.model.objectiveFunction.x1 + this.optimalSolution.y * this.model.objectiveFunction.x2)) {
                    this.optimalSolution.x = point.x;
                    this.optimalSolution.y = point.y;
                } else if ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) ==
                    (this.optimalSolution.x * this.model.objectiveFunction.x1 + this.optimalSolution.y * this.model.objectiveFunction.x2)) {
                    this.optimalSolution.isUnique = false;
                }
            }
        }
        this.optimalValue = this.optimalSolution.x * this.model.objectiveFunction.x1 + this.optimalSolution.y * this.model.objectiveFunction.x2;

        //TODO: check if infeasible or unbounded
    }
    
    this.isFeasible = function(point) {
        if (isNaN(point.x) || isNaN(point.y)) return false;
        for (var constraint of this.model.constraints) {
            if (constraint.equality == "≤" && ((constraint.x1 * point.x + constraint.x2 * point.y) > constraint.constant)) return false;
            if (constraint.equality == "≥" && ((constraint.x1 * point.x + constraint.x2 * point.y) < constraint.constant)) return false;
            if (constraint.equality == "=" && ((constraint.x1 * point.x + constraint.x2 * point.y) != constraint.constant)) return false;
        }
        return true;
    }
    
    this.isFeasibleWithRoundingError = function(point) {
        var constraints = this.model.constraints;
        var tolerancePercentage = 0.00000000000001; 
        var xTolerance = (this.xMax-this.xMin)*tolerancePercentage;
        var yTolerance = (this.yMax-this.yMin)*tolerancePercentage;
        if (isNaN(point.x) || isNaN(point.y)) return false;
        for (var constraint of constraints) {
            var weightedAvg = Math.abs(constraint.x1*xTolerance+constraint.x2*yTolerance);
            if (constraint.equality == "≤" && ((constraint.x1 * point.x + constraint.x2 * point.y) > weightedAvg+constraint.constant)) return false;
            if (constraint.equality == "≥" && ((constraint.x1 * point.x + constraint.x2 * point.y) < constraint.constant-weightedAvg)) return false;
            if (constraint.equality == "=" && (((constraint.x1 * point.x + constraint.x2 * point.y) < (constraint.constant-weightedAvg)) ||
                (constraint.x1 * point.x + constraint.x2 * point.y) > (constraint.constant+weightedAvg))) return false;
        }
        return true;
    }
    
    this.doesOptimalLineBisectFeasibleSet = function() {
        for (var point of this.SwithBorders) {
            if (this.isFeasibleWithRoundingError(point)) {
                if (this.model.objectiveFunction.objective == "Maximize" && ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) > this.optimalValue)) {
                    return true;
                } else if (this.model.objectiveFunction.objective == "Minimize" && ((point.x * this.model.objectiveFunction.x1 + point.y * this.model.objectiveFunction.x2) < this.optimalValue)) {
                    return true;
                }     
            }
        }
        return false;
    }
    
    this.drawSolution = function(extrema, contConstant) {
//        this.findSolution();
        if (isNaN(this.xMax)) return NaN; //there are no constraints loaded
        
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);
        


        //        Case 1: optimal solution is a slanted line
        if (this.model.objectiveFunction.x1 != 0 && this.model.objectiveFunction.x2 != 0) {
            var line = [{
                    x: ((contConstant - this.model.objectiveFunction.x2 * extrema.yMin) / this.model.objectiveFunction.x1),
                    y: extrema.yMin
                },
                {
                    x: ((contConstant - this.model.objectiveFunction.x2 * extrema.yMax) / this.model.objectiveFunction.x1),
                    y: extrema.yMax
                }
            ];
        }
        //       Case 2: optimal solution is a verticle line
        else if (this.model.objectiveFunction.x1 == 0 && this.model.objectiveFunction.x2 != 0) {
            var line = [{
                    x: extrema.xMin,
                    y: (contConstant/this.model.objectiveFunction.x2)
                },
                {
                    x: extrema.xMax,
                    y: (contConstant/this.model.objectiveFunction.x2)
                }
            ];
        }
        //       Case 2: optimal solution is a horizontal line
        else if (this.model.objectiveFunction.x1 != 0 && this.model.objectiveFunction.x2 == 0) {
            var line = [{
                    x: (contConstant/this.model.objectiveFunction.x1),
                    y: extrema.yMax
                },
                {
                    x: (contConstant/this.model.objectiveFunction.x1),
                    y: extrema.yMin
                }
            ];
        }
        //       Case 3: there is no function to maximize
        else if (this.model.objectiveFunction.x1 == 0 && this.model.objectiveFunction.x2 == 0) {
            return;
        }
        


        
        var lineFunction = d3.line()
            .x(function(d) {
                //returns NaN if line completely outside of window
                return xScale(d.x);
            })
            .y(function(d) {
                return yScale(d.y);
            });

        var linePlot = this.gZoom.append("path")
            .attr("d", lineFunction(line))
            .attr("id", "solution")
            .attr("clip-path", "url(#clip)")
            .attr("class", "solution")
            .attr("stroke-width", 4);
        if (inputContainer.select("input.contourConstant")._groups[0][0].value === this.optimalValue && !this.doesOptimalLineBisectFeasibleSet()) { 
            container.selectAll("path.solution").attr("class","optimalSolution");
        }
    }

    this.shadeBounded = function() {
        this.calculateIfBounded();
        if (this.isBounded) {
            //LP fully bounded
            container.selectAll("circle.feasible").attr("class", "feasible bounded").attr("style", "fill: lightgreen; stroke: lightgreen;pointer-events:all;");
            container.selectAll("polyline").attr("class", "bounded").attr("style", "fill: #bbf4bb; stroke: #bbf4bb;");
            container.selectAll("path.feasible").attr("class", "feasible bounded");
        } else if (!this.isBounded) {
            //feasible set and optimal value is infinite 
            container.selectAll("path.solution").remove();
            container.selectAll("circle.feasible").attr("class", "feasible unbounded").attr("style", "fill: #fdfda0; stroke: #fdfda0;pointer-events:all;"); //TODO: make this #ebeb41 again
            container.selectAll("polyline").attr("class", "unbounded").attr("style", "fill: lightyellow; stroke: lightyellow");
            container.selectAll("path.feasible").attr("class", "feasible unbounded");
        } else if (!this.isBounded) {
            //feasible set infinite; optimal value is finite 
            container.selectAll("circle.feasible").attr("class", "feasible bounded").attr("style", "fill: lightgreen; stroke: lightgreen;pointer-events:all;");
            container.selectAll("polyline").attr("class", "bounded").attr("style", "fill:#bbf4bb; stroke: #bbf4bb;");
            container.selectAll("path.feasible").attr("class", "feasible bounded");
        }
    }
    
    this.drawConstraints = function(extrema) {
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);
        //use extrema to find line segment end points  
        var lineSegmentEndPoints = [];
        for (var constraint of this.model.constraints) {
            var point1 = {};
            var point2 = {};
            //Case 1: constraint is horizontal line
            if (constraint.x2 != 0 && constraint.x1 != 0) {
                point1.x = extrema.xMin;
                point1.y = (constraint.constant - extrema.xMin * constraint.x1) / constraint.x2;
                point2.x = extrema.xMax;
                point2.y = (constraint.constant - extrema.xMax * constraint.x1) / constraint.x2;
            }
            //Case 2: constraint is verticle line
            else if (constraint.x2 == 0 && constraint.x1 != 0) {
                point1.x = constraint.constant / constraint.x1;
                point1.y = extrema.yMin;
                point2.x = constraint.constant / constraint.x1;
                point2.y = extrema.yMax;
            }
            //Case 3: constraint is horizontal line
            else if (constraint.x2 != 0 && constraint.x1 == 0) {
                point1.x = extrema.xMin;
                point1.y = constraint.constant / constraint.x2;
                point2.x = extrema.xMax;
                point2.y = constraint.constant / constraint.x2;
            }
            if (!isNaN(point1.x) &&!isNaN(point1.y) && !isNaN(point2.x) &&!isNaN(point2.y)) {  
                lineSegmentEndPoints.push([point1, point2]);
            }
        }

        this.gStatic.append("clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", xScale(extrema.xMin))
            .attr("y", yScale(extrema.yMax))
            .attr("width", this.width - 2 * this.padding)
            .attr("height", this.height - 2 * this.padding);


        //TODO: make lineFunction into class var, reduce pointers
        var lineFunction = d3.line()
            .x(function(d) {
                return xScale(d.x);
            })
            .y(function(d) {
                return yScale(d.y);
            });
        for (var line of lineSegmentEndPoints) {
            var linePlot = this.gZoom.append("path")
                .attr("d", lineFunction(line))
                .attr("clip-path", "url(#clip)")
                .attr("class", "constraint")
                .attr("stroke-width", 4)
                .attr("fill", "none");
        }

    }
        
    this.drawAxes = function(extrema){
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);

        var tickPx = 150;
        //espacio entre ticks en px
        //note: .ticks cambiara una cantidad explícita de ticks aún si no conviene
        //a la escala dada
        var axisY = d3.axisLeft(yScale)
            .ticks(Math.round((this.height - this.padding) / tickPx));
        var axisX = d3.axisBottom(xScale)
            .ticks(Math.round((this.width - this.padding) / tickPx));
        var xScaleContainer = this.gStatic
            .append("g")
            .attr("class", "xAxis")
            .attr("style", "pointer-events: none")
            .attr("transform", "translate(0," + (this.height - this.padding) + ")")
            .call(axisX);
        var yScaleContainer = this.gStatic
            .append("g")
            .attr("style", "pointer-events: none")
            .attr("class", "yAxis")
            .attr("transform", "translate(" + this.padding + "," + 0 + ")")
            .call(axisY);
        axisY = d3.axisLeft(this.scaleY)
            .ticks(0);
        var axisX = d3.axisBottom(this.scaleX)
            .ticks(0);
        var xScaleInner = this.gZoom
            .append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + yScale(0) + ")")
            .call(axisX);
        var yScaleInner = this.gZoom
            .append("g")
            .attr("class", "yAxis")
            .attr("transform", "translate(" + (xScale(0)) + "," + (0) + ")")
            .call(axisY);

    }
    
    this.updatePlot = function(model) {
        this.model = model;
        this.S = findAllIntersections(this.model.constraints);
        this.clearPlot();
        this.findFeasiblePoints();
        this.calculateExtrema();
        this.findFeasibleSet(); //determine if bounded must follow determine if bounded 
        this.contourConstant = inputContainer.select("input.contourConstant")._groups[0][0].value;
        console.log(this.contourConstant);
        if (this.isZoomed) {
            var xFeasibleMin = d3.min(this.feasiblePoints, function(d) {return d.x;});
            var xFeasibleMax = d3.max(this.feasiblePoints, function(d) {return d.x;});
            var yFeasibleMin = d3.min(this.feasiblePoints, function(d) {return d.y;});
            var yFeasibleMax = d3.max(this.feasiblePoints, function(d) {return d.y;});
            
            this.extrema = this.calculatePadding(xFeasibleMin, xFeasibleMax, yFeasibleMin, yFeasibleMax);
            var extrema = this.extrema;
            var scaleFactor = Math.sqrt((this.xMax-this.xMin)/(extrema.xMax-extrema.xMin));
            var xScaleFactor = (this.xMax-this.xMin)/(extrema.xMax-extrema.xMin);
            var yScaleFactor = (this.yMax-this.yMin)/(extrema.yMax-extrema.yMin);
            if (!isNaN(xScaleFactor) && !isNaN(yScaleFactor)) {
                this.drawAxes(extrema);
                this.drawConstraints(extrema);
                this.shadeFeasibleSet(this.SwithBorders, extrema); 
                this.drawPoints(extrema);
                console.log(extrema);
                this.drawSolution(extrema, this.contourConstant);
            } else {
                this.extrema = {xMin:this.xMin, xMax: this.xMax, yMin:this.yMin, yMax:this.yMax}
                var extrema = this.extrema;
                this.drawAxes(extrema);
                this.drawConstraints(extrema);
                this.shadeFeasibleSet(this.SwithBorders, extrema); 
                this.drawPoints(extrema);
                this.drawSolution(extrema, this.contourConstant);

            }
        } else {
            this.extrema = {xMin:this.xMin, xMax: this.xMax, yMin:this.yMin, yMax:this.yMax};
            var extrema = this.extrema;
            this.drawAxes(extrema);
            this.drawConstraints(extrema);
            this.shadeFeasibleSet(this.SwithBorders, extrema); 
            this.drawPoints(extrema);
            this.drawSolution(extrema, this.contourConstant);
        }
        this.shadeBounded();
        this.drawSolution(extrema, this.contourConstant);
    }
    
    this.optimize = function() {
        var extrema = this.extrema; //TODO delete this.extrema
        //TODO: delete redundent code with drawSolution
        this.findSolution();
        if (isNaN(this.xMax)) return NaN; //there are no constraints loaded
        
        var yScale = d3.scaleLinear()
            .domain([extrema.yMin, extrema.yMax])
            .range([this.height - this.padding, this.padding]);
        var xScale = d3.scaleLinear()
            .domain([extrema.xMin, extrema.xMax])
            .range([this.padding, this.width - this.padding]);


        //        Case 1: optimal solution is a slanted line
        if (this.model.objectiveFunction.x1 != 0 && this.model.objectiveFunction.x2 != 0) {
            var line = [{
                    x: ((this.optimalValue - this.model.objectiveFunction.x2 * extrema.yMin) / this.model.objectiveFunction.x1),
                    y: extrema.yMin
                },
                {
                    x: ((this.optimalValue - this.model.objectiveFunction.x2 * extrema.yMax) / this.model.objectiveFunction.x1),
                    y: extrema.yMax
                }
            ];
        }
        //       Case 2: optimal solution is a verticle line
        else if (this.model.objectiveFunction.x1 == 0 && this.model.objectiveFunction.x2 != 0) {
            var line = [{
                    x: extrema.xMin,
                    y: this.optimalSolution.y
                },
                {
                    x: extrema.xMax,
                    y: this.optimalSolution.y
                }
            ];
        }
        //       Case 2: optimal solution is a horizontal line
        else if (this.model.objectiveFunction.x1 != 0 && this.model.objectiveFunction.x2 == 0) {
            var line = [{
                    x: this.optimalSolution.x,
                    y: extrema.yMax
                },
                {
                    x: this.optimalSolution.x,
                    y: extrema.yMin
                }
            ];
        }
        //       Case 3: there is no function to maximize
        else if (this.model.objectiveFunction.x1 == 0 && this.model.objectiveFunction.x2 == 0) {
            return;
        }

        if (!this.doesOptimalLineBisectFeasibleSet()) { 
            //don't draw optimal line if intersects with unbounded LP
            var lineFunction = d3.line()
                .x(function(d) {
                    //returns NaN if line completely outside of window
                    return xScale(d.x);
                })
                .y(function(d) {
                    return yScale(d.y);
                });
            console.log(lineFunction(line));
            var sol = container.select("path#solution").attr("class", "optimalSolution");
            sol.transition().attr("d", lineFunction(line));
            if (!isNaN(this.optimalValue)) {
                inputContainer.select("input.contourConstant").property("value",this.optimalValue);
//                this.contourConstant = this.optimalValue;
            }
        } else {
            inputContainer.select("input.contourConstant").property("value","");
        }

        container.selectAll("path.solution").remove();
    }
    
    this.findDual = function() {
      var obj = "Minimize";
      if (this.model.objectiveFunction.objective == "Minimize") obj = "Maximize";
      if (this.model.constraints.length < 2) {
          return;
      }
      this.dualModel = {
          objectiveFunction: {x1: this.model.constraints[0].constant, x2: this.model.constraints[1].constant, objective: obj},
          constraints: []
      };
        //add constraints constants to dual
        this.dualModel.constraints.push({
            x1:this.model.constraints[0].x1, 
            x2: this.model.constraints[1].x1, 
            equality: oppositeInequality(this.model.constraints[0].equality),
            constant: this.model.objectiveFunction.x1
        });
        
        this.dualModel.constraints.push({
            x1: this.model.constraints[0].x2, 
            x2:this.model.constraints[1].x2, 
            equality: oppositeInequality(this.model.constraints[1].equality),
            constant: this.model.objectiveFunction.x2
        });
        
        //add equality directions to dual constraints:
        if (this.model.constraints.length == 2) {
            //both x1 and x2 unrestricted 
            for (var constraint in this.model.constraints) {
                this.dualModel.constraints[constraint].equality = "=";
            }
        } else if (this.model.constraints.length == 3) {
            // x1 xor x2 unrestricted 
            if (this.model.constraints[2].x1 == 1) {
                //x1 constrained
                this.dualModel.constraints[0].equality = "≥";
                this.dualModel.constraints[1].equality = "=";
            } else {
                //x2 constrained
                this.dualModel.constraints[1].equality = "≥";
                this.dualModel.constraints[0].equality = "=";
            }
        } else if (this.model.constraints.length == 4) {
            // x1 and x2 restricted 
            this.dualModel.constraints[0].equality = (this.model.constraints[2].equality);
            this.dualModel.constraints[1].equality = this.model.constraints[3].equality;
            if (this.model.constraints[0].equality != "=") {
                //if y1 is constrained 
                this.dualModel.constraints.push({
                    x1: 1, 
                    x2:0, 
                    equality: oppositeInequality(this.model.constraints[0].equality),
                    constant: this.model.constraints[2].constant
                });
            }
            if (this.model.constraints[1].equality != "=") {
                //if y2 is constrained 
                this.dualModel.constraints.push({
                    x1: 0, 
                    x2:1, 
                    equality: oppositeInequality(this.model.constraints[1].equality),
                    constant: this.model.constraints[3].constant
                });
            }
        }
    }

    //draw initial plot: 
    this.updatePlot(model);
}