    //////////////////////
   //                  //
  //   SC Namespace   //
 //                  //
//////////////////////


//  Let's package everything in an object called 'SC' 
// (originally stood for 'Stewdio Chatr').
//  This keeps our global namespace tidy, a good thing.
//  And in the future we might want private variables.

var SC = 
{
	name    : 'chatttr',
	version : '2012-03-15-1319',
	beta    :  true,
	debug   :  false,
	ioUrl   : 'http://chatttr.com/scripts/chatttr-io.js',


	jumpDefaultString : 'Enter room name',
	jumpDefaultState  :  true,
	userDefaultString : 'anonymous',
	userDefaultState  :  true,
	scrolledOnBoot    :  false,
	timingFlag        :  null,
	lastUpdated       :  null,
	delta             :  0,
	missedMessages    :  0,
	documentHasFocus  :  true,
	lastInputFocus    :  null,

	pointLimitDrawing :  400,//400
	pointLimitDrawn   :  200,//200
	pointLimitFlag    :  false,

	keyShift   : false,
	keyControl : false,
	keyOption  : false,// Alt
	keyCommand : false,


	boot : function()
	{	
		if( $( '#pleaseEnableJS' )) $( '#pleaseEnableJS' ).remove();
		$$( '.deckBossing' ).removeClass( 'debossedTop' );
		if( $( '#loadingChats' )) $( '#loadingChats' ).setStyle( 'display', 'block' );

		SC.getTimingFlag();
		SC.buildCharMaps();
		SC.extendPaper();
		SC.createSketchPad();
		SC.play();
		SC.highlightReplies();
		SC.timeAgoInterval = setInterval( SC.updateTimesAgo, 1000 );
	
		
		//  Room Jumper
		
		if( $( '#jump' ).getValue() !== SC.jumpDefaultString )
		{
			SC.jumpDefaultState = false;	
		};
		$( '#jump' ).addEvent( 'click', function()
		{
			if( SC.jumpDefaultState )
			{
				if( this.getValue() == SC.jumpDefaultString ) this.setValue();
				SC.jumpDefaultState = false;
			};
		});
		$( '#jump' ).addEvent( 'blur', function()
		{
			this.setValue( this.getValue().trim() );
			if( this.getValue() == '' )
			{
				this.setValue( SC.jumpDefaultString );
				SC.jumpDefaultState = true;
			};
		});
		$( '#jump' ).addEvent( 'keypress', function( e )
		{
			if( e.key == 'enter' ) SC.jump();
			return true;
		});
		
		
		//  User Name
		
		if( $( '#u' ).getValue() !== SC.userDefaultString )
		{
			SC.userDefaultState = false;	
		};
		$( '#u' ).addEvent( 'click', function()
		{
			if( SC.userDefaultState )
			{
				if( this.getValue() == SC.userDefaultString ) this.setValue();
				SC.userDefaultState = false;
			};
		});
		$( '#u' ).addEvent( 'blur', function()
		{
			this.setValue( this.getValue().trim() );
			if( this.getValue() == '' )
			{
				this.setValue( SC.userDefaultString );
				SC.userDefaultState = true;
			};
			SC.highlightReplies();
		});


		//  Submit Form

		$( '#deck' ).addEvent( 'keypress', function( e )
		{
			if( e.key == 'enter' && SC.keyShift === false )
			{
				SC.send();
				return false;
			};
		});
		$( '#type' ).focus();
		
		
		//  Keep track of missed messages
		//  Perhaps in the future we can actually apply a style to missed messages;
		//  a more subtle highlighting that would go away when clicked. Too much?
		
		$window
			.addEvent( 'blur', function()
			{
				SC.documentHasFocus = false;
			})
			.addEvent( 'focus', function()
			{
				SC.documentHasFocus = true;
				SC.missedMessages = 0;
			});
		
		
		//  Add a 'isFocussed' flag to all INPUTs and TEXTAREAs
		
		$$( 'input, textarea' ).setProperty( 'hasFocus', false );
		$$( 'input, textarea' ).addEvent( 'focus', function()
		{
			SC.lastInputFocus = this;
		});
		$( '#otp' ).addEvent( 'change', function()
		{
			SC.decryptAll();
		});
		
				
		$window
			.addEvent( 'keydown', function( event )
			{
				switch( event.code )
				{
					case  16 : SC.keyShift   = true; break;
					case  17 : SC.keyControl = true; break;
					case  18 : SC.keyOption  = true; break;
					case  91 :
					case  93 :
					case 224 : SC.keyCommand = true; break;
				};
			})
			.addEvent( 'keyup', function( event )
			{
				switch( event.code )
				{
					case  16 : SC.keyShift   = false; break;
					case  17 : SC.keyControl = false; break;
					case  18 : SC.keyOption  = false; break;
					case  91 :
					case  93 :
					case 224 : SC.keyCommand = false; break;
				};
			});
		$document
			.addEvent( 'keydown', function( event )
			{
				if( $( '#sketchPadContainer' ).getProperty( 'focused' ) === 'true' )
				{
					var k = event.key.toUpperCase();
					if( k == 'A' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.activateChildren();
						return false;
					};
					if( k == 'C' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.copy();
						return false;
					};
					if( k == 'E' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.exportSVG();
						return false;
					};
					if( k == 'V' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.paste();
						return false;
					};
					if( k == 'X' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.cut();
						return false;
					};
					if( k == 'Z' && !SC.keyShift && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.undo();
						return false;
					};
					if( k == 'Z' && SC.keyShift && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.redo();
						return false;
					};
					
					
					
					/*
					if(( k == '+' || k == '=' ) && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.scaleUp();
						return false;
					};
					if( k == '-' && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.scaleDown();
						return false;
					};
					if(( k == '<' || k == ',' ) && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.rotateCC();
						return false;
					};
					if(( k == '>' || k == '.' ) && ( SC.keyCommand || SC.keyControl ))
					{
						paper.project.rotateC();
						return false;
					};
					if( event.code == 37 )//  Left
					{
						paper.project.moveLeft();
						return false;
					};
					if( event.code == 38 )//  Up
					{
						paper.project.moveUp();
						return false;
					};
					if( event.code == 39 )//  Right
					{
						paper.project.moveRight();
						return false;
					};
					if( event.code == 40 )//  Down
					{
						paper.project.moveDown();
						return false;
					};*/
					if( event.code == 27 )//  Escape
					{
						paper.project.deactivateChildren();
						paper.project.deselectChildren();
						return false;
					};/*
					if( event.code == 8 && event.code == 46 )//  Backspace or Delete
					{
						paper.project.removeActiveChildren();
						return false;
					};
					*/
				};
				return true;
			});
	}
};








/*

	@@ TO-DO

	Reimplement feature Undo + Redo with this new structure.
	Add feature Add Point + Remove Point to paper.Path.
	Add feature SVG exporter.
	Debug feature Indirect Selector tool.

*/








    //////////////////////
   //                  //
  //   Extend Paper   //
 //                  //
//////////////////////


