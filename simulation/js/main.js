'use strict';


document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');
	const dampButton = document.getElementById('damping');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});
	dampButton.addEventListener('click', function() { isdamp = 1-isdamp ; restart();});
	function init()
	{
		rod = [[startx, starty], [endx, starty], [endx, starty + height], [startx, starty + height]];

		ground = [
			[startx - margin, starty + height + 40],
			[startx - margin, starty + height],
			[endx + margin, starty + height],
			[endx + margin, starty + height + 40],
		];
		curr_t = 0;
	}
	
	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		init();
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const sliders = ["mass", "velocity", "vibration", "stiff", "etta"]; 
	sliders.forEach(function(elem, ind){
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;
			params[elem] = Number(document.getElementById(elem).value);
			if(ind === 0)
			{
				radius = params[elem] / 10000;
			}
			else if(ind === 4)
			{
				params[elem] /= 100;
			}

			restart();
		};
	});


	function drawGround(ctx, ground)
	{
		ctx.save();
		ctx.fillStyle = "pink";
		ctx.beginPath();
		ctx.moveTo(ground[0][0], ground[0][1]);

		for(let i = 0; i < ground.length; ++i)
		{
			const next = (i + 1) % ground.length;
			ctx.lineTo(ground[next][0], ground[next][1]);
		}

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	const height = 100;
	const startx = 596;
	const endx = 600;
	const margin = 150;
	const starty = 220;

	// Input Parameters 
	let isdamp = 0;
	let params = {
		"mass": 136000,
		"velocity": 1000,
		"vibration": 100,
		"stiff": 4 * 10000000,
		"etta": 0.05
	};

	let radius = params["mass"] / 10000;

	// Derived Parameters
	let rod, ground, curr_t;
	init();
	let omegan = math.sqrt(params["stiff"] / params["mass"]);
	let omega0 = omegan * Math.sqrt(1 - (params["etta"] * params["etta"]));
	let curr_displacement = params["vibration"] * (Math.cos(omegan * curr_t)) + (params["velocity"] * (Math.sin(omegan * curr_t))) / omegan;
	let damped_displacement = (Math.exp(-1 * params["etta"] * omega0 * curr_t)) * (params["vibration"] * (Math.cos(omega0 * curr_t)) + ((params["velocity"] + params["etta"] * omegan * params["vibration"]) * Math.sin(omegan * curr_t)) / omegan);


	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9";
	const border = "black";
	const lineWidth = 1.5;

	const fps = 15;

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		drawGround(ctx, ground);
		const v = [...rod];

		if(isdamp)
		{
			curr_displacement = (Math.exp(-1 * params["etta"] * omega0 * curr_t)) * (params["vibration"] * (Math.cos(omega0 * curr_t)) + ((params["velocity"] + params["etta"] * omegan * params["vibration"]) * Math.sin(omegan * curr_t)) / omega0);
		}
		else
		{
			curr_displacement = params["vibration"] * (Math.cos(omegan * curr_t)) + (params["velocity"] * (Math.sin(omegan * curr_t))) / omegan;
		}

		const new_up_L = v[0][0] + curr_displacement;
		const new_up_R = v[1][0] + curr_displacement;

		ctx.beginPath();
		ctx.moveTo(new_up_L, v[0][1]);
		ctx.lineTo(new_up_R, v[1][1]);
		ctx.lineTo(v[2][0], v[2][1]);
		ctx.lineTo(v[3][0], v[3][1]);
		ctx.lineTo(new_up_L, v[0][1]);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(new_up_L -radius, v[0][1]);
		ctx.bezierCurveTo(new_up_L-radius, v[0][1] - radius, new_up_R + radius, v[0][1] - radius, new_up_R + radius, v[1][1]);
		ctx.bezierCurveTo(new_up_R + radius, v[1][1] + radius, new_up_L - radius, v[1][1] + radius, new_up_L - radius, v[0][1]);
		ctx.closePath();

		ctx.fill();
		ctx.stroke();
		ctx.restore();
		curr_t += 0.01;

		if (isdamp === 0)
		{
			document.getElementById("etta").disabled = true;
		}
		else 
		{
			document.getElementById("etta").disabled = false;
		}

		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	let tmHandle = window.setTimeout(draw, 1000 / fps);

	function drawDisGraph() 
	{
		try {
			// compile the expression once
			const coef = 2 * Math.PI / (math.sqrt(params["stiff"]));
			const expression = String(coef) + "*sqrt(x)";
			const expr = math.compile(expression);

			// evaluate the expression repeatedly for different values of x
			const xValues = math.range(0, 10, 0.1).toArray();
			const yValues = xValues.map(function (x) {
				return expr.evaluate({x: x});
			});

			// render the plot using plotly
			const trace1 = {
				x: xValues,
				y: yValues,
				type: 'scatter'
			};

			const data = [trace1];
			const layout = {
				width: 250,
				height: 250,

				xaxis: {
					title: {
						text: 'Mass',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Time Period',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					}
				}
			};

			const config = {responsive: true};
			Plotly.newPlot('disPlot', data, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	drawDisGraph();

	function drawLenGraph() {
		try {
			// compile the expression once
			const coef = 2 * Math.PI * (math.sqrt(params["mass"]));
			const expression = String(coef) + "/sqrt(x)";
			const expr = math.compile(expression);

			// evaluate the expression repeatedly for different values of x
			const xValues = math.range(0, 10, 0.1).toArray();
			const yValues = xValues.map(function (x) {
				return expr.evaluate({x: x});
			});

			// render the plot using plotly
			const trace1 = {
				x: xValues,
				y: yValues,
				type: 'scatter'
			};

			const layout = {
				width: 250,
				height: 250,
				xaxis: {
					title: {
						text: 'Stiffness',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Time Period (s)',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					}
				}
			};

			const config = {responsive: true};
			const data = [trace1];
			Plotly.newPlot('lenPlot', data,layout,config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	drawLenGraph();

	function drawTimeGraph() {
		try {
			// compile the expression once
			let omegan = math.sqrt(params["stiff"] / params["mass"]);
			let omega0 = omegan * Math.sqrt(1 - (params["etta"] * params["etta"]));
			
			const expression = "exp(-1*x*" + String(params["etta"]*omega0) + ")" + "*(" + String(params["vibration"]) + "*cos(x*" + String(omega0) + ") + (" + String((params["velocity"] + params["etta"]*omegan*params["vibration"])/omega0) + "*sin(x*" + String(omega0) + ")))";
			const expr = math.compile(expression);

			// evaluate the expression repeatedly for different values of x
			const xValues = math.range(0, 10, 0.1).toArray();
			const yValues = xValues.map(function (x) {
				return expr.evaluate({x: x});
			});

			// render the plot using plotly
			const trace1 = {
				x: xValues,
				y: yValues,
				type: 'scatter'
			};

			const layout = {
				width: 250,
				height: 250,
				xaxis: {
					title: {
						text: 'Time',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Displacement',
						font: {
							family: 'Courier New, monospace',
							size: 10,
							color: '#000000'
						}
					}
				}
			};

			const config = {responsive: true};
			const data = [trace1];
			Plotly.newPlot('timePlot', data,layout,config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	drawTimeGraph();
})
function openGraph(evt, graphName) {
  var i, graphcontent;
  graphcontent = document.getElementsByClassName("graphcontent");
  for (i = 0; i < graphcontent.length; i++) {
    graphcontent[i].style.display = "none";
  }
  document.getElementById(graphName).style.display = "block";
  evt.currentTarget.className += "active";
}
function openGraph(evt, graphName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("graphcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(graphName).style.display = "block";
  evt.currentTarget.className += " active";
}