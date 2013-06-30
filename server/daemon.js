var daemon = require("daemonize2").setup({
    main: "server.js",
    name: "ultimatettt",
    pidfile: "ultimatettt.pid"
});

var restart = false;

daemon.on('stopped',function(){
    if(restart){
        restart = false;
        daemon.start();
    }
});

switch (process.argv[2]) {

    case "start":
        daemon.start();
        break;

    case "stop":
        daemon.stop();
        break;

    case "restart":

        if(!daemon.status()){
            daemon.start();
            break;
        }else{
            restart = true;
            daemon.stop()
        }
               
        break;
    
    case "status":        
        console.log(daemon.status()?'Running as '+daemon.status():'Not Running'); 
        break;

    default:
        console.log("Usage: [start|stop]");
}