SC.extendPaper = function()
{
	paper.Project.inject(
	{
		clipboard: [],
		countPoints: function()
		{
			var p,
				points = 0;
			for( p = 0; p < this.activeLayer.children.length; p ++ )
			{
				points += this.activeLayer.children[ p ].segments.length
			};
			return points;
		},




		selectChildren: function()
		{
			var l, c;
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					this.layers[ l ].children[ c ].select();
				};
			};
			this._scope.view.draw();
		},
		deselectChildren: function()
		{
			var l, c;
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					this.layers[ l ].children[ c ].deselect();
				};
			};
			this._scope.view.draw();	
		},




		activateChildren: function()
		{
			var l, c;
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					this.layers[ l ].children[ c ].activate();
				};
			};
			this._scope.view.draw();
		},
		deactivateChildren: function()
		{
			var l, c;
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					this.layers[ l ].children[ c ].deactivate();
				};
			};
			this._scope.view.draw();
		},
		getActivePaths: function()
		{
			var l,
				c,
				actives = [];
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					if( this.layers[ l ].children[ c ].active )
						actives.push( this.layers[ l ].children[ c ] );
				};
			};
			return actives;
		},
		getActiveSegments: function()
		{
			var l,
				c,
				s,
				actives = [];
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = 0; c < this.layers[ l ].children.length; c ++ )
				{
					for( s = 0; s < this.layers[ l ].children[ c ].segments.length; s ++ )
					{
						if( this.layers[ l ].children[ c ].segments[ s ].active )
							actives.push( this.layers[ l ].children[ c ].segments[ s ] );
					};
				};
			};
			return actives;
		},
		removeActiveChildren: function()
		{
			var a, actives = this.getActivePaths();//@@  need to consider Segments in the future as well...
			for( a = 0; a < actives.length; a ++ )
			{
				actives[ a ].remove();
			};
		},




		clear: function()
		{
			var l,
				c;
			for( l = 0; l < this.layers.length; l ++ )
			{
				for( c = this.layers[ l ].children.length - 1; c >= 0 ; c -- )
				{
					this.layers[ l ].children[ c ].remove();
				};
			};
			this._scope.view.draw();
		},
		copy: function()
		{
			var a, 
				temp, 
				actives = this.getActivePaths();//@@  going to need to think about copying Segments as well here.
			if( actives.length > 0 )
			{
				this.clipboard = [];
				for( a = 0; a < actives.length; a ++ )
				{
					temp = actives[ a ].clone();
					temp.position.x = ( temp.position.x + 6 ) % this._scope.view.bounds.width;
					temp.position.y = ( temp.position.y + 6 ) % this._scope.view.bounds.height;
					this.clipboard.push( temp );
					temp.remove();
				};
			};
		},
		paste: function()
		{
			var c,
				child,
				points = 0;
			for( c = 0; c < this.clipboard.length; c ++ )
			{
				points += this.clipboard[ c ].segments.length;
			};
			if( this.countPoints() + points <= SC.pointLimitDrawing )
			{
				this.deactivateChildren();
				this.deselectChildren();
				for( c = 0; c < this.clipboard.length; c ++ )
				{
					child = this.clipboard[ c ].clone();
					this.clipboard[ c ].position.x = ( this.clipboard[ c ].position.x + 6 ) % this._scope.view.bounds.width;
					this.clipboard[ c ].position.y = ( this.clipboard[ c ].position.y + 6 ) % this._scope.view.bounds.height;
					this.activeLayer.addChild( child );
					child.activate();
				};
				this._scope.view.draw();
			};
		},
		cut: function()
		{
			this.copy();
			this.removeActiveChildren();
			this._scope.view.draw();
		},
		
		
		
		
		undo: function()
		{},
		redo: function()
		{},
		scaleUp: function()
		{},
		scaleDown: function()
		{},
		rotateCC: function()
		{},
		rotateC: function( degrees )//@@@  this is totally not done yet. waiting to find out more about Groups()
		{
			var actives = this.getActivePaths(),
				group, i;
			if( actives.length > 0 )
			{
				degrees = degrees || 1;
				group = new paper.Group( actives );
				group.rotate( degrees );
				for( i = 0; i < group.children.length; i ++ )
				{
				    this.activeLayer.addChild( group.children[ i ].clone());
				};
				group.remove();
			};
		},
		moveLeft: function()
		{},
		moveUp: function()
		{},
		moveRight: function()
		{},
		moveDown: function()
		{},
		
		
		
		
		activateTool: function( toolName )//  Had trouble injecting this directly into paper, so instead in paper.Project
		{
			$$( 'a.push' ).removeClass( 'selected' );
			$( 'a.push.' + toolName ).addClass( 'selected' );
			var tool = this._scope.tool;
			if( tool.onDeactivate !== undefined ) tool.onDeactivate();
			tool = this._scope.tools[ toolName ];
			tool.activate();
			if( tool.onActivate !== undefined ) tool.onActivate();
		},
		exportSVG: function()// WARNING! This is TOTALY WRONG right now. Will fix soon!
		{
			var svg,
				p,
				s,
				segment;
			svg  = '<?xml version="1.0" encoding="utf-8"?>';
			svg += '\n<!-- Generator: Chatttr ' + SC.version + ' http://chatttr.com -->';
			svg += '\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
			svg += '\n<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"';
			svg += '\n	width="300px" height="300px" viewBox="0 0 300 300" enable-background="new 0 0 300 300" xml:space="preserve">';
			for( var p = 0; p < this.activeLayer.children.length; p ++ )
			{
				svg += '\n<path fill="none" stroke="#000000" stroke-miterlimit="10" d="';
				for( s = 0; s < this.activeLayer.children[ p ].segments.length; s ++ )
				{
					segment = this.activeLayer.children[ p ].segments[ s ];
					if( s == 0 )
					{
						svg += 'M' + segment.point.x;
						svg += ',' + segment.point.y;
					};
					svg += 'c' + segment.handleIn.x;
					svg += ',' + segment.handleIn.y;
					svg += ',' + segment.handleOut.x;
					svg += ',' + segment.handleOut.y;
					svg += ',' + segment.point.x;
					svg += ',' + segment.point.y;
				};
				svg += '" />';
			};
			svg += '\n</svg>';
			return svg;
		},
		exportString: function()
		{
			var str,
				p,
				s,
				segment;
			str = '';
			for( var p = 0; p < this.activeLayer.children.length; p ++ )
			{
				str += 'p';
				for( s = 0; s < this.activeLayer.children[ p ].segments.length; s ++ )
				{
					segment = this.activeLayer.children[ p ].segments[ s ];
					str += 's';
					str += 'c' + segment.point.x;
					str += 'c' + segment.point.y;
					str += 'c' + segment.handleIn.x;
					str += 'c' + segment.handleIn.y;
					str += 'c' + segment.handleOut.x;
					str += 'c' + segment.handleOut.y;
				};
			};
			return str;
		},
		importString: function( str )
		{
			var paths,
				path,
				p,
				segments,
				segment,
				s,
				coords,
				point,
				handleIn,
				handleOut;
			paths = str.split( 'p' );
			for( p = 1; p < paths.length; p ++ )//  each Path
			{
				path = new paper.Path();
				path.strokeColor = 'black';
				segments = paths[ p ].split( 's' );
				for( s = 1; s < segments.length; s ++ )// each Segment
				{
					coords    = segments[ s ].split( 'c' );
					point     = new paper.Point( +coords[1], +coords[2] );
					handleIn  = new paper.Point( +coords[3], +coords[4] );
					handleOut = new paper.Point( +coords[5], +coords[6] );
					segment   = new paper.Segment( point, handleIn, handleOut );
					path.add( segment );
				};
			};
			this._scope.view.draw();
		}
	});
	paper.Path.inject(
	{
		active: false,
		activate: function( handles )
		{
			this.active = true;
			this.select( handles );
		},
		deactivate: function()
		{
			this.active = false;
			this.deselect();
		},
		select: function( handles )
		{
			var i;
			if( handles !== undefined )
			{
				for( i = 0; i < this.curves.length; i ++ )
				{
					this.curves[ i ].selected = true;
				};
			};
			this.selected = true;
		},
		deselect: function()
		{
			var i;
			if( this.active == false )
			{
				for( i = 0; i < this.curves.length; i ++ )
				{
					this.curves[ i ].selected = false;
				};
				this.selected = false;
			};
		},
		simplifyHandles: function()
		{
			var s;
			for( s = 0; s < this.segments.length; s ++ )
			{
				this.segments[ s ].simplifyHandles();
			};
		}
	});
	paper.Segment.inject(
	{
		active: false,
		activate: function( handles )
		{
			this.active = true;
			this.select();
		},
		deactivate: function()
		{
			this.active = false;
			this.deselect();
		},
		select: function( handles )
		{
			this.selected = true;
		},
		deselect: function()
		{
			this.selected = false;
		},
		simplifyHandles: function()
		{
			this.handleIn.x  = Math.round( this.handleIn.x  );
			this.handleIn.y  = Math.round( this.handleIn.y  );
			this.handleOut.x = Math.round( this.handleOut.x );
			this.handleOut.y = Math.round( this.handleOut.y );
		}
	});
	paper.Tool.inject(
	{
		onKeyPaths: function( event, selected )
		{
			var i;
			if( $( '#sketchPadContainer' ).getProperty( 'focused' ) === 'true' )
			{	
				switch( event.key )
				{
					case 'up':
						for( i = 0; i < selected.length; i ++ )
						{
							//console.log( selected[ i ] );
							selected[ i ].position.y -= 1;
						};
						return false;

					case 'down':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].position.y += 1;
						};
						return false;

					case 'left':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].position.x -= 1;
						};
						return false;

					case 'right':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].position.x += 1;
						};
						return false;

					case 'delete':
					case 'backspace':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].remove();
						};
						return false;

					case '<':
					case ',':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].rotate( -1 );
						};
						return false;

					case '>':
					case '.':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].rotate( 1 );
						};
						return false;

					case '+':
					case '=':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].scale( 1.1 );
						};
						return false;

					case '-':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].scale( 1 / 1.1 );
						};
						return false;
				};
			};
			return true;
		},
		onKeySegments: function( event, selected )
		{
			var i;
			if( $( '#sketchPadContainer' ).getProperty( 'focused' ) === 'true' )
			{
				switch( event.key )
				{
					case 'up':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].y -= 1;
						};
						return false;;

					case 'down':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].y += 1;
						};
						return false;

					case 'left':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].x -= 1;
						};
						return false;

					case 'right':
						for( i = 0; i < selected.length; i ++ )
						{
							selected[ i ].x += 1;
						};
						return false;

					//@@ Need to add remove(), scale(), rotate(), etc.
				};
			};
			return true;
		},
	});
};








    ////////////////////
   //                //
  //   Sketch Pad   //
 //                //
