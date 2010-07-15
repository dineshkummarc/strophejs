$(document).ready(function () {

    module("Builder");

    test("Correct namespace (#32)", function () {
        var stanzas = [new Strophe.Builder("message", {foo: "asdf"}).tree(),
                       $build("iq", {}).tree(),
                       $pres().tree()];
        $.each(stanzas, function () {
            equals($(this).attr('xmlns'), Strophe.NS.CLIENT,
                  "Namespace should be '" + Strophe.NS.CLIENT + "'");
        });
    });
    
    test("send() accepts Builders (#27)", function () {
        var stanza = $pres();
        var conn = new Strophe.Connection("");
        // fake connection callback to avoid errors
        conn.connect_callback = function () {};
        
        ok(conn._data.length === 0, "Output queue is clean");
        try {
            conn.send(stanza);
        } catch (e) {}
        ok(conn._data.length === 1, "Output queue contains an element");

	clearTimeout(conn._idleTimeout);
    });

    test("send() does not accept strings", function () {
        var stanza = "<presence/>";
        var conn = new Strophe.Connection("");
        // fake connection callback to avoid errors
        conn.connect_callback = function () {};
        expect(1);
        try {
            conn.send(stanza);
        } catch (e) {
            equals(e.name, "StropheError", "send() should throw exception");
        }

	clearTimeout(conn._idleTimeout);
    });

    test("Builder with XML attribute escaping test", function () {
        var text = "<b>";
        var expected = "<presence to='&lt;b>' xmlns='jabber:client'/>";
        var pres = $pres({to: text});
        equals(pres.toString(), expected, "< should be escaped");

        text = "foo&bar";
        expected = "<presence to='foo&amp;bar' xmlns='jabber:client'/>";
        pres = $pres({to: text});
        equals(pres.toString(), expected, "& should be escaped");
    });

});