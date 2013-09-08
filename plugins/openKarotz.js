var debug = true;

exports.action = function(data, callback, config, manager){
	config = config.modules.openKarotz;
    
    var commande = '';
    
    if(debug)
        console.log('debug 1 : ' + data.action);
    
    switch (data.action) {
        case 'sleep':
            commande = 'sleep';
            send(commande, callback, config, function(reponse) {
                if(reponse.return == '0') {
                    callback({'tts': "le lapin est couché"});
                    return;
                } else {
                    callback({'tts': "le lapin ne veux pas se coucher"});
                    return;                    
                }
            });
            break;
            
        case 'wakeup':
            silent = data.silent == 1 ? '?silent=1' : '';
            commande = 'wakeup' + silent ;
            send(commande, callback, config, function(reponse) {
                if(reponse.return == '0') {
                    callback({'tts': "le lapin se réveil"});
                    return;
                }
            });
            break; 
            
        case 'tts':     
/*            if((config.voix == '[FIXME]') || (config.cache = 'Oui - Non')) {
                callback({'tts': "Merci de vérifier votre configuration"});
                return;                
            } else {*/
                commande = 'tts?';
                commande += 'text=' + data.text;
                commande += '&voice=' + config.voix;
                
                if(config.cache == 'Non')
                    commande += '&nocache=1';
                
                send(commande, callback, config, function(reponse) {
                   
                    if(debug)            
                        console.log(reponse);
                    
                    if(reponse.return != '0') {
                        callback({'tts' : 'Une erreur est arrivée'});
                        return;
                    }
                    
                    callback({});
                    return;
                });                 
         //   }             
            break;
                    
        case 'led':        
            if(typeof data.couleur == 'undefined') {
                callback({'tts': "Il faut une couleur pour la led"});
                return;                
            } else {
                commande = 'leds?';
                commande += 'color=' + data.couleur;  
                
                switch(data.ledAction) {                    
                    case 'clignote':
                        commande += '&pulse=1';
                        
                        switch(data.ledVitesse) {
                            case 'rapidement':
                                commande += '&speed=300';
                                break;
                        
                            case 'lentement':
                                commande += '&speed=1500';
                                break;
                        }                        
                    break;
                }
                send(commande, callback, config, function(reponse) {
                   
                    if(debug)            
                        console.log(reponse);
                    
                    if(reponse.return != '0') {
                        callback({'tts' : 'Une erreur est arrivée'});
                        return;
                    }
                    
                    callback({});
                    
                });                
            }             
            break;
            
        case 'sound':
            commande = 'sound?'; 
            //fonction qui recherche le titre et balance le bon son
            //a faire
            commande += data.mySound;
            
            send(commande, callback, config, function(reponse) {
                
                if(debug)            
                    console.log(reponse);
                
                if(reponse.return != '0') {
                    callback({'tts' : 'Une erreur est arrivée'});
                    return;
                }
                
                callback({});     
            });
    
            break;          
            
        case 'soundControl':
            commande = 'sound_control?cmd='
        
            switch(data.soundAction) {
                case 'pause':
                case 'reprise':
                    commande += 'pause';
                    break;     
                case 'quit':
                    commande += 'quit';
                    break;                      
                   
            }
            send(commande, callback, config, function(reponse) {
               
                if(debug)            
                    console.log(reponse)
                    
                    
                    callback({});
            });
            
            break;
            
        case 'ears':
            
            if(debug)
                console.log('case \'ears\'');
            
            switch(data.earsAction) {
                case 'move':
                    commande = 'ears?';
                    commande += 'left=' + data.earsLeft;
                    commande += '&right=' + data.earsRight;
                    break;
                
                case 'reset':
                    commande = 'ears_reset'
                    break;
                    
                case 'random':
                    commande = 'ears_random';
                    break;
                    
                case 'enable':
                    commande = 'ears_mode?disable=0';
                    break;
                    
                case 'disable':
                    commande = 'ears_mode?disable=1';
                    break;
            }
            
            send(commande, callback, config, function(reponse) {
               
                if(debug)            
                    console.log(reponse)
                
                if(reponse.return == 1) {
                    callback({'tts' : reponse.msg});   
                    return;
                }
                    
                callback({});             
            });            
            break;
            
        case 'rfid':
            switch(data.rfidAction) {
                case 'startRecord':
                    commande = 'rfid_start_record';
                    break;
                    
                case 'stopRecord':
                    commande = 'rfid_stop_record';
                    break;    
                    
                case 'startDelete':
                    commande = 'rfid_start_delete';
                    break;
                    
                case 'stopDelete':
                    commande = 'rfid_stop_delete';
                    break;      
            }
            
            send(commande, callback, config, function(reponse) {
                
                if(debug)            
                    console.log(reponse)
                
                if(reponse.return == 1) {
                    callback({'tts' : reponse.msg});   
                    return;
                }
                    
                callback({});             
            });              
            break;
            
        default:
            callback({});
            break;
    }
}

// ==========================================
//  SEND
// ==========================================
var send = function(commande, callback, config, cb){ 

    // Build URL openkarotz
    var ip  = config.ip
    var url = 'http://' + ip;
    url += '/cgi-bin/';
    url += commande;
    
    if(debug)
        console.log('debug fct send : url ' + url);
    
    // Send Request
    var request = require('request');
    request({ 'uri': url, 'json': true }, function (err, response, json){
        
        if (err || response.statusCode != 200) {
            callback({'tts': "L'action a échoué"});
            return;
        }
        
        if(debug)
            console.log('debug fct send : JSON' + json);
        
        if (cb) 
          cb(json) 
    });

}