////////////////////


SC.createSketchPad = function()
{
	var project,
		segment,
		path,
		pencil,
		directSelector,
		indirectSelector;


	//  Paper.js runs its Key events on the entire Document!
	//  So we need to keep track of whether the canvas we care about is 
	//  currently in focus or not. 
	//  Also note, we can't test for true or false when checking the value.
	//  Instead we check for 'true' or 'false'
	//  Surprise! Booleans are actually saved as Strings with setProperty!

	$( document ).addEvent( 'mousedown', function()
	{
		$( '#sketchPadContainer' ).setProperty( 'focused', false );
	});
	$$( '#sketchPadContainer, .pushset, .tab[href=#sketchPadContainer]' ).addEvent( 'mousedown', function()
	{		
		$( '#sketchPadContainer' ).setProperty( 'focused', true );
		return false;//  Stop propagation up to the Document level.
	});
	$( '#sketchPadContainer' ).setProperty( 'focused', false );
	

	SC.sketchPad = new paper.PaperScope();
	SC.sketchPad.setup( 'sketchPad' );
	project = SC.sketchPad.project;
	

	pencil = new paper.Tool();
	paper.tools[ 'pencil' ] = paper.tools[ paper.tools.length - 1 ];
	pencil.hitOptions = {

		type:     'PathItem',
		segments:  true,
		fill:      false,
		stroke:    false,
		tolerance: 6
	};
	//pencil.maxDistance = 10;
	pencil.onActivate = function()
	{
		project.deactivateChildren();
		$( '#sketchPad' ).addClass( 'cursorPencil' );
	};
	pencil.onDeactivate = function()
	{
		$( '#sketchPad' ).removeClass( 'cursorPencil' );
	};
	pencil.onMouseDown = function( event )
	{
		project.deactivateChildren();
		path = new paper.Path();
	    path.strokeColor = 'black';
		if( !SC.pointLimitFlag && project.countPoints() < SC.pointLimitDrawn )
		{
		    path.add( event.point );
		}
		else
		{
			SC.pointLimitFlag = true;
		};
	};
	pencil.onMouseDrag = function( event )
	{
		if( project.countPoints() < SC.pointLimitDrawing )
		{
			path.add( event.point );
		};
		//var radius = event.delta.length / 2;
		//var circle = new Path.Circle(event.middlePoint, radius);
		//circle.fillColor = 'black';
		//path.segments[ path.segments.length - 1 ]._path._style._strokeWidth = event.delta.length / 2;
	};
	pencil.onMouseUp = function( event )
	{
	    path.simplify( 10 );
		path.simplifyHandles();
		if( path.length == 0 )
		{
			path.remove();
		}
		else path.activate();
	};
	pencil.onKeyDown = function( event )
	{
		var ret = true;//this.onKeyGlobals( event );
		ret = ret && this.onKeyPaths( event, project.getActivePaths() );
		return ret;
	};
	
	
	directSelector = new paper.Tool();
	paper.tools[ 'directSelector' ] = paper.tools[ paper.tools.length - 1 ];
	directSelector.grabbing = false;
	directSelector.hitOptions = {

		type:     'PathItem',
		segments:  false,
		fill:      false,
		stroke:    true,
		tolerance: 6
	};
	directSelector.onActivate = function()
	{
		var i,
			activePaths = project.getActivePaths();
		for( i = 0; i < activePaths.length; i ++ )
		{
			activePaths[ i ].deactivate();
			activePaths[ i ].activate();
		};
		$( '#sketchPad' ).addClass( 'cursorDirectSelector' );
	};
	directSelector.onDeactivate = function()
	{
		$( '#sketchPad' ).removeClass( 'cursorDirectSelector' );
	};
	directSelector.onMouseMove = function( event )
	{
		var hitResult = project.hitTest( event.point, directSelector.hitOptions );
		project.deselectChildren();
		if( hitResult )
		{
			hitResult.item.select();
		};
	};
	directSelector.onMouseDown = function( event )
	{
		var hitResult = project.hitTest( event.point, directSelector.hitOptions );
		if( hitResult )
		{
			if( hitResult.item.active === false 
				&& event.modifiers.shift === false )
			{
				project.deactivateChildren();
				project.deselectChildren();
			};
			path = hitResult.item;
			path.activate();
			directSelector.grabbing = true;

		}
		else
		{
			path = null;
			project.deactivateChildren();
			project.deselectChildren();
		};
	};
	directSelector.onMouseDrag = function( event )
	{
		var i, actives;
		if( directSelector.grabbing )
		{
			actives = paper.project.getActivePaths();
			for( i = 0; i < actives.length; i ++ )
			{
				//actives[ i ].position.add( event.delta );//!!! Not sure why this doesn't work. Bug?
				actives[ i ].position.x += event.delta.x;
				actives[ i ].position.y += event.delta.y;
			};
			this._scope.view.draw();//  Is this actually required here?
		};
	};
	directSelector.onMouseUp = function( event )
	{
		directSelector.grabbing = false;
	};
	directSelector.onKeyDown = function( event )
	{
		var ret = true;//this.onKeyGlobals( event );
		ret = ret && this.onKeyPaths( event, project.getActivePaths() );
		return ret;
	};


	indirectSelector = new paper.Tool();
	paper.tools[ 'indirectSelector' ] = paper.tools[ paper.tools.length - 1 ];
	indirectSelector.grabbing = null;
	indirectSelector.hitOptions = {

		type:     'PathItem',
		segments:  true,
		fill:      false,
		stroke:    true,
		handles:   true,
		tolerance: 6
	};
	indirectSelector.onActivate = function()
	{
		var i,
			activePaths = project.getActivePaths();
		for( i = 0; i < activePaths.length; i ++ )
		{
			activePaths[ i ].activate( true );
		};
		$( '#sketchPad' ).addClass( 'cursorIndirectSelector' );
	};
	indirectSelector.onDeactivate = function()
	{
		$( '#sketchPad' ).removeClass( 'cursorIndirectSelector' );
	};
	indirectSelector.onMouseMove = function( event )
	{
		var hitResult = project.hitTest( event.point, indirectSelector.hitOptions );
		project.deselectChildren();
		if( hitResult )
		{
			hitResult.item.select( true );
		};
	};
	indirectSelector.onMouseDown = function( event )
	{
		var hitResult = project.hitTest( event.point, indirectSelector.hitOptions );
		if( event.modifiers.shift == false )
		{
			path = segment = grabbing = null;
			project.deactivateChildren();
			project.deselectChildren();
		};
		if( hitResult )
		{
			path = hitResult.item;
			path.activate( true );
			if( hitResult.type !== 'stroke' )//  unfortunately for the moment we can't drag curves...
			{
				segment = hitResult.segment;
				segment.activate( true );			
				if( hitResult.type == 'stroke' )
					indirectSelector.grabbing = 'curve';
				else if( hitResult.type == 'segment' )
					indirectSelector.grabbing = 'point';				
				else if( hitResult.type == 'handle-in' )
					indirectSelector.grabbing = 'handleIn';
				else if( hitResult.type == 'handle-out' )
					indirectSelector.grabbing = 'handleOut';
			};
		};
	};
	indirectSelector.onMouseDrag = function( event )
	{
		if( indirectSelector.grabbing )
		{
			segment[ indirectSelector.grabbing ] = segment[ indirectSelector.grabbing ].add( event.delta );
		};
	};
	indirectSelector.onMouseUp = function( event )
	{
		//indirectSelector.grabbing = null;
	};
	indirectSelector.onKeyDown = function( event )
	{
		var ret = true;//this.onKeyGlobals( event );
		ret = ret && this.onKeySegments( event, [segment[ indirectSelector.grabbing ]] );
		return ret;
	};
	project.activateTool( 'pencil' );
};








    ///////////////////
   //               //
  //   Interface   //
 //               //
///////////////////


