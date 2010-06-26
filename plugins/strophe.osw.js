// FIXME? I might not belong in this file.
window.osw = {
	'NS' : {
		'httpbind' : 'http://jabber.org/protocol/httpbind',
		'client' : 'jabber:client',

		'pubsub' : 'http://jabber.org/protocol/pubsub',
		'pubsubevt' : 'http://jabber.org/protocol/pubsub#event',
		'atom' : 'http://www.w3.org/2005/Atom',

		'osw' : 'http://onesocialweb.org/spec/1.0/',
		'activity' : 'http://activitystrea.ms/spec/1.0/',

		'microblog' : 'urn:xmpp:microblog:0'
	}

};

/*

Class: osw.acl

	ACL creation and parsing.

*/
osw.acl = {

    /*
	Function: rule
      
		Create an ACL rule and return the DOM element.

	Parameters:
		perm - A permission type from osw.acl.permission
		action - An action from osw.acl.action
		subjectType - A subjectType from osw.acl.subjectType
		subject - A string description of the subject. Useful for group/user type.

	Returns: 
		A DOM element that can be used anywhere an ACL is needed.
    */

	'rule' : function(perm, action, subjectType, subject) {
		return $build('acl-rule', {xmlns: osw.NS.osw})
			.c('acl-action', {permission: perm})
				.t( action ).up()
			.c('acl-subject', {type: subjectType}).t( subject ? subject : '' ).up()
			.tree();
	},

    /*
	Function: parse
      
		Parse an osw ACL rule and return a JSON representation of it.

	Parameters:
		node - The DOM node that contains the rule.

	Returns: 
		A JSON representation of the rule.
    */

	'parse' : function(node) {
		var rule;

		$(node).xmlns( osw.NS, function() {
			rule = {
				'action': this.find("osw|acl-action").text() || null, 
				'permission': this.find("osw|acl-action").attr("permission"),
				'subjectType': this.find("osw|acl-subject").attr("type"),
				'subject': this.find("osw|acl-subject").text() || null,
			}
		}); 

		return rule;
	},

    /*
	Constants: permission
      
		Constants for grant/deny operations.

		permission.grant - Grant
		permission.deny - Deny

	*/
	'permission' : {
		'grant' : 'http://onesocialweb.org/spec/1.0/acl/permission/grant',
		'deny' : 'http://onesocialweb.org/spec/1.0/acl/permission/deny'
	},

    /*
	Constants: action
      
		Constants for actions, essentially CRUD

		action.view - View
		action.update - Update

	*/
	'action' : {
		'view' : 'http://onesocialweb.org/spec/1.0/acl/action/view',
		'update' : 'http://onesocialweb.org/spec/1.0/acl/action/update'
	},

    /*
	Constants: subjectType
      
		Constants for subject types

		subjectType.everyone - Everyone. Rule does not require a subject.
		subjectType.user - User. Rule subject is a jid.
		subjectType.group - Group. Rule subject is a roster group.

	*/
	'subjectType' : {
		'everyone' : 'http://onesocialweb.org/spec/1.0/acl/subject/everyone',
		'user' : 'http://onesocialweb.org/spec/1.0/acl/subject/user',
		'group' : 'http://onesocialweb.org/spec/1.0/acl/subject/group'
	
	},
}

/*
	Class: osw.activity

		A class for parsing and eventually creating OSW activities.

*/

osw.activity = {

	/*
	Function: parse

		Parse an activity from an ATOM entry node. It is such because pubsub has
		multiple namespaces that contain activities--I've encountered /pubsub
		and /pubsub#events.

	Parameters:

		entry - The ATOM entry node to parse the event from


	Returns:

		A JSON replresentation of the activity. See osw.acl for more info.

		: { id, title, published, verb, name, jid, acl: [rule], object: [{id, published, objectType, ...}] }


	*/

	'parse' : function(entry) {
		var activity;

		$(entry).xmlns( osw.NS, function() {
			
				activity = {
					'id' : this.find("atom|id").text(),
					'title' : this.find("atom|title").text(),
					'published' : this.find("atom|published").text(),

					'verb' : this.find("activity|verb").text(),
					'name' : this.find("activity|actor > atom|name").text(),
					'jid' : this.find("activity|actor > atom|uri").text(),

					'acl' : this.find("osw|acl-rule").map(function() { 
						return osw.acl.parse(this);
					}),

					'objects' : this.find("activity|object").map(function() { 
						var obj = {
							'id': $(this).find("id").text(),
							'published': $(this).find("atom|published").text(),
							'objectType': $(this).find("activity|object-type").text()
						}; 

						// TODO make modular
						switch(obj.objectType) {
							case 'http://onesocialweb.org/spec/1.0/object/status':
								obj.status = $(this).find("atom|content").text();
								break;

							case 'http://onesocialweb.org/spec/1.0/object/picture':
								obj.picture = $(this).find("html|link[rel='alternate']").attr("href");
								break;
						}

						return obj;
					}),
				};
		});

		return activity;

	}
}


