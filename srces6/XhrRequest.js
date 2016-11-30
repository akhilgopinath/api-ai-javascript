/**
 * quick ts implementation of example from
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * with some minor improvements
 * @todo: test (?)
 * @todo: add node.js implementation with node's http inside. Just to make SDK cross-platform
 */
class XhrRequest {
    // Method that performs the ajax request
    static ajax(method, url, args = null, headers = null, options = {}) {
        // Creating a promise
        return new Promise(function (resolve, reject) {
            // Instantiates the XMLHttpRequest
            let client = XhrRequest.createXMLHTTPObject();
            let uri = url;
            let payload = null;
            // Add given payload to get request
            if (args && (method === XhrRequest.Method.GET)) {
                uri += "?";
                let argcount = 0;
                for (let key in args) {
                    if (args.hasOwnProperty(key)) {
                        if (argcount++) {
                            uri += "&";
                        }
                        uri += encodeURIComponent(key) + "=" + encodeURIComponent(args[key]);
                    }
                }
            }
            else if (args) {
                if (!headers) {
                    headers = {};
                }
                headers["Content-Type"] = "application/json";
                payload = JSON.stringify(args);
            }
            for (let key in options) {
                if (key in client) {
                    client[key] = options[key];
                }
            }
            // hack: method[method] is somewhat like .toString for enum Method
            // should be made in normal way
            client.open(XhrRequest.Method[method], uri, true);
            // Add given headers
            if (headers) {
                for (let key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        client.setRequestHeader(key, headers[key]);
                    }
                }
            }
            payload ? client.send(payload) : client.send();
            client.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    // Performs the function "resolve" when this.status is equal to 2xx
                    resolve(this);
                }
                else {
                    // Performs the function "reject" when this.status is different than 2xx
                    reject(this);
                }
            };
            client.onerror = function () {
                reject(this);
            };
        });
    }
    static get(url, payload = null, headers = null, options = {}) {
        return XhrRequest.ajax(XhrRequest.Method.GET, url, payload, headers, options);
    }
    static post(url, payload = null, headers = null, options = {}) {
        return XhrRequest.ajax(XhrRequest.Method.POST, url, payload, headers, options);
    }
    static put(url, payload = null, headers = null, options = {}) {
        return XhrRequest.ajax(XhrRequest.Method.PUT, url, payload, headers, options);
    }
    static delete(url, payload = null, headers = null, options = {}) {
        return XhrRequest.ajax(XhrRequest.Method.DELETE, url, payload, headers, options);
    }
    static createXMLHTTPObject() {
        let xmlhttp = null;
        for (let i = 0; i < XhrRequest.XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XhrRequest.XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }
}
XhrRequest.XMLHttpFactories = [
        () => new XMLHttpRequest(),
        () => new ActiveXObject("Msxml2.XMLHTTP"),
        () => new ActiveXObject("Msxml3.XMLHTTP"),
        () => new ActiveXObject("Microsoft.XMLHTTP")
];
(function (XhrRequest) {
    (function (Method) {
        Method[Method["GET"] = "GET"] = "GET";
        Method[Method["POST"] = "POST"] = "POST";
        Method[Method["PUT"] = "PUT"] = "PUT";
        Method[Method["DELETE"] = "DELETE"] = "DELETE";
    })(XhrRequest.Method || (XhrRequest.Method = {}));
    var Method = XhrRequest.Method;
})(XhrRequest || (XhrRequest = {}));
export default XhrRequest;