SC.jump = function()
{
	var jump = $( '#jump' ).getValue().trim();
	if( jump !== '' )
	{
		document.location.href = 'http://chatttr.com/' + jump;
	};
	return false;
};
SC.tab = function( tab )
{

	//  Get the tabContent HtmlElement we're interested in.
	//  We can either do this by using the intended href String
	// (assumes that each href is unique respective to tabSystems)
	//  or by an achor itself making this call.

	tab = typeof tab == 'string' ? $( '.tabSystem a[href=#'+ tab +']' ) : $( tab );


	//  Also get this element's tabSystem parent.
	//  We'll use this to shut all the open tabs.
	
	var parent = tab.getParent( '.tabSystem' );
	parent.getElements( '.tab' ).removeClass( 'selected' );
	parent.getElements( '.tabContent' ).setStyle( 'display', 'none' );


	//  It is now time to make it unclear
	//  To write off lines that don't make sense

	tab.addClass( 'selected' );

	var tabContent = parent.getElement( tab.getProperty( 'href' ));
	tabContent.setStyle( 'display', 'block' );
	if( tabContent.getTag() == 'textarea' ) tabContent.focus();
	
	
	//  Fucking ugly hack due to no time

	if( tabContent.getId() === 'sketchPadContainer' )
	{
		$( '.pushset' ).setStyle( 'display', 'block' );
	}
	else
	{
		$( '.pushset' ).setStyle( 'display', 'none' );	
	};
	
	
	return false;
};
SC.buildCharMaps = function()
{
	var symbols = 'â˜¼â˜â˜‚â„â˜ƒâœˆâ˜ºâ˜¹â™€â™‚â™”â™•â™–â™—â™˜â™™â™šâ™›â™œâ™â™žâ™ŸâœŽâœ‚âœ’âœ‰â˜Žâœ“âœ–â˜…â˜†âš‘âšâœ¿â™©â™ªâ™«â™¬â™­â™®â™¯â˜â˜Ÿâ˜œâ˜žâœŒâœâ†‘â†“â†â†’â¬‡â¬†ï£¿âŒ˜âŒ¥âŽ‡â‡§âŒ¤âŒ¦âŒ§âŒ«âŒšâŽŒâ†©â™ â™£â™¥â™¦âœ‡âš›â˜ â˜¢â˜£â˜¤â–â™ºâ˜­Â©Â®â„—â„ â„¢';
	var accents = [

		'Ã€Ã ', 'ÃÃ¡', 'Ã‚Ã¢', 'ÃƒÃ£', 'Ã„Ã¤', 'Ã…Ã¥', 'Ä€Ä', 'Ä„Ä…', 'Ä‚Äƒ', 'Ã†Ã¦',
		'Ã‡Ã§', 'Ä†Ä‡', 'ÄŒÄ', 'ÄˆÄ‰', 'ÄŠÄ‹',
		'ÄŽÄ', 'ÄÄ‘',
		'ÃˆÃ¨', 'Ã‰Ã©', 'ÃŠÃª', 'Ã‹Ã«', 'Ä’Ä“', 'Ä˜Ä™', 'ÄšÄ›', 'Ä”Ä•', 'Ä–Ä—',
		'Æ’',
		'ÄœÄ', 'ÄžÄŸ', 'Ä Ä¡', 'Ä¢Ä£',
		'Ä¤Ä¥', 'Ä¦Ä§',
		'ÃŒÃ¬', 'ÃÃ­', 'ÃŽÃ®', 'ÃÃ¯', 'ÄªÄ«', 'Ä¨Ä©', 'Ä¬Ä­', 'Ä®Ä¯', 'Ä°Ä±', 'Ä²Ä³',
		'Ä´Äµ',
		'Ä¶Ä·', 'Ä¸',
		'ÅÅ‚', 'Ä½Ä¾', 'Ä¹Äº', 'Ä»Ä¼', 'Ä¿Å€',
		'Ã‘Ã±', 'ÅƒÅ„', 'Å‡Åˆ', 'Å…Å†', 'ÅŠÅ‹', 'Å‰',
		'Ã’Ã²', 'Ã“Ã³', 'Ã”Ã´', 'Ã•Ãµ', 'Ã–Ã¶', 'Ã˜Ã¸', 'ÅŒÅ', 'ÅÅ‘', 'ÅŽÅ', 'Å’Å“',
		'Å”Å•', 'Å˜Å™', 'Å–Å—',
		'ÅšÅ›', 'Å Å¡', 'ÅžÅŸ', 'ÅœÅ', 'È˜È™',
		'Å¤Å¥', 'Å¢Å£', '', 'Å¦Å§', 'ÈšÈ›',
		'Ã™Ã¹', 'ÃšÃº', 'Ã›Ã»', 'ÃœÃ¼', 'ÅªÅ«', 'Å®Å¯', 'Å°Å±', 'Å¬Å­', 'Å¨Å©', 'Å²Å³',
		'Å´Åµ',
		'ÃÃ½', 'Å¶Å·', 'Å¸Ã¿',
		'Å¹Åº', 'Å½Å¾', 'Å»Å¼',
		'ÃžÃ¾',
		'ÃŸÅ¿',
		'ÃÃ°'
	];
	var currency = 'Â¤â‚ $Â¢Â£Â¥à¸¿â‚¡â‚¢â‚£â‚¤â‚¥â‚¦â‚§â‚¨â‚©â‚ªâ‚«â‚¬â‚­â‚®â‚¯â‚°â‚±';
	var punctuation = 'ââž!Â¡?Â¿â€½â€¦â€Ÿâ€œâ€â€žâ€›â€™â€šâ€²â€³\'"Â§Â¶â€¢Â«Â»â€¹â€º';
	var greek = [

		'Î‘Î±',  //'Alpha' ],
		'Î’Î²',  //'Beta' ],	
		'Î“Î³',  //'Gamma' ],	
		'Î”Î´',  //'Delta' ],
		'Î•Îµ',  //'Epsilon' ],
		'Î–Î¶',  //'Zeta' ],
		'Î—Î·',  //'Eta' ],
		'Î˜Î¸',  //'Theta' ],
		'Î™Î¹',  //'Iota' ],
		'ÎšÎº',  //'Kappa' ],
		'Î›Î»',  //'Lambda' ],
		'ÎœÎ¼',  //'Mu' ],
		'ÎÎ½',  //'Nu' ],
		'ÎžÎ¾',  //'Xi' ],
		'ÎŸÎ¿',  //'Omicron' ],
		'Î Ï€',  //'Pi' ],
		'Î¡Ï',  //'Rho' ],
		'Î£ÏƒÏ‚', //'Sigma' ],
		'Î¤Ï„',  //'Tau' ],
		'Î¥Ï…',  //'Upsilon' ],
		'Î¦Ï†',  //'Phi' ],
		'Î§Ï‡',  //'Chi' ],
		'Î¨Ïˆ',  //'Psi' ],
		'Î©Ï‰'   //'Omega' ],
	];
	var maths = '+âˆ’Ã—Ã·Â±âˆ•â„<>â‰¤â‰¥=â‰ â‰¡â‰…â‰ˆâˆ¼âˆâˆ©âˆªâŠ‚âŠ„âŠƒâŠ…âŠ†âŠ‡âˆˆâˆ‰âˆ‹âˆÂ¬â‡’â‡”âˆ€âˆƒâˆ„âˆ§âˆ¨âˆ´âˆ âŠ¥âˆžâ„µâˆšâˆ‚âˆ‡âˆ†âŒ âˆ«âˆ…âŠ•âˆ™â‹„â‹…âŽ®âŒ¡';
	var maps = [
		[ 'Symbols', symbols ],
		[ 'Accents', accents ],
		[ 'CurrencyPunc', currency ],
		[ 'CurrencyPunc', punctuation ],
		[ 'Maths', greek ],
		[ 'Maths', maths ],
	];
	for( var m = 0; m < maps.length; m ++ )
	{
		var map = maps[ m ][ 0 ];
		var item = maps[ m ][ 1 ];
		SC.parseCharMap( map, item );
	};
};
SC.parseCharMap = function( map, item )
{
	for( var i = 0; i < item.length; i ++ )
	{
		if( typeof item === 'string' )
		{
			SC.buildCharButton( map, item[ i ] );
		}
		else if( typeof item === 'object' )//  assume Array
		{
			SC.parseCharMap( map, item[ i ] );
			//  should check to see if item[i] is an array. if so the 2nd element is probably the label!			
		};
	};
};
SC.buildCharButton = function( map, character, label )
{
	var a = new HtmlElement( 'a' );
	a.setText( character );
	if( label ) a.setProperty( 'title', label );
	a.addClass( 'char' );
	a.addEvent( 'click', function()
	{
		var e = SC.lastInputFocus;
		if( !e ) e = $( '#type' );
		var m = e.getValue();
		var c = e.getCaret();
		var u = this.getText();
		if( e == $( '#u' ) && SC.userDefaultState == true )
		{
			SC.userDefaultState = false;
			m = '';
		};
		var part1 = m.substr( 0, c );
		var part2 = m.substr( c );
		e.setValue( part1 + u + part2 );
		e.setCaret( c + 1 );
		if( e == $( '#type' ) && $( '#type' ).getProperty( 'display' ) !== 'block' ) SC.tab( 'type' );
		return false;
	});
	$( '#map' + map ).appendChild( a );
};
SC.openDrawer = function()
{
	$( '#drawer' ).setStyle( 'display', 'block' );
	$( '#deck' ).setStyle( 'height', '440px' );
	$( '#drawerToggle' ).setText( 'Less' );
	scroll = new Fx.Scroll( $document, { duration: 500 });
	scroll.toBottom();
};
SC.closeDrawer = function()
{
	$( '#deck' ).setStyle( 'height', '216px' );
	$( '#drawer' ).setStyle( 'display', 'none' );
	$( '#drawerToggle' ).setText( 'More' );
};
SC.toggleDrawer = function()
{
	if( $( '#drawer' ).getStyle( 'display' ) !== 'block' )
	{
		SC.openDrawer();
	}
	else
	{
		SC.closeDrawer();		
	};
};








    ////////////////////////////
   //                        //
  //   Information Theory   //
 //                        //
