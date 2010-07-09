/**
 * Strophe.js plugin for XEP-0054 and XEP-0153.
 * 
 * Depends: 
 * - JQuery
 * - strophe.roster.js
*/
(function() {
    Strophe.addConnectionPlugin('vcard-temp', (function() {
	var that, init, connection, roster, callbacks, logger, fetch, save, status_changed, on_presence;

	// A logger which uses the Firebug 'console'
	logger =  {
	    debug: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.debug('strophe.vcard-temp: ');
		    console.debug(msg);
		}
	    },
	    info: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.info('strophe.vcard-temp: ' + msg);
		}
	    },
	    error: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.error('strophe.vcard-temp: ' + msg);
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
	    roster = connection.roster;
	    Strophe.addNamespace('VCARD_TEMP',"vcard-temp");
	    Strophe.addNamespace('VCARD_TEMP_UPDATE',"vcard-temp:x:update");
	};

	status_changed = function(status) {
	    if (status === Strophe.Status.CONNECTED) {
		// Bind to event handlers
		logger.info("Binding on_presence handler")
		connection.addHandler(on_presence, null, 'presence', null, null, null);
	    } 
	};

	/**
	 * PrivateFunction: on_presence
	 *
	 * Strophe callback invoked on a 'presence' message
	 */
	on_presence = function(presence) {
	    var jid, from, contact;
	    jid = presence.getAttribute('from');
	    from = Strophe.getBareJidFromJid(jid);
	    type = presence.getAttribute('type');
	    if ($(presence).find('x').first().attr('xmlns') === Strophe.NS.VCARD_TEMP_UPDATE) {

		logger.info("VCard update for " + jid);
		contact = roster.get_contact(from);
		logger.info("Contact = " + contact);
		roster.dump_contacts();
		if (contact) {
		    if (typeof(contact.avatar) === 'undefined' ||
			typeof(contact.avatar.md5) === 'undefined' ||
			contact.avatar.md5 !== $(presence).find('x photo').first().text()) {
			fetch(from);
		    }
		}
	    }
	    return true;
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
	that.statusChanged = status_changed;
	return that;
    }()))
}());