/*
	Class: osw.util

		A collection of utilities.

*/
osw.util = {
	/*
	Function: uniqueRandom

		Returns a random number that is checked using user-supplied checkFn.

	Parameters:
		checkFn - a function that returns true if the number is used, false if it is unique.
		max - The maximum value. Default is INT32_MAX.
		min - The minimum value. Default is 0.

	*/
	'uniqueRandom': function(checkFn, max, min) {
		var n;

		max = max || 0x7fffffff;
		min = min || 0;

		do {
			n = Math.floor( Math.random() * max ) + min;
		} while( checkFn(n) );
	},
}




/*
Class: osw.util.logger

	Returns a random number that is checked using user-supplied checkFn.

*/

osw.util.logger = {

	/*
	Function: debug

	Parmateters:
		msg - The message.

	*/
	debug: function(msg) {
		if (typeof(console) !== 'undefined') {
		console.debug(msg);
		}
	},

	/*
	Function: info

	Parmateters:
		msg - The message.

	*/
	info: function(msg) {
		if (typeof(console) !== 'undefined') {
		console.info(msg);
		}
	},

	/*
	Function: error

	Parmateters:
		msg - The message.

	*/
	error: function(msg) {
		if (typeof(console) !== 'undefined') {
		console.error(msg);
		}
	}
}

/*
Class: osw.util.delegate

	A function that can be used for callbacks to privide an easy way of 
	assigning and managing handles.

*/

osw.util.delegate = function() {}

osw.util.delegate.prototype = {
	_fn : {},

	/*
	Function: add

		Add a function to the list of functions that will be invoked upon a
		call to .trigger(). It will be called with the parameters given to trigger
		and in the context supplied.

	Parameters:

		fn - The function that will be invoked.
		context - The context that fn will be called in.

	Returns:

		Returns the handle that can be used in .remove().
	*/

	'add' : function(fn, context) {
		var handle;

		handle = osw.util.uniqueRandom( this._fn.hasOwnProperty );

		if( context ) {
			var wrapped = fn;
			fn = function() {
				wrapped.apply( context, arguments );
			}
		}

		this._fn[ handle ] = fn;

	},

	/*
	Function: remove

		Remove a function from the delegate.

	Parameters:

		handle - The handle that was returned by the .add() call.
	*/

	'remove' : function(handle) {
		delete this._fn[ handle ];
	},

	/*
	Function: trigger

		Invoke all functions using the supplied arguments.

	Parameters:

		... - Arguments
	*/

	'trigger' : function() {
		for( var handle in this._fn ) {
			this._fn[ handle ].apply( document, arguments );
		}
	}

}

/*
Class: strophe.plugin.osw

	A StropheJS plugin for OSW functionality.

*/