////////////////////////////


//  Want to learn more about information theory?
//  Checkout the "Information & Entropy" course from MIT Open Courseware.
//  http://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-050j-information-and-entropy-spring-2008/

SC.compress = function( input )
{
	return input;// function TK
};
SC.decompress = function( input )
{
	return input;// function TK
};


//  Our chat encryption is at best a mild deterrent
//  and good practice is for the user to constantly change keys
//  in a one-time-pad manner.
//  I'd be excited for other developers to create bookmarklets
//  that augment the system here in various novel ways.

SC.crypt = function( input, direction )
{
	if( $( '#otp' ).getValue() !== '' )
	{
		var output = '';
		var key = $( '#otp' ).getValue();
		var k = 0;
		if( SC.debug )
		{
			console.log( 'Crypto received the following input and key:' );
			console.log( input );
			console.log( key );
		};
		for( var i = 0; i < input.length; i ++ )
		{
			var iCharCode = input.charCodeAt( i );
			var iChar     = input.charAt( i );
			var kCharCode = key.charCodeAt( k );
			var kChar     = key.charAt( i );
			var oCharCode = iCharCode + kCharCode * direction;
			var oChar     = String.fromCharCode( oCharCode );
			if( SC.debug )
			{
				console.log( iCharCode +' + '+ kCharCode +' * '+ direction +' = '+ oCharCode );
				console.log( iChar +' + '+ kChar +' * '+ direction +' = '+ oChar );
			};
			output += oChar;
			k = ( k + 1 ) % key.length;
		};
		if( SC.debug )
		{
			console.log( 'Applied crypto with the following result:' );
			console.log( output );
		};
		return output;
	};
	return input;
};
SC.encrypt = function( input )
{
	return SC.crypt( input, 1 );
};
SC.decrypt = function( input )
{
	return SC.crypt( input, -1 );
};
SC.decryptAll = function()
{
	$$( '.chatText' ).each( function( c )
	{
		if( c.getElement( '.encrypted' ))
		{
			var encrypted = c.getElement( '.encrypted' ).getText();
			if( c.getElement( '.decrypted' )) c.getElement( '.decrypted' ).remove();
			if( $( '#otp' ).getValue() !== '' )
			{
				var decryptDIV = new HtmlElement( 'div' )
					.addClass( 'decrypted' )
					.addClass( 't2' )
					//.setHtml( SC.joinBlocks( SC.enableStyle( SC.enableLinks( SC.textToBlocks( SC.htmlToText( SC.decrypt( encrypted )))))));//@@@@
					.setHtml( SC.decrypt( encrypted )
						.toFrags()
						.escapeHtml( true )
						.enableLinks()
						.educateType()
						.toString()
					);					
				c.appendChild( decryptDIV );
			};
		};
	});
	var scroll = new Fx.Scroll( $document, { duration: 0 });
	scroll.toBottom();
};
SC.setTimingFlag = function()
{
	var tf = "";
	for( var i = 0; i < 32; i ++ )
	{
		var c = Math.floor( Math.random() * 62 );
		if( c > 35 )
		{
			c += 97 - 36;
		}
		else if( c > 9 )
		{
			c += 65 - 10;			
		}
		else
		{
			c += 48;
		};
		tf += "" + String.fromCharCode( c );
	};
	Cookie.set( "timingFlag", tf );
};
SC.getTimingFlag = function()
{
	var c = Cookie.get( "timingFlag" );
	if( typeof c != 'string' || c.length != 32 )
	{
		SC.setTimingFlag();
		c = SC.getTimingFlag();
	};
	return c;
};








    //////////////////////
   //                  //
  //   Transactions   //
 //                  //
//////////////////////


SC.send = function()
{
	SC.pause();
	var requestUrl = SC.ioUrl;
	requestUrl += '&r=' + encodeURIComponent( $( '#r' ).getValue() );
	requestUrl += '&s=' + encodeURIComponent( $( '#s' ).getValue() );
	requestUrl += '&u=' + encodeURIComponent( $( '#u' ).getValue() );
	requestUrl += '&o=' + (+SC.delta);
	requestUrl += '&x=' + SC.getTimingFlag();
	if( SC.lastUpdated ) requestUrl += '&t=' + (+SC.lastUpdated);
	if( $( '#otp' ).getValue() !== '' ) requestUrl += '&e=1';
	var requestFlag = false;
	if( $( '#type' ).getStyle( 'display' ) !== 'none' &&
	 	$( '#type' ).getValue() !== '' )
	{
		requestFlag = true;
		var m = $( '#type' ).getValue();
		if( $( '#otp' ).getValue() !== '' ) m = SC.encrypt( m );
		requestUrl += '&m=' + encodeURIComponent( m );
		$( '#type' ).setValue();
		$( '#type' ).blur();
	};
	paper.PaperScope.get( 'sketchPad' );
	if( $( '#sketchPadContainer').getStyle( 'display' ) !== 'none' &&
	 	SC.sketchPad.project.countPoints() > 0 )
	{
		requestFlag = true;
		requestUrl += '&d=' + encodeURIComponent( SC.sketchPad.project.exportString() );
		SC.sketchPad.project.clear();
	};
	if( requestFlag )
	{
		if( SC.debug ) console.log( 'Requesting refreshed chat data from ' + requestUrl );
		var request = new Request(
		{
			url: SC.ioUrl,
			data: requestUrl,
			method: 'post'
		},
		function( response )
		{
			if( SC.debug )
			{
				console.log( 'Posted to server and received ' + response.length + ' characters in return.\n\n' + response + '\n\n' );
			};
			$( '#type' ).focus();
			SC.populate( response );
			SC.playTimeout = setTimeout( SC.play, 1000 * 3 );
		
		}).send();
	};
	return false;
};
SC.clear = function()
{
	if( $( '#type' ).getStyle( 'display' ) !== 'none' )
	{
		$( '#type' ).setValue();
		$( '#type' ).focus();
	}
	else if( $( '#sketchPad' ).getStyle( 'display' ) !== 'none' )
	{
		SC.sketchPad.project.clear();
	};
	return false;
};
SC.playTimeout = null;
SC.play = function()
{
	var requestUrl = SC.ioUrl + '?';
	if( $('#r').getValue() ) requestUrl += '&r=' + encodeURIComponent($('#r').getValue());
	if( SC.delta !== undefined ) requestUrl += '&o=' + (+SC.delta);
	requestUrl += '&u=' + encodeURIComponent($('#u').getValue());
	requestUrl += '&x=' + SC.getTimingFlag();
	if( SC.lastUpdated ) requestUrl += '&t=' + (+SC.lastUpdated);
	if( SC.debug ) console.log( 'Requesting refreshed chat data from ' + requestUrl );
	var request = new Request(
	{
		url: requestUrl,
		method: 'get'
	},
	function( response )
	{
		if( SC.debug )
		{
			console.log( 'Received ' + response.length + ' characters of refreshed chat data.\n\n' + response + '\n\n' );
		};
		SC.populate( response );
		
		
		//  Keep in mind that placing this command here
		//  might mean if the server fails to respond once
		//  the chat will never update again!

		SC.pause();
		SC.playTimeout = setTimeout( SC.play, 1000 * 3 );

	}).send();
};
SC.pause = function()
{
	clearTimeout( SC.playTimeout );	
};








    /////////////////
   //             //
  //   Content   //
 //             //
/////////////////


