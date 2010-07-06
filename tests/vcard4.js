

var vcardPlugin = Strophe._connectionPlugins["vcard"];
module("plugins.VCard4", {
    setup: function() {
        vcardPlugin.items = [];

    },
    teardown: function() {
	
    }
});


jackTest("vcard.fetch() should send IQ", function (mockConnection) {
             jack.expect("mockConnection.sendIQ").once();
             vcardPlugin.init(mockConnection);
             vcardPlugin.fetch("callback");
         });

jackTest("vcard.save() should call the vcard callback",
         function (mockConnection) {
	     var handler, called;
	     handler.builder = function() {};
	     jack.expect("handler.builder").once().mock(function(builder) { called ++; });
	     vcardPlugins.save(handler.builder);
	     equals(called, 1, "vcard.save()'s vcard builder should have been called");
	 });

