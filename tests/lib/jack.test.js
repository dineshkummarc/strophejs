
/**
 * Transform an object prototype to array
 * Usefull for jack
 * TODO: implement it on Jack
 */
function object2Array(object) {
    var a = [];
    for (var i in object.prototype) {
        if (typeof object.prototype[i] == "function") {
            a.push(i);
        }
    }
    return a;
}


// Qunit test with jack for mocking facility
function jackTest(name, fun) {
    test(name,
         function() {
             jack(
                 function() {
                     var mockConnection = jack.create("mockConnection", object2Array(Strophe.Connection));
                     fun(mockConnection);
                 }

             );
         }
        );
}