SC.populate = function( data )
{
	if( $( '#loadingChats' )) $( '#loadingChats' ).remove();
	$$( '.deckBossing' ).addClass( 'debossedTop' );


	//  Yup. Eval is not best practice.
	//  What would Douglas Crockford say?
	
	data = eval( data );//data = Json.decode( data );
	if( data !== undefined )
	{
		
		//  Last Updated (unit = *seconds* since Unix epoch)
		
		if( data.t !== undefined )
		{
			SC.lastUpdated = data.t;
			if( SC.debug ) console.log( 'Updated timestamp value: ' + SC.lastUpdated + '.' );
		};


		//  Delta
		
		if( data.o !== undefined )
		{
			SC.delta = data.o;
			if( SC.debug ) console.log( 'Updated delta value: ' + SC.delta + '.' );
		};


		//  Take note of this now
		//  before we change the structure of the page. 

		var distanceToBottom = document.body.scrollHeight - document.body.scrollTop - window.innerHeight;


		//  Chat Entries (main payload)
		
		if( data.entries !== undefined )
		{
			if( SC.documentHasFocus == false )
			{
				SC.missedMessages += data.entries.length;
			};
			var entriesTABLE = $( '.entries' );
			for( var i = 0; i < data.entries.length; i ++ )
			{
				var entry = data.entries[ i ];
			
				var entryTR = new HtmlElement( 'tr' );
				entryTR.addClass( 'entry' );
				
				
				// next block is even more grossly coded than the rest of this function!
				
				var continued = false;
				var lastUser  = $$( '.entry .usersColumn .userName' );
				if( lastUser.length > 0 ) lastUser = lastUser[ lastUser.length - 1 ].getText();
				var lastRGB   = $$( '.entry .usersColumn .soft' );
				if( lastRGB.length > 0 ) lastRGB = lastRGB[ lastRGB.length - 1 ].getText();
				if( lastUser === entry.u 
					&& entry.w !== undefined
					&& lastRGB === entry.w[0].toPaddedString(3) + '-' + entry.w[1].toPaddedString(3) + '-' + entry.w[2].toPaddedString(3) ) 
				{
					continued = true;
					entryTR.addClass( 'continued' );
				};
				
				
				
				
				//  Special user?
				
				var specialUser = 0;
				if( entry.s !== undefined )
				{
					specialUser = entry.s;
					if( specialUser == 1 ) entryTR.addClass( 'system debossedTop' );
					if( specialUser == 2 ) entryTR.addClass( 'special' );
				};


				//  Meta Data: User, RGB Values, Time Ago

				var metaTD = new HtmlElement( 'td' );
				entryTR.appendChild( metaTD );
				metaTD.addClass( 'usersColumn' );
				if( specialUser == 1 ) metaTD.addClass( 'debossedBottom' );

					var metaDIV = new HtmlElement( 'div' );
					metaTD.appendChild( metaDIV );
					metaDIV.addClass( 'pad' );
				
						var userSPAN = new HtmlElement( 'div' );
						metaDIV.appendChild( userSPAN );
						userSPAN.addClass( 'userName t2' );
						if( continued === true ) userSPAN.setStyle( 'visibility', 'hidden' );
						if( specialUser == 1 ) userSPAN.addClass( 'debossed' );
						userSPAN.appendText( entry.u );
						if( entry.w !== undefined )
						{
							//userSPAN.setStyle( 'color', 'rgb(' + entry.w[0] + ',' + entry.w[1] + ',' + entry.w[2] + ')' );
							if( entry.c !== undefined ) userSPAN.setStyle( 'color', 'rgb(' + entry.c[0] + ',' + entry.c[1] + ',' + entry.c[2] + ')' );
							var rgbDIV = new HtmlElement( 'div' )
								.addClass( 't1 soft tPad' )
								.appendText( entry.w[0].toPaddedString(3) + '-' + entry.w[1].toPaddedString(3) + '-' + entry.w[2].toPaddedString(3) );
							if( continued === true ) rgbDIV.setStyle( 'visibility', 'hidden' );
							metaDIV.appendChild( rgbDIV );
						};

			
				//  Message Content
			
				var contentTD = new HtmlElement( 'td' );
				entryTR.appendChild( contentTD );
				contentTD.addClass( 'entriesColumn' );
				if( specialUser == 1 ) contentTD.addClass( 'debossedBottom' );
				var contentDIV = new HtmlElement( 'div' )
					.addClass( 'rel' );
				if( specialUser == 1 ) contentDIV.addClass( 'debossed' );
				contentTD.appendChild( contentDIV );


				//  Message: TEXT

				var weNeedPadding = true;
				if( entry.m !== undefined )//  If we have a text message...
				{
					var isSoloing = false;
					var chatText = new HtmlElement( 'div' )
						.addClass( 'chatText' );
					var decryptDIV = new HtmlElement( 'div' )
						.addClass( 'decrypted' )
						.addClass( 't2' );
					if( entry.e !== undefined )//  If this message is encrypted...
					{
						var encryptDIV = new HtmlElement( 'div' )
							.addClass( 'encrypted' )
							.setHtml( entry.m
								.toFrags()
								.escapeHtml( true )
								.enableLinks()
								.educateType()
								.toString()
							);
							//.setHtml( SC.joinBlocks( SC.enableLinks( SC.textToBlocks( SC.htmlToText( entry.m )))));//@@@@

						chatText.appendChild( encryptDIV );
						if( $( '#otp' ).getValue() !== '' )//  If we have a decryption key to try out...
						{
							//messageBlocks = SC.enableStyle( SC.enableLinks( SC.textToBlocks( SC.htmlToText( SC.decrypt( entry.m )))));//@@@@
							isSoloing = SC.decrypt( entry.m )
								.toFrags()
								.escapeHtml( true )
								.enableLinks()
								.educateType()
								.isSoloing();							

							//decryptDIV.setHtml( SC.joinBlocks( messageBlocks ));//@@@@
							decryptDIV.setHtml( SC.decrypt( entry.m )
								.toFrags()
								.escapeHtml( true )
								.enableLinks()
								.educateType()
								.toString()
							);
						};
					}
					else//  Message not encrypted, just render it.
					{
						//messageBlocks = SC.enableStyle( SC.enableLinks( SC.textToBlocks( SC.htmlToText( entry.m ))));//@@@@
						isSoloing = entry.m
							.toFrags()
							.escapeHtml( true )
							.enableLinks()
							.educateType()
							.isSoloing();
						
						//decryptDIV.setHtml( SC.joinBlocks( messageBlocks ));//@@@@
						decryptDIV.setHtml( entry.m
							.toFrags()
							.escapeHtml( true )
							.enableLinks()
							.educateType()
							.toString()
						);
					};
					if( isSoloing ) weNeedPadding = false;
					if( weNeedPadding )
					{
						contentDIV.addClass( 'pad' );
					}
					else
					{
						contentDIV.addClass( 'soloing' );
					};
					chatText.appendChild( decryptDIV );
					contentDIV.appendChild( chatText );
				};


				//  Message age

				var timeDIV = new HtmlElement( 'div' )
					.addClass( 'time t1' )
					.setId( 't'  + entry.t )
					.appendText( SC.timeAgo( entry.t ));
				if( !weNeedPadding ) timeDIV.addClass( 'pad' );
				if( entry.m !== undefined ) timeDIV.addClass( 'tPad' );
				if( entry.d !== undefined ) timeDIV.addClass( 'bottomLeft' );
				contentDIV.appendChild( timeDIV );
				
				
				//  Message: DRAWING
				
				if( entry.d !== undefined )
				{
					var canvas = document.createElement( 'canvas' );// Have to do this to work around PaperJS's PaperScope constructor!
					$( canvas ).addClass( 'rel' );
					$( canvas ).setProperty( 'width',  '432' );
					$( canvas ).setProperty( 'height', '160' );
					var drawing = new paper.PaperScope();
					drawing.setup( canvas );//  ok. it's attachign to the wrong canvas!
					drawing.view = new paper.View( canvas );
					drawing.project.importString( entry.d );
					//SC.stringToPaper( drawing._id, entry.d );
					contentDIV.appendChild( canvas );
				};


				//  Flags (for future use)

				var flagsTD = new HtmlElement( 'td' )
					.addClass( 'flagsColumn' );
				entryTR.appendChild( flagsTD );
				

				entriesTABLE.appendChild( entryTR );
			};

		
			//  If more than 100 kids, remove them!
		
			var kids = $$('.entry');
			if( kids.length > 100 )
			{
				for( var i = 0; i < kids.length - 100; i ++ )
				{
					kids[i].remove();
				};
			};
			
			
			//  Stripe up that shit yo
			
			if( $( '.entry' ))
			{
				if( $( '.entry' ).hasClass( 'stripe' ))
				{
					$$( '.entry:even' ).removeClass( 'stripe' );
					$$( '.entry:odd' ).addClass( 'stripe' );
				}
				else
				{
					$$( '.entry:odd' ).removeClass( 'stripe' );
					$$( '.entry:even' ).addClass( 'stripe' );				
				};
			};
			SC.highlightReplies();
		
		
			//  Let's be consistent with out debossing
			//  @@@ However, what we don't have here is code to address
			//  if there are multiple SYSTEM messages in a row!
			//  mmmmm.... chatrBot!
				
			kids = $$('.entry');
			if( kids.length > 0 )
			{
				if( kids[ kids.length - 1 ].hasClass('system') )
				{
					$$( '.deckBossing' ).removeClass( 'debossedTop' );
				}
				else
				{
					$$( '.deckBossing' ).addClass( 'debossedTop' );
				};
			};

						
			if( SC.debug ) console.log( 'Updated chat entries.' );
		};
		
		
		//  Ok. Now find recent users

		if( data.users !== undefined )
		{
			var usersDIV = $( '#users' );
			usersDIV.removeChildren();
			if( data.users.length > 0 )
			{
				var shakersDIV = new HtmlElement( 'div' ).addClass( 'shakers' );
				shakersDIV.appendText( 'Chatters' );
				var lurkersDIV = new HtmlElement( 'div' ).addClass( 'lurkers' );
				lurkersDIV.appendText( 'Lurkers' );
				for( var i = 0; i < data.users.length; i ++ )
				{
					var c = data.users[ i ][ 1 ];// not sure why i had to do it this way instead of referencing 'user'
					var userNameDIV = new HtmlElement( 'div' )
						.addClass( 'userName' )
						.setStyle( 'color', 'rgb('+ c[0] +','+ c[1] +','+ c[2] +')' )
						.appendText( data.users[ i ][0] );
					if( data.users[ i ].length == 3 
						&& data.users[ i ][ 2 ] == 1 )
					{
						lurkersDIV.appendChild( userNameDIV );	
					}
					else
					{
						shakersDIV.appendChild( userNameDIV );	
					};
				};
				if( shakersDIV.$.childElementCount > 0 )
				{
					usersDIV.appendChild( shakersDIV );
				};
				if( lurkersDIV.$.childElementCount > 0 )
				{
					usersDIV.appendChild( lurkersDIV );	
				};
			};
			if( SC.debug ) console.log( 'Updated active users list.' );
		};
		
		
		//  Popular Rooms
		
		if( data.r !== undefined )
		{
			$( '#rooms' ).removeChildren();
			var userName = $('#u').getValue();
			for( var i = 0; i < data.r.length; i ++ )
			{
				var roomUrl = 'http://chatttr.com/';
				var roomName = '';
				if( data.r[ i ] !== '' )
				{
					roomUrl += data.r[ i ] + '/';
					//roomName = SC.htmlToText( decodeURIComponent( data.r[ i ].toLowerCase() ));//@@@@
					roomName = decodeURIComponent( data.r[ i ].toLowerCase() ).toFrags().escapeHtml().toString();
				}
				else
				{
					roomName = 'The Lounge';
				};
				if( userName !== '' ) roomUrl += '@' + userName;
				var a = new HtmlElement( 'a' )
					.addClass( 'room' )
					.setProperty( 'href', roomUrl )
					.setHtml( roomName );
				$( '#rooms' ).appendChild( a );
			};
		};
		
		
		//  Who Am I? (RGB)
		
		if( data.c !== undefined && data.c.length == 3 )
		{
			$( '#u' ).setStyle( 'color', 'rgb(' + data.c[0] + ',' + data.c[1] + ',' + data.c[2] + ')' );
		};
		
		
		//  Let's make sure we can Reply to everyone!
		
		$$( '.userName' ).addEvent( 'click', SC.createReply );
		
		
		//  Update our window's title
		
		var windowTitle = SC.name;
		var room = $( '#r' ).getValue();
		if( room !== '' ) windowTitle += ': ' + room;
		if( SC.missedMessages > 0 ) windowTitle += ' (' + SC.missedMessages + ')';
		document.title = windowTitle;
		
		
		//  "Sticky Bottom" (Gross, I know)
		//  If the user is already scrolled to near-bottom
		//  then we'll keep them down there.
		//  Otherwise, fuck it. Let them be.
		
		if(( distanceToBottom < $('#deck').getHeight() &&
			data.entries !== undefined )||
			SC.scrolledOnBoot == false )
		{
			var scroll = new Fx.Scroll( $document, { duration: 500 });
			if( distanceToBottom < 20 )
			{
				scroll = new Fx.Scroll( $document, { duration: 0 });					
			};
			scroll.toBottom();
			SC.scrolledOnBoot = true;
		};


		if( SC.debug ) console.log( 'Finished updating page contents.' );
	}
	else if( SC.debug )
	{
		console.log( 'No new data available to populate page with.' );
	};
};
SC.timeAgo = function( unix )
{
	var granularity = 1;
	var format = 'D. d M Y';//  Not using this for the moment.	
	var now = Math.round(( new Date() ) / 1000 );//  Get rid of milliseconds
	var difference = now - unix;
	if( difference < 0 )
	{
		return '0 seconds ago';
	}
	else if( difference < 31104000 )// year!
	{
		var periods = [ 

			[ 'month'  , 2592000 ],
			[ 'week'   ,  604800 ],
			[ 'day'    ,   86400 ],
			[ 'hour'   ,    3600 ],
			[ 'minute' ,      60 ],
			[ 'second' ,       1 ]
		];
		var output = '';
		for( var i = 0; i < periods.length; i ++ )
		{
			var unit  = periods[ i ][ 0 ];
			var value = periods[ i ][ 1 ];
			if( difference >= value )
			{
				var time = Math.round( difference / value );
				difference %= value;
				output += ( output ? ' ' : '' ) + time + ' ';
				output += (( time > 1 ) ? unit + 's' : unit );
				granularity --;
			};
			if( granularity == 0 ) break;
		};
		return ( output ? output : '0 seconds' ) + ' ago';
	}
	else return 'too long ago';
};
SC.updateTimesAgo = function()
{
	var agos = $$( '.entry .time' );
	for( var i = 0; i < agos.length; i ++ )
	{
		var timestamp = agos[ i ].getId().substr( 1 );
		agos[ i ].setText( SC.timeAgo( timestamp ));
	};
};




