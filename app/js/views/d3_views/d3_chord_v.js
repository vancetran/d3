define([
"packages",
"views/d3_views/d3_utils_v",
"text!templates/d3_views/d3_chord.html"],
function(packages, D3_utils_v,  Tmpl_chord)
{


	var D3_chord_v = D3_utils_v.extend({
		template:_.template(Tmpl_chord),
		initialize:function (data) {


			this.category = data.category;

			this.campuses 		= this.collection.all_campuses;
			this.subview_id 	= data.subview_id;
			this.container_id = data.container_id;
			this.render();
			this.create_data_object();


		},
		hide:function(){
				this.$("#"+this.container_id).css('display','none');

		},

		show:function(){

				this.$("#"+this.container_id).css('display','block');

		},
		update:function(o){


				if(o.subview == this.subview_id){
					this.show();
				}
		},
		create_data_object:function () {

			console.log("CREATE DATA OBJECT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>- ---- -- --- ");
			var data_medical      = [];



			for(var i=0;i<this.campuses.length;i++){
				//console.log(this.campuses[i]);
				var o = {};
				var data_campus		  = [];
				for(var j=0;j<this.collection.length;j++){


					var data = this.collection.at(j);

					if(this.campuses[i] == data.get("campus")){

						o.name 			= data.get("campus_link");
						o.display 		= data.get("campus");
					//	o.display 		= data.get("tech_broad");
						o.class   		= "node-large";

						//console.log(o);

							if(data.get("tech_broad") == this.category){
									data_medical.push(this.build_category_object(data));
									data_campus.push(data.get("tech_category"));

						}

					}

				}
				o.imports = [];
				o.imports = data_campus;

				data_medical.push(o);

				//console.log(o.imports);


			}



			this.draw_chord_diagram(data_medical,this.id);

		},
		build_category_object: function (data) {

			var o     = {};
			o.name    = data.get("tech_category");
			o.display = data.get("city");
		//	o.display 		= data.get("tech_broad");
			o.class   = "node";


			return o;
		},
		render:function () {
			this.$el.append(this.template({id:this.id, label:this.category, container_id: this.container_id}));


		},
		draw_chord_diagram:function (data, svg_id) {
			console.log("draw");
			console.log(data);



			var line_tension = 0.5;




			var w = 800,
			    h = 800,
			    rx = w / 2,
			    ry = h / 2,
			    m0,
			    rotate = 90;

			var splines = [];

			var cluster = d3.layout.cluster()
			    .size([360, ry - 150])
			    .sort(function(a, b) { return d3.ascending(a.key, b.key); });

			var bundle = d3.layout.bundle();



			var line = d3.svg.line.radial()
			    .interpolate("bundle")
			    .tension(line_tension)
			    .radius(function(d) { return d.y; })
			    .angle(function(d) { return d.x / 180 * Math.PI; });


			var svg = d3.select("#" + svg_id)
			    .attr("width", w)
			    .attr("height", w)
			  	.append("g")
			    .attr("transform", "translate(" + rx + "," + ry + ")");







			  var nodes = cluster.nodes(packages.root(data)),
			      links = packages.imports(nodes),
			      splines = bundle(links);






			  var path = svg.selectAll("path.link")
			      .data(links)
			    .enter().append("path")
			      .attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
			      .attr("d", function(d, i) { return line(splines[i]); });



			  svg.selectAll("g.node")
			      .data(nodes.filter(function(n) { return !n.children; }))
			    .enter().append("g")
			      .attr("class", "node")
			       .attr("class", function (d) {  return d.class;})
			      .attr("id", function(d) { return "node-" + d.key; })
			      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
			    .append("svg:text")
			      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
			      .attr("dy", ".31em")
			      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
			      .text(function(d) { return d.display ; })
			      .on("mouseover", mouseover)
			      .on("mouseout", mouseout);

			  d3.select("input[type=range]").on("change", function(d) {


			    line.tension(this.value / 100);
			    path.attr("d", function(d, i) { return line(splines[i]); });
			  });







			function mouseup() {

			  if (m0) {
			    var m1 = mouse(d3.event),
			        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

			    rotate += dm;
			    if (rotate > 360) rotate -= 360;
			    else if (rotate < 0) rotate += 360;
			    m0 = null;

			    div.style("-webkit-transform", null);

			    svg
			        .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
			      .selectAll("g.node text")
			        .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
			        .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
			        .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
			  }
			}

			function mouseover(d) {
				console.log(d);

			  svg.selectAll("path.link.target-" + d.key)
			      .classed("target", true)
			      .transition()
			      .each(updateNodes("source", true));

			  svg.selectAll("path.link.source-" + d.key)
			      .classed("source", true)
			      .each(updateNodes("target", true));
			}

			function mouseout(d) {
			  svg.selectAll("path.link.source-" + d.key)
			      .classed("source", false)
			      .each(updateNodes("target", false));

			  svg.selectAll("path.link.target-" + d.key)
			      .classed("target", false)
			      .each(updateNodes("source", false));
			}

			function updateNodes(name, value) {
			  return function(d) {
			    if (value) this.parentNode.appendChild(this);
			    svg.select("#node-" + d[name].key).classed(name, value);
			  };
			}

			function cross(a, b) {
			  return a[0] * b[1] - a[1] * b[0];
			}

			function dot(a, b) {
			  return a[0] * b[0] + a[1] * b[1];
			}
		}
	});


	return D3_chord_v;

});
