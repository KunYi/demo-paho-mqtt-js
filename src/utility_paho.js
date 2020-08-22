const passWord = "";
const username = "";
const hostname = "broker.hivemq.com";  //HiveMQ
const port = "8000";    //使用WebSocket協議的介面地址
const clientId = makeId(10);
const sub_topic = "/test_sub01/#";
const pub_topic = "/test_pub01/LED01";

var connected = false;

var client = new Paho.Client(hostname, Number(port), clientId);

logMessage("INFO", "Connecting to Server: [Host: ", hostname, ", Port: ", port, ", ID: ", clientId, "]");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
//  client.onConnected = onConnected;

var options = {
    invocationContext: { host: hostname, port: port, clientId: clientId },
    timeout: 5,
    keepAliveInterval: 60,
    cleanSession: true,
    useSSL: false,
    //reconnect: true,
    onSuccess: onConnect,
    onFailure: onFail,
    mqttVersion: 4  // 3 for MQTT v3.1, 4 for MQTT 3.1.1
};

options.userName = username;
options.password = passWord;

client.connect(options);

function subscribe() {
    var topic = sub_topic;
    var qos = 0;
    logMessage("INFO", "Subscribing to: [Topic: ", topic, ", QoS: ", qos, "]");
    client.subscribe(topic, { qos: Number(qos) });
}


function publish(ledState) {
    var topic = pub_topic;
    var qos = 0;
    var message = ledState;
    var retain = false;

    message = "{\"LED\":\"" + message + "\"} ";

    logMessage("INFO", "Publishing Message: [Topic: ", topic, ", Payload: ", message, ", QoS: ", qos, ", Retain: ", retain, "]");
    message = new Paho.Message(message);
    message.destinationName = topic;
    message.qos = Number(qos);
    message.retained = retain;
    client.send(message);
}


function disconnect() {
    logMessage("INFO", "Disconnecting from Server.");
    client.disconnect();
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        logMessage("INFO", "Connection Lost. [Error Message: ", responseObject.errorMessage, "]");
    }
    connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
    logMessage("INFO", "Message Recieved: [Topic: ", message.destinationName, ", Payload: ", message.payloadString, ", QoS: ", message.qos, ", Retained: ", message.retained, ", Duplicate: ", message.duplicate, "]");
    $('#rxmsg').text(message.payloadString);
}



// called when the client connects
function onConnect(context) {
    // Once a connection has been made, make a subscription.
    var connectionString = context.invocationContext.host + ":" + context.invocationContext.port;
    logMessage("INFO", "Connection Success ", "[URI: ", connectionString, ", ID: ", context.invocationContext.clientId, "]");

    connected = true;
    subscribe();
}


function onConnected(reconnect, uri) {
    // Once a connection has been made
    logMessage("INFO", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
    connected = true;
}

function onFail(context) {
    logMessage("ERROR", "Failed to connect. [Error Message: ", context.errorMessage, "]");

    connected = false;
}

function makeId(lenId) {
    // generation random connection ID;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < lenId; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



function logMessage(type, ...content) {

    var date = new Date();
    var timeString = date.toUTCString();
    var logMessage = timeString + " - " + type + " - " + content.join("");

    if (type === "INFO") {
        console.info(logMessage);
    } else if (type === "ERROR") {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
}
