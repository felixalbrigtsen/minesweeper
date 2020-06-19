// Felix Albrigtsen

var timerInterval = undefined;
var timer_hasCheated = false;
var timer_running = false;
var timer_ms = 0;

function startTimer() {
	if (timer_running) { return; }
	timer_ms = 0;
	timer_running = true;
	timerInterval = setInterval(timerTick, 10);
}

function stopTimer() {
	if (!timer_running) { return; }
	timer_running = false;
	clearInterval(timerInterval);
	timerInterval = undefined;
}

function timerTick() {
	timer_ms++;
	var t_centisecond = (timer_ms % 100);
	var t_second = ((timer_ms - t_centisecond) % (100*60))/100;
	var t_minute = (timer_ms - (t_second*100) - t_centisecond) / (100*60);
	
	t_centisecond = ("00" + t_centisecond).substr(-2, 2);
	t_second = ("00" + t_second).substr(-2, 2);
	t_minute = ("00" + t_minute).substr(-2, 2);
	
	document.getElementById("timerText").innerHTML = t_minute + ":" + t_second + ":" + t_centisecond;
	
	if (timer_hasCheated) {
		document.getElementById("timerText").style.color = "red";
	} else {
		document.getElementById("timerText").style.color = "green";
	}
}