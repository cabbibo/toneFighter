
// From:
// https://github.com/cwilso/PitchDetect
// 

var rafID = null;
var tracks = null;
var buflen = 512;
var buf = new Uint8Array( buflen );
var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.


function pitchDetector( params ){

  this.analyser = analyser;
  this.rafID = null;
  this.tracks = null;
  this.bufferLength = 1024;
  this.minimumValue = 134;

  this.noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

}

pitchDetector.prototype = {

  findNextPositiveZeroCrossing: function( start ) {
	
    var i = Math.ceil( start );
	var last_zero = -1;
	
    // advance until we're zero or negative
	while (i< this.bufferLength && ( this.analyser.array[i] > 128 ) )
		i++;
	if ( i >= this.bufferLength )
		return -1;

	// advance until we're above MINVAL, keeping track of last zero.
	while (i< this.bufferLength && ((t=this.analyser.array[i]) < this.minimumValue )) {
	  if (t >= 128) {
  		if (last_zero == -1)
          last_zero = i;
	  } else
  		last_zero = -1;
      
      i++;
	}

	// we may have jumped over MINVAL in one sample.
	if (last_zero == -1)
		last_zero = i;

	if (i==buflen)	// We didn't find any more positive zero crossings
		return -1;

	// The first sample might be a zero.  If so, return it.
	if (last_zero == 0)
		return 0;

	// Otherwise, the zero might be between two values, so we need to scale it.

    var lz  = this.analyser.array[ last_zero ];
    var lz1 = this.analyser.array[ last_zero - 1 ];
	var t = ( 128 - lz1 ) / ( lz - lz1 );
	return last_zero+t;
  },

  noteFromPitch: function( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
  },


  frequencyFromNoteNumber: function( note ) {
	return 440 * Math.pow(2,(note-69)/12);
  },

  centsOffPitch: function( frequency, note ) {
	return Math.floor( 1200 * Math.log( frequency / this.frequencyFromNoteNumber( note ))/Math.log(2) );
  },

  updatePitch: function() {
	
    var cycles = new Array;

	var i=0;
	// find the first point
    var last_zero = this.findNextPositiveZeroCrossing( 0 );

	var n=0;
	// keep finding points, adding cycle lengths to array
	while ( last_zero != -1) {
		var next_zero = this.findNextPositiveZeroCrossing( last_zero + 1 );
		if (next_zero > -1)
			cycles.push( next_zero - last_zero );
		last_zero = next_zero;

		n++;
		if (n>1000)
			break;
	}

	// 1?: average the array
	var num_cycles = cycles.length;
	var sum = 0;
	var pitch = 0;

	for (var i=0; i<num_cycles; i++) {
	  sum += cycles[i];
	}

	if (num_cycles) {
	  sum /= num_cycles;
	  pitch = musicContext.sampleRate/sum;
	}

	var confidence = (num_cycles ? ((num_cycles/(pitch * buflen / musicContext.sampleRate)) * 100) : 0);

    if( num_cycles == 0 ){
      return;
    }else{

      this.pitch      = pitch;
      this.confidence = confidence;

      this.note       = this.noteFromPitch( this.pitch );
      this.detune     = this.centsOffPitch( this.pitch , this.note );
    
    } 
  }

}
