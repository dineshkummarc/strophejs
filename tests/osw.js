/**
 * Modeled after roster.js
 */

var oswPlugin = Strophe._connectionPlugins["osw"];
module("plugins.Osw", {
           setup: function() {

           },
           teardown: function() {

           }
});

// shortcut access



jackTest("osw.inbox() should send IQ",
         function (mockConnection) {
             jack.expect("mockConnection.sendIQ")
                 .once();
             oswPlugin.init(mockConnection);
             oswPlugin.inbox();
         });

jackTest("osw.inbox() should callback with empty array",
         function (mockConnection) {
             var called = 0;
             jack.expect("mockConnection.sendIQ")
                 .once().mock(
                     function(iq, callbacksuccess, callbackerror) {
                         callbacksuccess(toDom('<iq type="result"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="http://onesocialweb.org/spec/1.0/inbox"/></pubsub></iq>'));
                     }
                 );
             oswPlugin.init(mockConnection);
             oswPlugin.callbacks.received_activity.add( function(activity) {
				called++;
             });
			oswPlugin.inbox();

            equals(called, 0, "osw.received_activity callback should not be called.");
         });



jackTest("osw.inbox() should callback with a single status item",
         function (mockConnection) {
             var called = 0;
             jack.expect("mockConnection.sendIQ")
                 .once().mock(
                     function(iq, callbacksuccess, callbackerror) {
                         callbacksuccess(toDom('<iq type="result" from="somewhere.com"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="http://onesocialweb.org/spec/1.0/inbox">'
							+ '<item id="test"><entry xmlns="http://www.w3.org/2005/Atom">'
							+ '<title>Hello, world!</title>'
							+ '<activity:actor xmlns:activity="http://activitystrea.ms/spec/1.0/">'
							+ 	'<name>Somebody Out There</name>'
							+ 	'<uri>somebody@somewhere.com/outthere</uri>'
							+ '</activity:actor>'
							+ '<object xmlns="http://activitystrea.ms/spec/1.0/">'
							+ 	'<object-type>http://onesocialweb.org/spec/1.0/object/status</object-type>'
							+ 	'<content xmlns="http://www.w3.org/2005/Atom" type="text/plain">Hello, world!</content>'
							+ '</object>'
							+ '<acl-rule xmlns="http://onesocialweb.org/spec/1.0/">'
							+	'<acl-action permission="http://onesocialweb.org/spec/1.0/acl/permission/grant">http://onesocialweb.org/spec/1.0/acl/action/view</acl-action>'
							+	'<acl-subject>http://onesocialweb.org/spec/1.0/acl/subject/everyone</acl-subject>'
							+ '</acl-rule>'
							+ '</entry></item>'
							+ '</items></pubsub></iq>'));
                     }
                 );
             oswPlugin.init(mockConnection);
             oswPlugin.callbacks.received_activity.add( function(activity) {
				called++;

                     equals(activity.acl.length, 1, "1 ACL rule");
                     equals(activity.objects.length, 1, "1 Object");

                     equals(activity.jid, "somebody@somewhere.com/outthere", "JID");
                     equals(activity.name, "Somebody Out There", "Name");

                     equals(activity.title, "Hello, world!", "Title");
             });
			oswPlugin.inbox();

            equals(called, 1, "osw.received_activity callback should be called once.");
         });
