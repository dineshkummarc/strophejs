/**
 * Function: Strophe.account
 * 
 * Methods for handling the creation of new accounts
 */
(function() {
    Strophe.addConnectionPlugin('account', (function() {

	var that, init, register, connection, logger;

	// A logger which uses the Firebug 'console'
	logger =  {
	    debug: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.debug('strophe.account: ' + msg);
		}
	    },
	    info: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.info('strophe.account: ' + msg);
		}
	    },
	    error: function(msg) {
		if (typeof(console) !== 'undefined') {
		    console.error('strophe.account: ' + msg);
		}
	    }
	};

	/**
	 * Function: init
	 *
	 * Constructor used by the Strophe plugin framework.
	 */
	init = function(conn) {
	    connection = conn;	    
	};

	/**
	 * Function: register
	 * 
	 * Register a new account with the server.
	 *
	 * Parameters:
	 * username - The desired username
	 * domain - The domain of the server
	 * email - The email address of the desired user
	 * callbacks - A hash containing functions which are called
	 *
	 * Group: Callbacks
	 * callbacks.success - Function to invoke when registration has been successful
	 * callbacks.error - Function to invoke when registration fails
	 * callbacks.connection - Function which is invoked whenever the connection status changes
	 * callbacks.connection_failed - Function which is invoked when the connection to the server fails
	 * callbacks.connected - Function which is invoked when the connection is successful	 
	 */
	register = function(username,
			    domain, 
			    password, 
			    email_address, 
			    callbacks) {
	    
	    var iq;
	    
	    // Tell Strophe to initiate a connection. This only appears to have the purpose
	    // of setting the domain. There must be a better way of doing this.
	    connection.connect('', domain, '', function() {
		var st;
		for (st in Strophe.Status) {
		    if (Strophe.Status[st] === status) {
			callbacks.connection(st);
		    }
		}
		if (status === Strophe.Status.CONNECTED) {
		    callbacks.connected();
		} else if (status === Strophe.Status.CONNFAIL) {
		    callbacks.connection_failed();
		} else {
		    logger.error(error);
		    logger.debug(status);
		}
	    });
	    
	    logger.info('Attempting to register with: ' + username + ', ' + password + ', ' + email_address);
	    iq = $iq({'type':'set'})
		.c('query', {'xmlns': OneSocialWeb.XMLNS.REGISTER})
		.c('username').t(username).up()
		.c('password').t(password).up()
		.c('email').t(email_address);
	    
	    connection.sendIQ(iq.tree(), function(stanza) {
		callbacks.success();
	    }, function(stanza) {
		var error, message, code;
		error = $(stanza).find("error");
		message = error.children()[0].tagName;
		code = error.attr('code');
		if (typeof(callbacks.error) !== 'undefined') {
		    callbacks.error(code, message);
		}
	    }); 
	};
	that = {};
	that.init = init;
	that.register = register;
	return that;
    }()))
}());