SC.createReply = function()
{
	var m = $( '#type' ).getValue();
	var c = $( '#type' ).getCaret();
	var u = '@' + this.getText();
	var part1 = m.substr( 0, c );
	var part2 = m.substr( c );
	if( part1.length > 0 && part1.substr( length - 1 ) != ' ' )
	{
		part1 = part1 + ' ';
	};
	if( part2.length == 0 ||
		(part2.length > 0 &&
		part2.substr( 0, 1 ) != ' ' ))
	{
		u += ' ';
	};
	$( '#type' ).setValue( part1 + u + part2 );
	// Be kind: return cursor to the input field.
	$( '#type' ).focus();
	// Be kinder: position the cursor itself.
	$( '#type' ).setCaret( part1.length + u.length );
	SC.tab( 'type' );
};
SC.highlightReplies = function()
{
	var user = $('#u').getValue();
	var entries = $$( '.entry .entriesColumn' ).getChildren( '.pad' );
	var pattern = new RegExp( '($|\\B)@' + user + '(?=\\W|$|\\s)', 'i' );
	for( var i = 0; i < entries.length; i ++ )
	{
		var m = entries[ i ].getChildren('div')[0];
		if( m )
		{
			m = m.getText()[0];
			if( m && m.search( pattern ) > -1 )
			{
				entries[ i ].getParent( '.entry' ).addClass( 'reply' );
				entries[ i ].getParent( '.entry' ).removeClass( 'stripe' );
			}
			else
			{
				entries[ i ].getParent( '.entry' ).removeClass( 'reply' );
			};
		};
	};		
};
SC.notifyOfReply = function()
{
	//alert('woa!!');
	//might add an audio ping for new @replies in the future.
};








    ////////////////////////
   //                    //
  //   Text Fragments   //
 //                    //
////////////////////////


//  Not the cleanest implementation -- still not as conceptually tight as it could be!
//  But it's here. It works.

/*
'some text here'.decrypt().toFrags().escapeHtml().enableLinks().educateType().toString();
'some text here--and here'.toFrags().escapeHtml().enableLinks().educateType().toString();
"<u><div>wq</div></u>--e 20 x 20 dqwedwfwqr http://stewd.io here".toFrags().escapeHtml().enableLinks().educateType().toString()
"<b>bold</b>, <code>code</code>, <em>emphasis</em>, <i>italic</i>, <strike>strike</strike>, <strong>strong</strong>, <sup>superscript</sup>, <sub>subscript</sub>, <u>underline</u>, hyperlink: http://chatttr.com"
*/

