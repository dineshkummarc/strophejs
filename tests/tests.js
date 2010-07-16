
$(document).ready(function () {
    module("Misc");

    test("Quoting strings", function () {
        var input = '"beep \\40"';
        var conn = new Strophe.Connection();
	var output = conn._quote(input);
        equals(output, "\"\\\"beep \\\\40\\\"\"",
               "string should be quoted and escaped");
	clearTimeout(conn._idleTimeout);
	clearTimeout(conn._disconnectTimeout);
    });
});