Strophe.addConnectionPlugin('osw', {

	/*
	Property: callbacks

	Callbacks that can be hooked by anyone who wishes to listen. Each
	callback is a osw.util.delegate; see that for usage.

	Example:

		Add a function to the delegate:

		: osw.callbacks.received_activity.add( myCallback, this );

		Trigger the delegate to call all functions:

		: osw.callbacks.received_activity.trigger( arg1, arg2, ... );

	*/

	'callbacks' : {

		/*
		Event: received_activity

			This event is triggered whenever a new activity comes from a
			message, the inbox, or the response to activities for a specific 
			user.

		Parameters:
			activity - The activity.

		*/

		'received_activity' : new osw.util.delegate(),
	},

	/*
	Function: init

		The initialization function that is called by strophe itself.

	Scope: private

	*/

	init: function(conn) {
		this._connection = conn;

		$.each( osw.NS, function(k,v) {
			Strophe.addNamespace( k, v );
			//$.xmlns
		});

		conn.addHandler( $.proxy(this._receivedMessage_Activity, this), null, "message", "headline", null, null, null);
	},


	_receivedMessage_Activity: function(msg) {
		try {
			var self = this;

			$(msg).xmlns( osw.NS, function() {
				var entries = this.find("pubsubevt|event > pubsubevt|items > pubsubevt|item > atom|entry");
				if( entries.length > 0 ) {
					entries.each(function(i, entry) {
						var activity = osw.activity.parse( entry );

						self.callbacks.received_activity.trigger( activity );
					});
				}
			});
		// ensure callback doesn't disappear upon error.
		} finally {
			return true;
		}
	},

	/*
	Function: activities

		Get activities of a specific user. Results come via the received_activity.

		This should probably have the ability to give a callback at some point.


	Parameters:

		who - The JID of a user to get status for.
	*/


	activities: function(who){
		// FIXME should !who get inbox() instead?

		this._connection.pubsub.items( this._connection.jid, 
			who, 
			osw.NS.microblog, 
			$.proxy(this._receivedActivities, this), 
			$.proxy(this._receivedActivitiesError, this)
		);
	},

	_receivedActivities: function(iq) {
		var self = this;

		$(iq).xmlns( osw.NS, function() {
			this.find("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry").each(function(i, entry) {
				var activity = osw.activity.parse( entry );

				self.callbacks.received_activity.trigger( activity );
			});
		});
	},

	_receivedActivitiesError: function(iq) {
		
	},

	/*
	Function: publishActivity

		Publish an activity. This is a very simple version that only pushes
		status at the moment. It should be expanded to use a builder style
		that supports the various object types in the future.

	Parameters:

		status - A string status update.
	*/


	publishActivity: function(status) {
		var pubId = this._connection.getUniqueId("publishnode");

		var pubsubEl = $build('pubsub', {xmlns: osw.NS.pubsub})
			.c('publish', {node: osw.NS.microblog})
				.c('item')
					.c('entry', {xmlns: osw.NS.atom, 'xmlns:activity' : osw.NS.activity})
						.c('title').t( status ).up()
						.c('activity:verb').t( 'http://activitystrea.ms/schema/1.0/post' ).up()
						.c('object', {xmlns: osw.NS.activity})
							.c('object-type').t('http://onesocialweb.org/spec/1.0/object/status').up()
							.c('content', {xmlns: osw.NS.atom,type: 'text/plain'}).t( status ).up().up()
						/*.cnode(osw.acl.rule(
							osw.acl.permission.grant,
							osw.acl.action.view,
							osw.acl.subjectType.group,
							'friends'
						))*/
						.cnode(osw.acl.rule(
							osw.acl.permission.grant,
							osw.acl.action.view,
							osw.acl.subjectType.everyone
						))
			.tree();

		var iqEl = $iq({
				type:'set', 
				id: pubId
			}).cnode( pubsubEl )
			.tree();

		//console.dirxml( iqEl );


		this._connection.sendIQ( iqEl, function(iq) {

			//console.dirxml( iq );
		},
		function(iq) {
			alert("post error");

			//console.dirxml( iq );
		});

	},

    /**
     * Function: inbox
     * 
     * List the inbox of activities for the current user.
     **/
    inbox : function() {
		var sub = $iq({
			'from' : this._connection.jid, 
			'type' : 'get'
		}).c('pubsub', {
			'xmlns': osw.NS.pubsub 
		}).c('items', {
			'node' : 'http://onesocialweb.org/spec/1.0/inbox'
		});
		this._connection.sendIQ(sub.tree(), $.proxy(this._receivedInbox, this), function(st) {
			osw.util.logger.error('Unable to send IQ to receive activities');
			osw.util.logger.debug(st);
		});
    },

	_receivedInbox: function(iq) {
		var self = this;

		$(iq).xmlns( osw.NS, function() {
			this.find("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry").each(function(i, entry) {
				var activity = osw.activity.parse( entry );

				self.callbacks.received_activity.trigger( activity );
			});
		});
	},

	_receivedInboxError: function(iq) {
		
	},

	/**
	 * Get a list of all users subscribed to the PEP microblog.
	 * 
	 */
	subscriptions : function() {
		this._connection.sendIQ($iq({
			'from': this._connection.jid, 
			'type': 'get'
		}).c('pubsub', { 
			'xmlns': osw.NS.pubsub
		}).c('subscriptions', { 
			'xmlns': osw.NS.pubsub,
			'node': osw.NS.microblog
		}).tree(), callbacks.subscription);
    },


	// This is a function that Strophe calls. It is just here as a stub.
	statusChanged: function (status, condition) {

	},

    /**
     * Function: follow
     *
     * Subscribes the current user to the activity stream of the specified user.
     *
     * Parameters:
     *
     * jid - The Jabber identifier of the user to 'follow'
     * callback - A function which is called when the 'follow' request is successful
     **/
    follow : function(jid, callback) {
		osw.util.logger.info('Requesting to follow: ' + jid)

		this._connection.pubsub.subscribe( jid, jid, null, OneSocialWeb.XMLNS.MICROBLOG, null, function(stanza) {
			if($(stanza).attr('type') == 'result') {
				osw.util.logger.info("Subscribe request complete");
				osw.util.logger.debug(stanza);
				callback();
			} else {
				osw.util.logger.info("Subscribe request unsuccssful");
				osw.util.logger.debug(stanza);
			}
		});
    },

    /**
     * Function: unfollow
     *
     * Unsubscribes the current user to the activity stream of the specified user.
     *
     * Parameters:
     *
     * jid - The Jabber identifier of the user to 'follow'
     * callback - A function which is called when the 'unfollow' request is successful
     **/
    unfollow : function(jid, callback) {
		osw.util.logger.info('Requesting to unfollow: ' + jid);

		this._connection.pubsub.unsubscribe( jid, jid, OneSocialWeb.XMLNS.MICROBLOG, function(stanza) {
			if($(stanza).attr('type') == 'result') {
				osw.util.logger.info("Unsubscribe request complete");
				osw.util.logger.debug(stanza);
				callback();
			} else {
				osw.util.logger.info("Unsubscribe request unsuccssful");
				osw.util.logger.debug(stanza);
			}
		});
    },

    /**
     * Function: add_contact
     *
     * Adds a new contact to the rooster
     *
     * Parameters:
     * 
     * jid - The Jabber identifier of the user to add
     **/
    add_contact : function(jid) {
		osw.util.logger.info('Adding contact ' + jid);
		this._connection.roster.update(jid, jid, ['MyBuddies']);
		this._connection.roster.subscribe(jid);      
    },

    /**
     * Function: confirm_contact
     *
     * Confirm the addition of a contact 
     *
     * Parameters:
     *
     * jid - The Jabber identifier of the user requesting to be a contact
     **/
    confirm_contact : function(jid) {
		this._connection.roster.update(jid, jid, ['MyBuddies']);
		this._connection.roster.authorize(jid);    
    },

    /**
     * Function: vcard
     *
     * Request a VCARD of a specified user.
     *
     * Parameters:
     * 
     * jid - The Jabber Identifier of the user you wish to request the VCARD
     **/
    vcard : function(jid) {
		this._connection.sendIQ($iq({
			'type': 'get',
			'to': jid,
			'xmlns': OneSocialWeb.XMLNS.CLIENT
		}).c('vCard', {
			'xmlns': OneSocialWeb.XMLNS.VCARDTEMP
		}), function(stanza) {
				var photo;
				photo = $(stanza).find('PHOTO BINVAL');
				if (photo.length > 0) {
				photo = $(photo[0]).text();
				options.callback.avatar(jid, photo);
			}
		});
    },

    /**
     * Function: update_contact
     *
     * Updates a contact in the rooster
     *
     * Parameters: 
     * 
     * jid - The Jabber identifier of the user you wish to update
     * name - Name of the contact
     * groups - A list of group names
     **/
    update_contact : function(jid, name, groups) {
		this._connection.roster.update(jid, name, groups);
    },

    edit_profile : function(nickname) {
		this._connection.sendIQ($iq({
			'type': 'set',
			'from': this._connection.jid,
		}).c('pubsub', {
			'xmlns': OneSocialWeb.SCHEMA.PUBSUB
		}).c('publish', {
			'node' : OneSocialWeb.SCHEMA.NICKNAME
		}).c('item', {
			'id': 0
		}).c('nick', {
			'xmlns' : OneSocialWeb.SCHEMA.NICKNAME
		}).t(nickname));
    },
});

