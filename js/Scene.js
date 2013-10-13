
    var SS = 1000;
    var clock, camera, scene, container, renderer, stats;

    var theta = 0;


    var geo;
    var data;


    function init(){


      clock = new THREE.Clock();

      camera = new THREE.PerspectiveCamera( 50 , window.innerWidth / window.innerHeight , SS / 1000 , SS * 20 );
      camera.position.z = SS ;

      scene = new THREE.Scene();

      geo = new THREE.SphereGeometry( SS / 10 , 50 , 10);
      data = geo.clone();

      for( var i = 0; i < 10; i++){

      var testMat = new THREE.MeshNormalMaterial();
      var testMesh = new THREE.Mesh( geo , testMat );

      testMesh.rotation.z = Math.PI * 2  * ( i/10 );
      scene.add( testMesh );

      }

      container = document.getElementById( 'container' );
	  
      renderer = new THREE.WebGLRenderer( { antialias: true, clearColor:0x000000 } );
	  renderer.setSize( window.innerWidth, window.innerHeight );

      container.appendChild( renderer.domElement );

      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      container.appendChild( stats.domElement );
    

      
      window.addEventListener( 'resize', onWindowResize, false );


    }


     function animate(){

      theta += clock.getDelta();

      updateAudio();
      deformMesh();

      pitchDetector.updatePitch();
      stats.update();
      renderer.render( scene , camera )


    }   

    function deformMesh(){

      for( var i = 0; i < geo.vertices.length; i++ ){

        if( analyser.array[i] ){
        
          var v =  geo.vertices[i];
          var d = data.vertices[i];

          v.x = d.x * ( 1 + (analyser.array[i]/256) );
          v.y = d.y * ( 1 + (analyser.array[i]/256) );
          v.z = d.z * ( 1 + (analyser.array[i]/256) );


        }


      }

      geo.verticesNeedUpdate = true;

    }
    function startAnimation() {

      animate();
      requestId = window.requestAnimationFrame(startAnimation);

    }

    
    function stopAnimation() {
      if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = undefined;
      }
    }

    
    function onWindowResize() {

      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

