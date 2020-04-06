/**
* Tock by Mr Chimp - github.com/mrchimp/tock
* Based on code by James Edwards:
*    sitepoint.com/creating-accurate-timers-in-javascript/
*/

/**
* Modified by Firebrand for use in `password`: https://github.com/FirebrandCoding/password
*/

/**
* Called every tick for countdown clocks.
* i.e. once every this.interval ms
*/
function _tick () {
	
	this.time.current += this.interval;
	
	if (this.countdown && this.duration - this.time.current < 0) {
		
		this.time.ended = 0;
		this.running    = false;
		
		this.callback();
		
		clearTimeout(this.timeout);
		
		this.complete();
		
		return;
		
	} else {
		
		this.callback();
		
	}
	
	var diff              = _delta(this.time.started) - this.time.current,
		untilNextInterval = this.interval - Math.max(diff, 0);
	
	if (untilNextInterval <= 0) {
		
		this.ticksMissed   = Math.floor(Math.abs(untilNextInterval) / this.interval);
		this.time.current += this.ticksMissed * this.interval;
		
		if (this.running) this._tick();
		
	} else if (this.running) {
		
		this.timeout = setTimeout(this._tick.bind(this), untilNextInterval);
		
	};
	
};

function _delta (source = 0) { return Date.now() - source };

/**
* Called by Tock internally - use start() instead
*/
function _startCountdown (duration) {
	
	this.duration     = duration;
	this.time.started = Date.now();
	this.time.current = 0;
	
	this.running      = true;
	
	this._tick();
	
}

/**
* Called by Tock internally - use start() instead
*/
function _startTimer (offset) {
	
	this.time.started = offset || Date.now();
	this.time.current = 0;
	
	this.running      = true;
	
	this._tick();
	
}

var Tock = function (options) {
	
	let defaults = {
		
		running:    false,
		countdown:  false,
		
		timeout:     null,
		ticksMissed: null,
		
		interval:     100,

		time: {

			current:    0,

			started:    0,
			paused:     0,
			ended:      0,

			base:       0

		},
		
		duration:       0,
		
		callback    () {},
		complete    () {}
		
	};

	let result = Object.assign(defaults, options);
	
	Object.assign(this, result);
	
	if (!this instanceof Tock) return new Tock(options);
	
};

Tock.prototype._tick           = _tick;
Tock.prototype._startCountdown = _startCountdown;
Tock.prototype._startTimer     = _startTimer;
Tock.prototype._delta          = _delta;

/**
* Reset the clock
*/
Tock.prototype.reset = function () {
	
	if (this.countdown) return false;
	
	this.stop();
	this.time.started = this.time.current = 0;
	
};

/**
* Restart (stop → start) the clock
*/
Tock.prototype.restart = function () {
	
	this.stop();
	this.start(this.time.base);
	
};

/**
* Start the clock.
* @param {Various} time Accepts a single "time" argument in ms
*/
Tock.prototype.start = function (time = 0) {
	
	if (this.running) return false;
	
	this.time.started = this.time.base = time;
	this.time.paused  = 0;

	this.countdown
			? this._startCountdown(time)
			: this._startTimer(_delta(time));
	
};

/**
* Stop the clock and clear the timeout
*/
Tock.prototype.stop = function () {
	
	this.time.paused = this.left();
	this.running     = false;
	
	clearTimeout(this.timeout);
	
	this.time.ended = this.countdown
							? this.duration - this.time.current
							: _delta(this.time.started);
	
};

/**
* Stop/start the clock.
*/
Tock.prototype.pause = function () {
	
	if (this.running) {
		
		this.time.paused = this.left();
		this.stop();
		
		return;
		
	};
	
	if (this.time.paused) {
		
		this.countdown
				? this._startCountdown(this.time.paused)
				: this._startTimer(_delta(this.time.paused));
		
		this.time.paused = 0;
		
	}
	
};

/**
* Get the current clock time in ms.
* Use with Tock.msToTime() to make it look nice.
* @return {Integer} Number of milliseconds ellapsed/remaining
*/
Tock.prototype.left = function () {
	
	if (!this.running) return this.time.paused || this.time.ended;
	
	let now  = _delta(this.time.started),
		left = Math.abs(!!this.countdown * this.duration - now);
	
	return left;
	
};

Tock.prototype.reduce = function (value) {

	this.duration = Math.max(this.duration - value, 0);

};