/*
 * FHCounterClass by Forest Hoffman, 2016
 *
 * Version: 1.1.0
 *
 * FHCounterClass is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *  
 * FHCounterClass is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *  
 * You should have received a copy of the GNU General Public License
 * along with FHCounterClass. If not, see http://www.gnu.org/licenses/gpl-2.0.txt.
 *
 *** *** *** *** *** *** *** *** *** *** *** ***
 *
 * Renders arcs using the 2D canvas renderer in most browsers.
 * 
 * To use, create a block of html using the following format:
 *
 * 		<div id='canvas_wrapper' class='wrapper'>
 *			<canvas id='my_canvas' width='200' height='200'></canvas>
 *			<div id='canvas_content'><span id='year'>2</span> <span id='year_suffix'>yr</span></div>
 *		</div>
 *
 * Then initizalize the class, configure the counter (optional), and draw the counter with some JS.
 *
 *		var FHCounter = new FHCounterClass( 'my_canvas' );
 *		// put any customizations in this object argument or run with the default settings
 *		FHCounter.set_arc_properties({
 *			'stroke_color': 'green'
 * 		});
 * 		FHCounter.draw_arc();
 *		
 * Customizable Arc properties include:
 *		stroke_width,
 *		stroke_color,
 * 		bg_stroke, 		
 * 		bg_stroke_color,
 *		start_year,
 *		year,
 *		year_text,
 *		year_suffix,
 *		x,
 *		y,
 *		radius,
 *		initial_angle,
 *		final_angle,
 *		anti_clockwise,
 *		anim_speed
 *
 */

function FHCounterClass ( elem_id ) {
	this._CANVAS = document.getElementById( elem_id );
	if ( null !== this._CANVAS ) {
		this.CTX = this._CANVAS.getContext( '2d' );
		
		this.FRAMES = 0;
		this.ARC = {};
		this._START_YEAR = new Date( 2012, 8, 2 );
		this._MS_IN_YEAR = 31536000000;
		this.MAX_YEARS = this._get_max_years( this._START_YEAR );
	} else {
		throw new Error( 'FHCounterClass: The canvas was null.' );
	}
}

FHCounterClass.prototype.clear_canvas = function () {
	var width = this._CANVAS.width;
	var height = this._CANVAS.height;
	this.CTX.clearRect( 0, 0, width, height );
};

FHCounterClass.prototype._set_start_year = function ( start_year ) {
	if ( 'undefined' !== typeof( start_year ) ) {
		this._START_YEAR = start_year;
		this.MAX_YEARS = this._get_max_years( this._START_YEAR );
	}
};

FHCounterClass.prototype._get_max_years = function ( start_date ) {
	if ( 'undefined' === typeof( start_date ) ) {
		start_date = this._START_DATE_DEFAULT;
	}
	var max_years = this._get_year_diff( start_date );
	
	return max_years;
};

FHCounterClass.prototype._get_year_diff = function ( date ) {
	var current_date = new Date();
	if ( 'undefined' === typeof( date ) ) {
		date = this._START_YEAR;
	}
	var ms_diff = current_date - date;
	var year_diff = ms_diff / this._MS_IN_YEAR;
	
	return year_diff;
};

FHCounterClass.prototype._get_year_text = function ( date ) {
	var output = '';
	var precision = 1;
	var year_diff = this._get_year_diff( date );
	
	var ceil = Math.ceil( year_diff );
	if ( year_diff > 100 ) {
		precision = 3;
	} else if ( year_diff > 10 ) {
		precision = 2;
	} else {
		precision = 1;
	}
	var rounded = year_diff.toPrecision( precision );
	var decimal_diff = Math.abs( year_diff - ceil );
	
	if ( year_diff < 1 ) {
		output = '< 1';
	} else if ( 0 === decimal_diff ) {
		output = rounded;
	} else if ( decimal_diff > 0 ) {
		output = '~ ' + rounded;
	}
	
	return output;
};

FHCounterClass.prototype._get_year_radians = function ( date ) {
	var year_diff = this._get_year_diff( date );
	var year_ratio = year_diff / this.MAX_YEARS;
	var radians = year_ratio * ( 2 * Math.PI );
	
	return radians;
};

