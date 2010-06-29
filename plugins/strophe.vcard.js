/*

*/
(function() {
    Strophe.addConnectionPlugin('vcard', (function() {
	var that, init, connection, callbacks, logger, on_presence, on_message, on_iq, fetch;

	// A logger which uses the Firebug 'console'
	logger =  {
	    debug: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.debug('strophe.vcard: ');
		    console.debug(msg);
		}
	    },
	    info: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.info('strophe.vcard: ' + msg);
		}
	    },
	    error: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.error('strophe.vcard: ' + msg);
		}
	    }
	};

	/**
	 * Group: Functions
	 */

	/**
	 * PrivateFunction: on_iq
	 *
	 * Strophe callback invoked on a 'stanza' message
	 */
	on_iq = function(stanza) {
	    /*var jid, contact, nick;
	    jid = presence.getAttribute('from');

	    contact = connection.roster.get_contact(jid);
	    if (contact) {		
		nick = presence.getElementsByName('nick');
		if (nick.length === 1) {
		    contact.vcard = Strophe.getText(nick[1]);
		    logger.info(contact.vcard);
		}
		return true;
	    } 
	    return false;*/
	};
	
	/**
	 * Function: init
	 *
	 * Constructor for Strophe plugin
	 */
	init = function(conn) {
	    connection = conn;
	    Strophe.addNamespace('VCARD_TEMP',"vcard-temp");
	    Strophe.addNamespace('VCARD_TEMP_UPDATE',"vcard-temp:x:update");
	    connection.addHandler(on_iq, null, 'iq', null, null, null);
	};

	fetch = function(jid) {
	    connection.sendIQ($iq({
		'type': 'get',
		'to': jid,
		'xmlns': Strophe.NS.CLIENT
	    }).c('vCard', {
		'xmlns': Strophe.NS.VCARD_TEMP
	    }), function(stanza) {
		var photo;
		photo = $(stanza).find('PHOTO BINVAL');
		if (photo.length > 0) {
		    contact = connection.roster.get_contact(jid);
		    if (typeof(contact.avatar) === 'undefined') {
			contact.avatar = {}; 
		    }
		    contact.avatar.data = $(photo[0]).text();
		    logger.info("Invoking roster.callbacks.contact_changed");
		    connection.roster.callbacks.contact_changed(contact);
		}
	    });
	};

	that = {};
	that.init = init;
	that.fetch = fetch;
	return that;
    }()))
}());
