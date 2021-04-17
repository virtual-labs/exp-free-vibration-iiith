document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');
	const dampButton = document.getElementById('damping');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});
	dampButton.addEventListener('click', function() { isdamp = 1-isdamp ; restart();});

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		rod = [[startx, starty], [endx, starty], [endx, starty + height], [startx, starty + height]];

		ground = [
			[startx - margin, starty + height + 40],
			[startx - margin, starty + height],
			[endx + margin, starty + height],
			[endx + margin, starty + height + 40],
		];
		curr_t = 0;
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const slider_mass = document.getElementById("mass");
	const output_mass = document.getElementById("demo_mass");
	output_mass.innerHTML = slider_mass.value; // Display the default slider value

	slider_mass.oninput = function() {
		output_mass.innerHTML = this.value;
		mass = Number(document.getElementById("mass").value);
		radius = mass / 10000;
		restart();
	};

	const slider_vel = document.getElementById("velocity");
	const output_vel = document.getElementById("demo_velocity");
	output_vel.innerHTML = slider_vel.value; // Display the default slider value

	slider_vel.oninput = function() {
		output_vel.innerHTML = this.value;
		dev = Number(document.getElementById("velocity").value);
		restart();
	};

	const slider_vibe = document.getElementById("vibration");
	const output_vibe = document.getElementById("demo_vibration");
	output_vibe.innerHTML = slider_vibe.value; // Display the default slider value

	slider_vibe.oninput = function() {
		output_vibe.innerHTML = this.value;
		vibe = Number(document.getElementById("vibration").value);
		restart();
	};

	const slider_stiff = document.getElementById("stiff");
	const output_stiff = document.getElementById("demo_stiff");
	output_stiff.innerHTML = slider_stiff.value; // Display the default slider value

	slider_stiff.oninput = function() {
		output_stiff.innerHTML = this.value;
		stiffness = Number(document.getElementById("stiff").value);
		restart();
	};

	const slider_etta = document.getElementById("etta");
	const output_etta = document.getElementById("demo_etta");
	output_etta.innerHTML = slider_etta.value; // Display the default slider value

	slider_etta.oninput = function() {
		output_etta.innerHTML = this.value;
		etta = Number(document.getElementById("etta").value);
		etta /= 100;
		restart();
	};

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
	let vibe = 100;	// intial disaplcement
	let dev = 1000; // intial velocity
	let mass = 136000; 
	let stiff = 30 * 1000000;
	let isdamp = 0;
	let etta = 0.05;

	let radius = mass / 10000;

	// Derived Parameters
	let curr_t = 0;
	let omegan = math.sqrt(stiff / mass);
	let omega0 = omegan * Math.sqrt(1 - (etta * etta));
	let curr_displacement = vibe * (Math.cos(omegan * curr_t)) + (dev * (Math.sin(omegan * curr_t))) / omegan;
	let damped_displacement = (Math.exp(-1 * etta * omega0 * curr_t)) * (vibe * (Math.cos(omega0 * curr_t)) + ((dev + etta * omegan * vibe) * Math.sin(omegan * curr_t)) / omegan);

	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9";
	const border = "black";
	const lineWidth = 1.5;

	const fps = 15;

	let rod = [[startx, starty], [endx, starty], [endx, starty + height] , [startx, starty + height]];

	let ground = [
		[startx - margin, starty + height + 40],
		[startx - margin, starty + height],
		[endx + margin, starty + height],
		[endx + margin, starty + height + 40],
	];

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
			curr_displacement = (Math.exp(-1 * etta * omega0 * curr_t)) * (vibe * (Math.cos(omega0 * curr_t)) + ((dev + etta * omegan * vibe) * Math.sin(omegan * curr_t)) / omega0);
		}
		else
		{
			curr_displacement = vibe * (Math.cos(omegan * curr_t)) + (dev * (Math.sin(omegan * curr_t))) / omegan;
		}

		newv = v[0][0] + curr_displacement;
		newv2 = v[1][0] + curr_displacement;

		ctx.beginPath();
		ctx.moveTo(newv, v[0][1]);
		ctx.lineTo(newv2, v[1][1]);
		ctx.lineTo(v[2][0], v[2][1]);
		ctx.lineTo(v[3][0], v[3][1]);
		ctx.lineTo(newv, v[0][1]);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(newv -radius, v[0][1]);
		ctx.bezierCurveTo(newv-radius, v[0][1] - radius, newv2 + radius, v[0][1] - radius, newv2 + radius, v[1][1]);
		ctx.bezierCurveTo(newv2 + radius, v[1][1] + radius, newv - radius, v[1][1] + radius, newv - radius, v[0][1]);
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
			const coef = 2 * Math.PI / (math.sqrt(stiff));
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
				width: 450,
				height: 450,

				xaxis: {
					title: {
						text: 'Mass',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Time Period',
						font: {
							family: 'Courier New, monospace',
							size: 18,
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
			const coef = 2 * Math.PI * (math.sqrt(mass));
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
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: 'Stiffness',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Time Period (s)',
						font: {
							family: 'Courier New, monospace',
							size: 18,
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
			let omegan = math.sqrt(stiff / mass);
			let omega0 = omegan * Math.sqrt(1 - (etta * etta));
			
			const expression = "exp(-1*x*" + String(etta*omega0) + ")" + "*(" + String(vibe) + "*cos(x*" + String(omega0) + ") + (" + String((dev + etta*omegan*vibe)/omega0) + "*sin(x*" + String(omega0) + ")))";
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
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: 'Time',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Displacement',
						font: {
							family: 'Courier New, monospace',
							size: 18,
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