FHCounterClass.prototype.set_arc_properties = function ( custom_properties ) {
	var property_defaults = {
		'stroke_width': 	10,
		'stroke_color': 	'#fde244',
		'bg_stroke': 		true,
		'bg_stroke_color': 	'#222222',
		'start_year':		this._START_YEAR,
		'year': 			this._START_YEAR,
		'year_text': 		undefined,
		'year_suffix': 		'yr',
		'x': 				this._CANVAS.width / 2,
		'y': 				this._CANVAS.height / 2,
		'radius': 			this._CANVAS.width / 2 - 10,
		'initial_angle': 	0,
		'final_angle': 		undefined,
		'anti_clockwise': 	true,
		'anim_speed': 		30
	};
	var property_defaults_keys = Object.keys( property_defaults );
	var property_name = '', property_value = 0;

	if ( 0 === Object.keys( this.ARC ).length ) {		
		for ( var i = 0; i < property_defaults_keys.length; i++ ) {
			property_name = property_defaults_keys[ i ];

			if ( 'undefined' !== typeof( custom_properties ) &&
					'undefined' !== typeof( custom_properties[ property_name ] ) ) {
				property_value = custom_properties[ property_name ];
			} else {
				property_value = property_defaults[ property_name ];
			}
			
			// some custom property handling
			switch ( property_name ) {
				case 'start_year':
					this._set_start_year( property_value );
					break;
				case 'year_text':
					if ( 'undefined' === typeof property_value ) {
						property_value = this._get_year_text( this.ARC.year );
					}
					break;
				case 'final_angle':
					if ( 'undefined' === typeof property_value ) {
						property_value = this._get_year_radians( this.ARC.year );
					}
					break;
			}
									
			this.ARC[ property_name ] = property_value;
		}
	} else if ( 'undefined' !== typeof( custom_properties ) ) {
		var custom_property_keys = Object.keys( custom_properties );
		
		for ( var x = 0; x < custom_properties.length; x++ ) {
			property_name = custom_property_keys[ x ];
			property_value = custom_properties[ property_name ];
						
			if ( 'undefined' !== typeof( property_value ) ) {
				
				// some custom property handling
				switch ( property_name ) {
					case 'start_year':
						this._set_start_year( property_value );
						break;
					case 'year_text':
						property_value = this._get_year_text( this.ARC.year );
						break;
					case 'final_angle':
						property_value = this._get_year_radians( this.ARC.year );
						break;
					case 'bg_stroke':
						if ( 'boolean' !== typeof property_value ) {
							property_value = true;
						}
						break;
				}
				
				this.ARC[ property_name ] = property_value;
			}
		}
	}
};

FHCounterClass.prototype.draw_arc = function () {
	var initial, final, current, rot, per_frame_rad;
	
	// only run the following when the function is first called
	if ( 0 === this.FRAMES ) {
		
		// if the arc object isn't defined apply the default settings
		if ( 0 === Object.keys( this.ARC ).length ) {
			this.set_arc_properties();
		}
		
		var canvas_content = jQuery( this._CANVAS ).siblings( '#canvas_content' )[0];
		jQuery( canvas_content ).children( '#year' ).text( this.ARC.year_text );
		jQuery( canvas_content ).children( '#year_suffix' ).text( this.ARC.year_suffix );

		jQuery( canvas_content ).css({
			'left': ( this._CANVAS.width / 2 ) - ( canvas_content.clientWidth / 2 ),
			'top': ( this._CANVAS.height / 2 ) - ( canvas_content.clientHeight / 2 )
		});
	}
		
	// prepare the canvas for the next frame
	this.clear_canvas();
	
	// the number of radians to move per frame
	per_frame_rad = ( this.FRAMES / this.ARC.anim_speed ) * ( Math.PI );
	initial = this.ARC.initial_angle;
	final = this.ARC.final_angle;
	current = per_frame_rad + initial;
	
	rot = ( this.ARC.anti_clockwise ? -1 : 1 );
	
	// only handles background arc if the option is turned on
	if ( this.ARC.bg_stroke ) {

		// background arc styles
		this.CTX.lineWidth = this.ARC.stroke_width;
		this.CTX.strokeStyle = this.ARC.bg_stroke_color;
		
		// draws background arc path
		this.CTX.beginPath();
		this.CTX.arc(
			this.ARC.x,
			this.ARC.y,
			this.ARC.radius,
			0,
			2 * Math.PI,
			this.ARC.anti_clockwise
		);
		this.CTX.stroke();
	}

	// arc styles
	this.CTX.lineWidth = this.ARC.stroke_width;
	this.CTX.strokeStyle = this.ARC.stroke_color;
	
	// draws arc path
	this.CTX.beginPath();
	this.CTX.arc(
		this.ARC.x,
		this.ARC.y,
		this.ARC.radius,
		( rot * initial ),
		( rot * current ),
		this.ARC.anti_clockwise
	);
	this.CTX.stroke();

	if ( current < final ) {
		this.FRAMES++;
		window.requestAnimationFrame( this.draw_arc.bind( this ) );
	}
};