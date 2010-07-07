

var plugin = Strophe._connectionPlugins["vcard-temp"];
module("plugins.vcard-temp", {
    setup: function() {

    },
    teardown: function() {
	
    }
});


jackTest("vcard-temp.fetch() should send IQ", function (mockConnection) {
             jack.expect("mockConnection.sendIQ").once();
             plugin.init(mockConnection);
             plugin.fetch("romeo@example.net");
         });

jackTest("vcard-temp.fetch() should call the vcard callback",
         function (mockConnection) {
	     var callbackIQ, vCardResponse, called;

	     called = 0;
	     vCardResponse = toDom("<iq from='jer@jabber.org' \
to='stpeter@jabber.org/roundabout' \
    type='result'\
    id='v3'>\
  <vCard xmlns='vcard-temp'>\
    <FN>JeremieMiller</FN>\
    <N>\
      <GIVEN>Jeremie</GIVEN>\
      <FAMILY>Miller</FAMILY>\
      <MIDDLE/>\
    </N>\
    <NICKNAME>jer</NICKNAME>\
    <EMAIL><INTERNET/><PREF/><USERID>jeremie@jabber.org</USERID></EMAIL>\
    <JABBERID>jer@jabber.org</JABBERID>\
  </vCard>\
</iq>");

	     mockRoster = jack.create("mockRoster", ["get_contact"]);

	     jack.expect("mockConnection.sendIQ")
                 .once().mock(
                     function(iq, callbacksuccess, callbackerror) {
                         callbacksuccess(vCardResponse);
                     });
	     
	     jack.expect("mockRoster.get_contact")
		 .once().mock(
		     function(jid) {
			 equals(jid, "jer@jabber.org");
			 return {
			     jid: jid
			 };
		     });

	     plugin.init(mockConnection, mockRoster);
	     plugin.fetch("jer@jabber.org", function(contact) {
		 equals("jer", contact.nickname);
		 equals("JeremieMiller", contact.name);
		 equals("Jeremie", contact.n.given);
		 equals("Miller", contact.n.family);
		 // equals("jeremie@jabber.org", contact.email.userid);
	     });
	     
	     
	 });

