/**
 * Strophe.js plugin for XEP-0054 and XEP-0153.
 * 
 * Depends: 
 * - JQuery
 * - strophe.roster.js
*/
(function() {
    Strophe.addConnectionPlugin('vcard-temp', (function() {
	var that, init, connection, roster, callbacks, logger, fetch, save;

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
	 * Function: init
	 *
	 * Constructor for Strophe plugin
	 *
	 * Parameters:
	 * connection - A Strophe connection object
	 * rster - A roster which defines the 'get_contact(jid)' method
	 */
	init = function(conn, rster) {
	    connection = conn;
	    roster = rster;
	    Strophe.addNamespace('VCARD_TEMP',"vcard-temp");
	    Strophe.addNamespace('VCARD_TEMP_UPDATE',"vcard-temp:x:update");
	};

	/**
	 * Function: fetch
	 *
	 * Fetches the VCard for a specified contact.
	 *
	 * Parameters:
	 * jid - The Jabber identifier for the user
	 * callback - A function to be invoked with a contact object
	 **/
	fetch = function(jid, callback) {
	    logger.info("Fetching vcard for " + jid);
	    connection.sendIQ($iq({
		'type': 'get',
		'to': jid,
		'xmlns': Strophe.NS.CLIENT
	    }).c('vCard', {
		'xmlns': Strophe.NS.VCARD_TEMP
	    }), function(stanza) {
		var photo, contact;		
		
		contact = roster.get_contact(jid);
		if (contact) {
		    stanza = $(stanza);
		    contact.name = stanza.find('FN').first().text();
		    contact.nickname = stanza.find('NICKNAME').first().text();
		    contact.n = {};
		    contact.n.given = stanza.find('N GIVEN').first().text();
		    contact.n.family = stanza.find('N FAMILY').first().text();
		    contact.email = stanza.find('EMAIL USERID').first().text();
		    contact.address = [];
		    $.each(stanza.find('ADR'), function(index, adr) {
			var address = {};
			address.extension = $(adr).find('EXTADD').first().text();
			address.street = $(adr).find('STREET').first().text();
			address.locality = $(adr).find('LOCALITY').first().text();
			address.region = $(adr).find('REGION').first().text();
			contact.address.push(address);
		    });
		    contact.telephone = [];
		    $.each(stanza.find('TEL'), function(index, element) {
			var telephone = {};
			element = $(element);
			if (element.find('HOME').length > 0) {
			    telephone.type = 'home';
			} else if (element.find('WORK').length > 0) {
			    telephone.type = 'work';
			}

			telephone.number = $(adr).find('NUMBER').first().text();
			contact.telephone.push(telephone);
		    });
		    if (stanza.find('PHOTO').length > 0) {
			if (typeof(contact.avatar) === 'undefined') {
			    contact.avatar = {}; 
			}
			contact.avatar.type = stanza.find('PHOTO TYPE').first().text();
			contact.avatar.data = stanza.find('PHOTO BINVAL').first().text();
			logger.info("Invoking roster.callbacks.contact_changed");
			
		    }
		    connection.roster.callbacks.contact_changed(contact);
		}
		if (typeof(callback) === 'function') { callback(contact); }
		
	    });
	};

	/** 
	 * Function: save
	 *
	 * Save a VCard contact. 
	 *
	 * Parameters:
	 * vcard (function) - A function which provides a VCard. This function is passed a <Strophe.Builder> object
	 */
	save = function(vcard) {
	    var iq = $iq({
		'type': 'set',
		'to': connecton.jid,
		'xmlns': Strophe.NS.CLIENT
	    }).c('cCard', {
		'xmlns': Strophe.NS.VCARD_TEMP
	    });
	    vcard(iq);
	    connection.sendIQ(iq);	      
	};

	that = {};
	that.init = init;
	that.fetch = fetch;
	that.save = save;
	return that;
    }()))
}());
