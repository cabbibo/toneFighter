
var musicContext  = new webkitAudioContext();
var masterGain    = musicContext.createGainNode();
var analyser      = musicContext.createAnalyser();
analyser.fftSize  = 1024 ;

analyser.connect( masterGain );
masterGain.connect( musicContext.destination );

analyser.array = [];

function updateAudio(){

  analyser.array = new Uint8Array( analyser.frequencyBinCount );
  analyser.getByteFrequencyData( analyser.array );


}


