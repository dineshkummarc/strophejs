$(document).ready(function () {
    module("JIDs");

    test("Normal JID", function () {
        var jid = "darcy@pemberley.lit/library";
        equals(Strophe.getNodeFromJid(jid), "darcy",
               "Node should be 'darcy'");
        equals(Strophe.getDomainFromJid(jid), "pemberley.lit",
               "Domain should be 'pemberley.lit'");
        equals(Strophe.getResourceFromJid(jid), "library",
               "Node should be 'library'");
        equals(Strophe.getBareJidFromJid(jid),
               "darcy@pemberley.lit",
               "Bare JID should be 'darcy@pemberley.lit'");
    });

    test("Weird node (unescaped)", function () {
        var jid = "darcy@netherfield.lit@pemberley.lit/library";
        equals(Strophe.getNodeFromJid(jid), "darcy",
               "Node should be 'darcy'");
        equals(Strophe.getDomainFromJid(jid),
               "netherfield.lit@pemberley.lit",
               "Domain should be 'netherfield.lit@pemberley.lit'");
        equals(Strophe.getResourceFromJid(jid), "library",
               "Resource should be 'library'");
        equals(Strophe.getBareJidFromJid(jid),
               "darcy@netherfield.lit@pemberley.lit",
               "Bare JID should be 'darcy@netherfield.lit@pemberley.lit'");
    });

    test("Weird node (escaped)", function () {
        var escapedNode = Strophe.escapeNode("darcy@netherfield.lit");
        var jid = escapedNode + "@pemberley.lit/library";
        equals(Strophe.getNodeFromJid(jid), "darcy\\40netherfield.lit",
               "Node should be 'darcy\\40netherfield.lit'");
        equals(Strophe.getDomainFromJid(jid),
               "pemberley.lit",
               "Domain should be 'pemberley.lit'");
        equals(Strophe.getResourceFromJid(jid), "library",
               "Resource should be 'library'");
        equals(Strophe.getBareJidFromJid(jid),
               "darcy\\40netherfield.lit@pemberley.lit",
               "Bare JID should be 'darcy\\40netherfield.lit@pemberley.lit'");
    });

    test("Weird resource", function () {
        var jid = "books@chat.pemberley.lit/darcy@pemberley.lit/library";
        equals(Strophe.getNodeFromJid(jid), "books",
               "Node should be 'books'");
        equals(Strophe.getDomainFromJid(jid), "chat.pemberley.lit",
               "Domain should be 'chat.pemberley.lit'");
        equals(Strophe.getResourceFromJid(jid),
               "darcy@pemberley.lit/library",
               "Resource should be 'darcy@pemberley.lit/library'");
        equals(Strophe.getBareJidFromJid(jid),
               "books@chat.pemberley.lit",
               "Bare JID should be 'books@chat.pemberley.lit'");
    });
});