function toDom(string)
{
    if (window.DOMParser)
    {
        var parser = new DOMParser();
        return parser.parseFromString(string, "text/xml").documentElement;
    }
    else // Internet Explorer
    {
        var parser = new ActiveXObject("Microsoft.XMLDOM");
        parser.async = "false";
        parser.loadXML(string);
        return parser.documentElement;
    }
}