



var plugin = Strophe._connectionPlugins["vcard-temp"];
module("plugins.vcard-temp", {
    setup: function() {

    },
    teardown: function() {
	
    }
});


connection = new Strophe.Connection('/bosh');
$(document).ready(function () {
    module("vcard-temp");

    test("Adding and retrieving VCards from the repository", function () {
        var jid = "darcy@pemberley.lit/library";
	var repo = ContactRepository();
	
	repo.add(
	    {
		jid: jid,
		fn: 'Darcy',
		n: {
		    given: 'Darcy'
		}
	    });
	vcard = repo.get(jid);
	equals(vcard.jid, "darcy@pemberley.lit", "Jid should be darcy@pemberley.lit");
	equals(vcard.fn, "Darcy", "Fullname should be Darcy");
	equals(vcard.n.given, "Darcy", "Given name should be Darcy");
    });

    test("On a presence notification then the VCard should be fetched", function() {
	//connection = new Strophe.Connection('/bosh');
	jack(function() {

	    mockRepository = jack.create("mockRepository", ["add", "get"]);

	    jack.expect("mockRepository.get").mock(function(jid) {
		equals(jid, "darcy@pemberley.lit", "Darcy's VCard should be found in the repository");
	    });

	    plugin.init(connection, mockRepository);
	    plugin.statusChanged(Strophe.Status.CONNECTED);
	    connection._dataRecv({ getResponse: function() { return toDom("<body><presence from='darcy@pemberley.lit/library'><x xmlns='vcard-temp:x:update'><photo>sha1-hash-of-image</photo></x></presence></body>") } });
	});
    });

    test("Interpretting vcard format", function() {
	format = {
	    name: "vcard",
	    children: [{
		name: "n",
		children: [{
		    name: "given"
		}, {
		    name: "surname"
		}, { 
		    name: "family"
		}, {
		    name: "middle"
		}],
	    }, {
		name: "nickname"
	    }]
	};
	
	vcard = {};
	
	xml = toDom("<VCARD><FN>Peter Saint-Andre</FN>" + 
		    "<N>" +
		    "<FAMILY>Saint-Andre</FAMILY>" +
		    "<GIVEN>Peter</GIVEN>" +
		    "<MIDDLE/>" +
		    "</N>" +
		    "<NICKNAME>stpeter</NICKNAME>" +
		    "<URL>http://www.xmpp.org/xsf/people/stpeter.shtml</URL>" +
		    "<BDAY>1966-08-06</BDAY>" +
		    "<ORG>" +
		    "<ORGNAME>XMPP Standards Foundation</ORGNAME>" +
		    "<ORGUNIT/>" +
		    "</ORG>" +
		    "<TITLE>Executive Director</TITLE>" +
		    "<ROLE>Patron Saint</ROLE>" +
		    "<TEL><WORK/><VOICE/><NUMBER>303-308-3282</NUMBER></TEL>" +
		    "<TEL><WORK/><FAX/><NUMBER/></TEL>" +
		    "<TEL><WORK/><MSG/><NUMBER/></TEL>" +
		    "<ADR>" +
		    "<WORK/>" +
		    "<EXTADD>Suite 600</EXTADD>" +
		    "<STREET>1899 Wynkoop Street</STREET>" +
		    "<LOCALITY>Denver</LOCALITY>" +
		    "<REGION>CO</REGION>" +
		    "<PCODE>80202</PCODE>" +
		    "<CTRY>USA</CTRY>" +
		    "</ADR>" +
		    "<TEL><HOME/><VOICE/><NUMBER>303-555-1212</NUMBER></TEL>" +
		    "<TEL><HOME/><FAX/><NUMBER/></TEL>" +
		    "<TEL><HOME/><MSG/><NUMBER/></TEL>" +
		    "<ADR>" +
		    "<HOME/>" +
		    "<EXTADD/>" +
		    "<STREET/>" +
		    "<LOCALITY>Denver</LOCALITY>" +
		    "<REGION>CO</REGION>" +
		    "<PCODE>80209</PCODE>" +
		    "<CTRY>USA</CTRY>" +
		    "</ADR>" +
		    "<EMAIL><INTERNET/><PREF/><USERID>stpeter@jabber.org</USERID></EMAIL>" +
		    "<JABBERID>stpeter@jabber.org</JABBERID>" +
		    "<DESC>" +
		    "More information about me is located on my " +
		    " personal website: http://www.saint-andre.com/" +
		    "</DESC></VCARD>");
		       
	/*var parse_vcard = function(format, xml) {
	    var vcard = {};
	    var parse_format_branch = function(prefix, format, xml) {
		console.debug(format.children.length);
		var index;
		for (index = 0; index < format.children.length; index = index + 1) {
		    item = format.children[index];
		    if (typeof(item.children) === 'undefined' ||
			item.children.length === 0) {
			matcher = prefix + ' ' + item.name;
			console.debug(matcher);
			console.debug(xml);
			console.debug(xml.children(matcher).first().text());
			var i1, spl;
			spl = matcher.split(' ');
			var attr = vcard;
			for (i1 = 0; i1 < spl.length - 1; i1 = i1 + 1) {
			    next_attr = attr[spl[i1]];
			    if (typeof(next_attr) === 'undefined') {
				attr[spl[i1]] = {};
				next_attr = attr[spl[i1]];
			    }
			    attr = next_attr;
			}
			attr = xml.children(matcher).first().text();
		    } else {
			parse_format_branch(prefix + " " + item.name, item, xml);
		    }
		}
	    };
	    parse_format_branch("", format, xml);
	    console.debug(vcard);
	};
	parse_vcard(format, xml);*/
	console.debug(xml);
	console.debug($.xml2json('<?xml version="1.0" encoding="utf-8"?><animals><dog color=\'Black\'><name>Rufus</name><breed>labrador</breed></dog><dog breed=\'whippet\'>Adopted<name>Marty</name></dog><cat color="White"><name>Matilda</name></cat></animals>'));
    console.debug($.xml2json(xml));
    });



});

/*jackTest("vcard-temp.fetch() should send IQ", function (mockConnection) {
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

	 */