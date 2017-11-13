var drawGraph = function() {
    d3.select("g.xAxis").remove();
    d3.select("g.yAxis").remove();
    d3.selectAll("path").remove();
    lineData = [];
    for (var constraint of linearModel.constraints) {
        var yIntercept ={};
        yIntercept.x= 0;
        yIntercept.y = constraint.x2/constraint.constant;
        var xIntercept ={};
        xIntercept.x= constraint.x1/constraint.constant;
        xIntercept.y = 0;
        lineData.push([xIntercept, yIntercept]);
    }

    var xMax = d3.max(lineData, function(d) {return d3.max(d, function(e) {return e.x;});});
    var xMin = d3.min(lineData, function(d) {return d3.min(d, function(e) {return e.x;});});
    var yMax = d3.max(lineData, function(d) {return d3.max(d, function(e) {return e.y;});});
    var yMin = d3.min(lineData, function(d) {return d3.min(d, function(e) {return e.y;});});
    var width=600, height=400, padding = 50;
    var scaleY = d3.scaleLinear()
        .domain([yMin,yMax])
        .range([height-padding,padding]);
    var scaleX = d3.scaleLinear()
        .domain([xMin,xMax])
        .range([padding,width-padding]);
    var tickPx = 150;
    //espacio entre ticks en px
    //note: .ticks cambiara una cantidad explícita de ticks aún si no conviene
    //a la escala dada
    var axisY = d3.axisLeft(scaleY)
        .ticks(Math.round((height-padding)/tickPx));
    var axisX = d3.axisBottom(scaleX)
        .ticks(Math.round((width-padding)/tickPx));
    var svg = d3.select("svg#graph")
        .attr("width", width)
        .attr("height", height)
        .style("pointer-events", "none");
    var ejeX = svg
        .append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(axisX);
    var ejeY = svg
        .append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (  padding) +  "," + (0) + ")")
        .call(axisY);
    // var rotuloGrafico = svg.append("text") to be included outside SVG, in span
    //     .text("Linear Optimization Problem")
    //     .attr("text-anchor", "middle")
    //     .attr("class", "title")
    //     .attr("x", ((width - padding)/2) + padding)
    //     .attr("y", padding + (0.05*height));
    var percDisplRotulos = .02
    var rotuloX = svg.append("text")
        .text("Decision Var 1")
        .attr("text-anchor", "middle")
        .attr("x", (width-padding)/2+padding)
        .attr("y", 80+height-(padding+(percDisplRotulos*height)));
    var rotuloY = svg.append("text")
      .attr("transform", "rotate(90)") //gira alrededor del origen
      .text("Rótulo Eje Y")
      .attr("text-anchor", "middle")
      .attr("x", (height-padding)/2)
      .attr("y", -(padding+width*percDisplRotulos));
       //vertical
    // D3’s call() function takes a selection as input and hands that selection
    // off to any function. So, in this case, we have just appended a new g group
    // element to contain all of our about-to-be-generated axis elements.
    // (The g isn’t strictly necessary, but keeps the elements organized and allows
    // us to apply a class to the entire group, which we’ll do in a moment.)
    for (var lineDatum of lineData) {
        var lineFunction = d3.line() //d3 v3 :d3.svg.line()
            .x(function(d) { return scaleX(d.x); })
            .y(function(d) { return scaleY(d.y); }); // 1-lineal
            // .curve(d3.curveCatmullRom.alpha(0.5));
            // otros variantes:
            // https://github.com/d3/d3-shape#curves
    //In SVG there exist line and path. But they use their own
    // turtle-like language  -->
    var lineGraph = svg.append("path")
        .attr("d", lineFunction(lineDatum))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
    }
  

}