String.prototype.toFrag = function()
{
	return {
		
		content :  this.valueOf(),
		type    : 'text',
		locked  :  false
	};
};
String.prototype.toFrags = function()
{
	return new SC.Frags( this.valueOf() );
};
SC.Frags = function( frags )
{
	if( typeof frags === 'string' ) frags = frags.toFrag();
	if( typeof frags === 'object' ) frags = [ frags ];
	if( typeof frags === 'array'  ) frags = frags;
	this.frags = frags || [];
};
SC.Frags.prototype.escapeHtml = function( relaxed )
{
	var output = this.frags.slice();
	if( relaxed === true )
	{
		var safeTags = [

			'b',
			'code',
			'em',
			'i',
			'strike',
			'strong',
			'sup',
			'sub',
			'u'
		];
		for( var t = 0; t < safeTags.length; t ++ )
		{
			for( var i = 0; i < output.length; i ++ )
			{
				var frag = output[ i ];
				if( frag.locked === false )
				{
					var pattern = new RegExp( '<\s*\/?\s*' + safeTags[ t ] + '\s*>', 'gi' );
					var match = null;
					while( match = pattern.exec( frag.content ))
					{
						var current = match[ 0 ];
						var before  = frag.content.substr( 0, pattern.lastIndex - current.length );
						var after   = frag.content.substr( pattern.lastIndex );
						if( before )
						{
							var beforeFrag = {

								content: before,
								type:    frag.type,
								locked:  frag.locked
							};
							output.splice( i, 0, beforeFrag );
							i ++;
						};
						var closingTag = false;
						if( current.indexOf( '/' ) > 0 ) closingTag = true;
						var currentFrag = {

							content: current,
							type:   'html',
							tag:     safeTags[ t ],
							closing: closingTag,
							locked:  true
						};
						output[ i ] = currentFrag;
						if( after )
						{
							var afterFrag = {

								content: after,
								type:    frag.type,
								locked:  frag.locked
							};
							output.splice( i + 1, 0, afterFrag );
						};
						frag = output[ i ];// why? because we're actively editing output[ i ] in this WHILE loop!
					};
				};// if( !frag.locked )
			};
		};
		var tagCounts = {};
		for( var i = 0; i < output.length; i ++ )
		{
			var o = output[ i ];
			if( o.type == 'html' )
			{
				if( tagCounts[ o.tag ] === undefined ) tagCounts[ o.tag ] = 0;
				if( o.closing )
				{
					tagCounts[ o.tag ] = Math.max( 0, tagCounts[ o.tag ] - 1 );
				}
				else
				{
					tagCounts[ o.tag ] ++;
				};
			};
		};
		for( var prop in tagCounts )
		{
			if( tagCounts[ prop ] > 0 )
			{
				for( c = 0; c < tagCounts[ prop ]; c ++ )
				{
					output.push(
					{
						content: '</' + prop + '>',
						type:    'html',
						tag:      prop,
						locked:   true,						
					});
				};
			};
		};
	};
	for( var i = 0; i < output.length; i ++ )
	{
		if( output[ i ].locked === false )
		{
			output[ i ].content = output[ i ].content
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' )
				.replace( /\n/g, '<br />' );//@@@ WTF?!?!? Why no work?!?!?!
		};
	};
	var f = new SC.Frags();
	f.frags = output.slice();
	return f;
};
SC.Frags.prototype.enableLinks = function()
{
	var output = this.frags.slice();
	for( var i = 0; i < output.length; i ++ )
	{
		var frag     = output[ i ];
		var pattern  = /\b(https?|ftp):\/\/(\S)*\$?/gi;
		var match    = null;
		while( match = pattern.exec( frag.content ))
		{
			var current = match[ 0 ];
			var before  = frag.content.substr( 0, pattern.lastIndex - current.length );
			var after   = frag.content.substr( pattern.lastIndex );
			if( before )
			{
				var beforeFrag = {

					content: before,
					type:    frag.type,
					locked:  frag.locked
				};
				output.splice( i, 0, beforeFrag );
				i ++;
			};
			var currentFrag = {

				content: current,
				type:   'html',
				locked:  true
			};
			if( after )
			{
				var afterFrag = {

					content: after,
					type:    frag.type,
					locked:  frag.locked
				};
				output.splice( i + 1, 0, afterFrag );
			};
			//if( $( '#r' ).getValue() !== '' )//  For now we're only allowing image embeds outside the Welcome room
			if( true )
			{	
				var m = null;
				if( m = current.match( /^(https?):\/\/(www\.)?vimeo.com\/(.*)/ ))
				{
					var video = m[ 3 ];
					currentFrag.content = '<iframe src="http://player.vimeo.com/video/' + video + '" frameborder="0" allowFullScreen></iframe>';
					currentFrag.type = 'video';
				}
				else if( m = current.match( /^(https?):\/\/(www\.)?youtube.com\/(.+)?v=(.{11})/ ))
				{
					var video = m[ 4 ];
					currentFrag.content = '<iframe src="http://www.youtube.com/embed/'+ video +'" frameborder="0" allowfullscreen></iframe>';
					currentFrag.type = 'video';
				}
				else if( m = current.match( /^(https?):\/\/(www\.)?youtu.be\/(.{11})/ ))
				{
					var video = m[ 3 ];
					currentFrag.content = '<iframe src="http://www.youtube.com/embed/'+ video +'" frameborder="0" allowfullscreen></iframe>';
					currentFrag.type = 'video';
				}
				else if( m = current.match( /(https?):\/\/.+?\.(gif|png|jpg|jpeg)(\?|&)?.*?(\w|$)*/ ))
				{
					var image = m[ 1 ];
					currentFrag.content = '<a target="_blank" href="' + current + '"><img src="' + current + '" /></a>';
					currentFrag.type = 'image';
				}
				else
				{
					currentFrag.content = '<a target="_blank" href="' + current + '">' + current + '</a>';
				};
			}
			else
			{
				currentFrag.content = '<a target="_blank" href="' + current + '">' + current + '</a>';
			};
			output[ i ] = currentFrag;
			//frag = output[ i ];// why? because we're actively editing output[ i ] in this WHILE loop!
		};
	};
	var f = new SC.Frags();
	f.frags = output.slice();
	return f;
};
SC.Frags.prototype.educateType = function()
{
	var output = [];
	for( var i = 0; i < this.frags.length; i ++ )
	{
		output.push( this.frags[ i ] );
		if( output[ i ].locked === false )
		{
			output[ i ].content = output[ i ].content
				.replace( /(\w)\'(\w)/g, '$1â€™$2' )             //  â€™ Apostrophe
				.replace( /(\s)\'(\d+\w?)\b(?!\')/g, '$1â€™$2' ) //  â€™ Class of â€™99
				.replace( /(\S)\'(?=\s|'.$pnc.'|<|$)/g, '$1â€™' )//  â€™ Single closing
				.replace( /\'/g, 'â€˜' )                         //  â€˜ Single opening
				.replace( /(\S)\"(?=\s|'.$pnc.'|<|$)/g, '$1â€' )//  â€ Double closing
				.replace( /"/g, 'â€œ' )                          //  â€œ Double opening
				.replace( /\b( )?\.{3}/g, '$1â€¦' )              //  â€¦ Ellipsis
				.replace( /(\s?)--(\s?)/g, '$1â€”$2' )           //  â€” Em dash
				.replace( /\s-(?:\s|$)/g, ' â€“ ' )              //  â€“ En dash
				.replace( /(\d+)( ?)x( ?)(?=\d+)/g, '$1$2Ã—$3' )//  Ã— Dimension sign
				.replace( /\b([A-Z][A-Z0-9]{2,})\b(?:[(]([^)]*)[)])/g, '<acronym title="$2">$1</acronym>' )//  3+ majuscules acronym
				.replace( /\b([A-Z][A-Z\'\-]+[A-Z])(?=[\s.,\)>])/g, '<span class="caps">$1</span>' );//  3+ majuscules
			output[ i ].locked = true;
		};
	};
	var f = new SC.Frags();
	f.frags = output.slice();
	return f;
};
SC.Frags.prototype.isSoloing = function()
{
	if( this.frags.length == 1 && 
		( this.frags[ 0 ].type == 'video' || this.frags[ 0 ].type == 'image' ))
	{
		return true;
	}
	else return false;
};
SC.Frags.prototype.toString = function()
{
	var joined = '';
	for( var i = 0; i < this.frags.length; i ++ )
	{
		joined += this.frags[ i ].content;
	};
	return joined;
};








$(document).addEvent( 'domready', function()
{
	SC.boot();
});