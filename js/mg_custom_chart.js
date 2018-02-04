function MedGuyChart(tag, data, config){
    this.tag = tag;
    this.data = data || {};
    this.config = config || {};
    this.graph = null;
    this.selected = -1;
    
    this.jsonMap = {
        1: "cancer.json",
        2: "heart_disease.json",
        3: "influenza_pneumonia.json",
        4: "stroke.json"
    };
    this.nameMap = {
        1: "Cancer",
        2: "Heart Disease",
        3: "Influenza and Pneumonia",
        4: "Stroke"
    }
    this.init();
    $("#moreinfo").attr('disabled', true);
    $("#moreinfo").html("No additional information available")
}

MedGuyChart.prototype = {
    constructor: MedGuyChart,

    init: function(){
        var self = this;
        this.drawGraph();
        $("#cd-dropdown").dropdown({
            onOptionSelect: function(arg){
                self.selected = arg[0].dataset.value;
                self.onSearch();
            }
        });
    },

    drawGraph: function(){
        this.graph = new Chartist.Line(this.tag, this.data, this.config);
        var seq = 0,
        delays = 20,
        durations = 200;
        // Once the chart is fully created we reset the sequence
        this.graph.off('created').on('created', function() {
            seq = 0;
        });
        // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
        this.graph.off('draw').on('draw', function(data) {
            seq++;

            if(data.type === 'line') {
                // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
                data.element.animate({
                opacity: {
                    // The delay when we like to start the animation
                    begin: seq * delays + 1000,
                    // Duration of the animation
                    dur: durations,
                    // The value where the animation should start
                    from: 0,
                    // The value where it should end
                    to: 1
                }
                });
            } else if(data.type === 'label' && data.axis === 'x') {
                data.element.animate({
                y: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.y + 100,
                    to: data.y,
                    // We can specify an easing function from Chartist.Svg.Easing
                    easing: 'easeOutQuart'
                }
                });
            } else if(data.type === 'label' && data.axis === 'y') {
                data.element.animate({
                x: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 100,
                    to: data.x,
                    easing: 'easeOutQuart'
                }
                });
            } else if(data.type === 'point') {
                data.element.animate({
                x1: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 10,
                    to: data.x,
                    easing: 'easeOutQuart'
                },
                x2: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 10,
                    to: data.x,
                    easing: 'easeOutQuart'
                },
                opacity: {
                    begin: seq * delays,
                    dur: durations,
                    from: 0,
                    to: 1,
                    easing: 'easeOutQuart'
                }
                });
            } else if(data.type === 'grid') {
                // Using data.axis we get x or y which we can use to construct our animation definition objects
                var pos1Animation = {
                begin: seq * delays,
                dur: durations,
                from: data[data.axis.units.pos + '1'] - 30,
                to: data[data.axis.units.pos + '1'],
                easing: 'easeOutQuart'
                };

                var pos2Animation = {
                begin: seq * delays,
                dur: durations,
                from: data[data.axis.units.pos + '2'] - 100,
                to: data[data.axis.units.pos + '2'],
                easing: 'easeOutQuart'
                };

                var animations = {};
                animations[data.axis.units.pos + '1'] = pos1Animation;
                animations[data.axis.units.pos + '2'] = pos2Animation;
                animations['opacity'] = {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'easeOutQuart'
                };

                data.element.animate(animations);
            }
        });
    },

    onSearch: function(){
        var self = this;
        var jsonFile = this.jsonMap[self.selected];
        $("#moreinfo").attr("disabled", false);
        $("#infoModal .modal-title").html("Additional information about " + self.nameMap[self.selected] + " data")
        $("#moreinfo").html("More information about the graph");
        $.getJSON("data/" + jsonFile, function(data){
            $(".rValue").html(data.rValue);
            $(".prediction").html(data.prediction);
            var years = data.year;
            var lastYear = data.year[years.length -1];
            for(var i = 0; i < 5; i++){
                lastYear++;
                years.push(lastYear)
            }
            years = years.map(function(year) { 
                return year %2 !== 0 ? "": year;
            })
            var series = [data.deathRate,  data.deathRate_ml, data.deathRate_ml_future];
            var labels = years;
            self.data = {labels: labels, series: series};
            toastr.clear();
            toastr.success("Currently displaying the graph of " + self.nameMap[self.selected] + " mortality rate.");
            self.drawGraph();
        })
    }
}