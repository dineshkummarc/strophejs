$(document).ready(function () {
    module("XML");

    test("XML escaping test", function () {
        var text = "s & p";
	var textNode = Strophe.xmlTextNode(text);
	equals(Strophe.getText(textNode), "s &amp; p", "should be escaped");
	var text0 = "s < & > p";
	var textNode0 = Strophe.xmlTextNode(text0);
	equals(Strophe.getText(textNode0), "s &lt; &amp; &gt; p", "should be escaped");
    });

    test("XML element creation", function () {
        var elem = Strophe.xmlElement("message");
        equals(elem.tagName, "message", "Element name should be the same");
    });
});