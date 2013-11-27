tool.minDistance = 10;
tool.maxDistance = 35;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 $(document).ready(function(e) {

 	$('#controls').css('display','block').css('width','100%');
	$('.show').css('display','none');
	$('.color').css('display','inline-block').css('width',50).css('height',50);
	$('#size').css('width',150);$('#clear').css('width',100).css('height',50).css('font-size','1.5em');
	$('canvas').css('display','block');
	$('header nav').css('font-size','1.5em');
	$('#send').css('width',100).css('height',50).css('font-size','1.2em');
	$('.close').css('width',100).css('height',50).css('font-size','1.2em');
	$('.chath').css('width',100).css('height',50).css('font-size','1.2em');
	$('#text').css('width',200).css('height',50).css('font-size','1.5em');
	$('#chat').css('width',550).css('height',300).css('font-size','1.5em');
	$('.chat').css('left',0).css('position','relative');
});
}
$('.close').on('click', function() {

    $('.chat').css('display','none');
    $('.chath').css('display','block');
});
$('.chath').on('click', function() {
	 $('.chat').css('display','block');
	 $('.chath').css('display','none');
});
	
// Initialise Socket.io
var socket = io.connect('/');

// Random User ID
// Used when sending data
var uid =  (function() {
     var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
} () );



// JSON data ofthe users current drawing
// Is sent to the user
var path_to_send = {};

// Calculates colors
var active_color_rgb;
var active_color_json = {};
var $opacity = 255;//$('#opacity');
var update_active_color = function() {

    var rgb_array =  $('.active').attr('data-color').split(',');
    var red = rgb_array[0] / 255;
    var green = rgb_array[1] / 255;
    var blue = rgb_array[2] / 255;
    var opacity =  $opacity / 255;

    active_color_rgb =  new RgbColor( red, green, blue, opacity );
    active_color_rgb._alpha = opacity;

    active_color_json = {
        "red" : red,
        "green" : green,
        "blue" : blue,
        "opacity" : opacity
    };

};




// Get the active color from the UI eleements
update_active_color();


// --------------------------------- 
// DRAWING EVENTS


var send_paths_timer;
var timer_is_active = false;


//New functions for better use of the app




function onMouseDown(event) {

    var point = event.point;

    path = new Path();
    path.fillColor = active_color_rgb;
    path.add(event.point);

    // The data we will send every 100ms on mouse drag
    path_to_send = {
        rgba : active_color_json,
        start : event.point,
        path : []
    };


}

function onMouseDrag(event) {
    
    var step = event.delta / 2;
    var ian = 30;
	if($('#size').val()<=30) ian = 20;
	if($('#size').val()>=30 & $('#size').val()<=60) ian = 50;
	if($('#size').val()>=65) ian = 70;
	console.log(ian);
	step.angle += ian;
	 
	//step.angle += $('#size').val();
    
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;
    
    path.add(top);
    path.insert(0, bottom);
    path.smooth();
	//path.add( event.point );

    // Add data to path
    path_to_send.path.push({
        top : top,
        bottom : bottom
    });

    // Send paths every 50ms
    if ( !timer_is_active ) {

        send_paths_timer = setInterval( function() {

            socket.emit('draw:progress', uid, JSON.stringify(path_to_send) );
            path_to_send.path = new Array();

        }, 50);

    }

    timer_is_active = true;

}


function onMouseUp(event) {
   
    // Close the users path
    path.add(event.point);
    path.closed = true;
    path.smooth();

    // Send the path to other users
    path_to_send.end = event.point;
    socket.emit('draw:end', uid, JSON.stringify(path_to_send) );

    // Stop new path data being added & sent
    clearInterval(send_paths_timer);
    path_to_send.path = new Array();
    timer_is_active = false;

}


var borrar = function borrar() {
			this.activeLayer.remove();
    		var layer = new Layer();
			}

function onKeyDown(event) {
    if(event.key == 'space') {
    
    }
	if( event.code == 27 )//  Escape
					{
						paper.project.deactivateChildren();
						paper.project.deselectChildren();
						return false;
					};
					if( event.key == 'Z')
					{
						paper.project.undo();
						return false;
					};
}
/*
$(document).addEvent( 'keydown', function( event )
			{
					if( event.code == 27 )//  Escape
					{
						paper.project.deactivateChildren();
						paper.project.deselectChildren();
						return false;
					};
					if( k == 'Z' && !SC.keyShift && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.undo();
						return false;
					};
			});*/

// --------------------------------- 
// CONTROLS EVENTS

var $color = $('.color');
$color.on('click', function() {

    $color.removeClass('active');
    $(this).addClass('active');

    update_active_color();

});

/*$opacity.on('change', function() {

    update_active_color();

});*/

var $width = $('.size div');
$width.on('click', function() {

    $width.removeClass('active');
    $(this).addClass('active');


});

$('div.show').on('click', function() {

	$('div.show div').css('display','block');
    //$(this).addClass('');
	


});








// --------------------------------- 
// SOCKET.IO EVENTS
 //$(document).ready(function () {
         
        socket.on('message', function (data) {
          $('#chat').append(data.text + '<br />');
        });
      
        $('#send').click(function () {
          socket.emit('sendMessage', { text: $('#text').val() });
          $('text').val('');
		  console.log($('#text').val());
        });
    
   //   });

socket.on('draw:progress', function( artist, data ) {

    // It wasnt this user who created the event
    if ( artist !== uid && data ) {

       progress_external_path( JSON.parse( data ), artist );

    }

}); 

socket.on('draw:end', function( artist, data ) {

    // It wasnt this user who created the event
    if ( artist !== uid && data ) {
       end_external_path( JSON.parse( data ), artist );
    }

}); 

socket.on('user:connect', function(user_count) {
    update_user_count( user_count );
});

socket.on('user:disconnect', function(user_count) {
    update_user_count( user_count );
});






// --------------------------------- 
// SOCKET.IO EVENT FUNCTIONS


// Updates the active connections
var $user_count = $('#userCount');
var $user_count_wrapper = $('#userCountWrapper');
function update_user_count( count ) {

    $user_count_wrapper.css('opacity', 1);
    $user_count.text(  " " + count );

}


var external_paths = {};

// Ends a path
var end_external_path = function( points, artist ) {

    var path = external_paths[artist];

    if ( path ) {

        // Close the path
        path.add(points.end);
        path.closed = true;
        path.smooth();

        // Remove the old data
        external_paths[artist] = false;

    }

};

// Continues to draw a path in real time
progress_external_path = function( points, artist ) {


    var path = external_paths[artist];

    // The path hasnt already been started
    // So start it
    if ( !path ) {

        // Creates the path in an easy to access way
        external_paths[artist] = new Path();
        path = external_paths[artist];

        // Starts the path
        var start_point = new Point(points.start.x, points.start.y);
        var color = new RgbColor( points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity );
        path.fillColor = color;
        path.add(start_point);

    }

    // Draw all the points along the length of the path
    var paths = points.path;
    var length = paths.length;
    for (var i = 0; i < length; i++ ) {

        path.add(paths[i].top);
        path.insert(0, paths[i].bottom);

    }

    path.smooth();


    view.draw();



};


