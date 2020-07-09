package edu.escuelaing.arsw.app.endpoints;


import java.io.IOException;
import java.util.logging.Level;
import java.util.HashMap;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Logger;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;


@Component
@ServerEndpoint("/bbService")
public class TTTEndPoint {


    private static final Logger logger = Logger.getLogger(TTTEndPoint.class.getName());
    /* Queue for all open WebSocket sessions */
    static Queue<Session> queue = new ConcurrentLinkedQueue<>();
    static HashMap<Session,String> lista = new HashMap<>();


    Session ownSession = null;

    /* Call this method to send a message to all clients */
    public void send(String msg) {
    	System.out.println("ESTA ENTRANDO EN EL SEND DEL SERVIDOR: "+msg);
    	logger.log(Level.INFO, "SEND DEL SERVIDOR");
    	if(queue.size()>1) {
    		System.out.println("El size de la lista es mayor a 1");
    	}
        try {
            /* Send updates to all open WebSocket sessions */
        	System.out.println("longitud de sesiones: "+queue.size());
            for (Session session : queue) {
                if (!session.equals(this.ownSession)) {
                	System.out.println("Entra en su propio condicional así que no envia nada");
                    session.getBasicRemote().sendText(msg);
                }
                logger.log(Level.INFO, "Sent: {0}", msg);
            }
        } catch (IOException e) {
            logger.log(Level.INFO, e.toString());
        }
    }

    @OnMessage
    public void processPoint(String message, Session session) {
    	logger.log(Level.INFO, "Point received:" + message + ". From session: " + session);
    	System.out.println("Esta enviando este mensaje desde el server: "+message);
    	System.out.println("Esta es la lista: "+lista.toString());
    	System.out.println("Estos rangos: "+message.substring(message.length()-3, message.length()-1));
    	if(lista.get(session).equals("xx")) {
    		System.out.println("Ultima ficha enviada un xx");
    		if(message.substring(message.length()-3, message.length()-1).equals("xx")) {
    			this.send(message);	
    		}
    		else {
    			System.out.println("En else de xx");
    			this.send(message);
    		}
    		
    	}
    	else if (lista.get(session).equals("oo")){
    		System.out.println("Ultima ficha enviada un oo: "+lista.get(session));
    		if(message.substring(message.length()-3, message.length()-1).equals("oo")) {
    			this.send(message);	
    		}
    		else {
    			System.out.println("En else de xx");
    			this.send(message);
    		}
    	}
    	else {
    		System.out.println("Entra en else");
    	}
        //this.send(message);
    }

    @OnOpen
    public void openConnection(Session session) {
        /* Register this connection in the queue */
        queue.add(session);
        ownSession = session;
        logger.log(Level.INFO, "Connection opened.");
        try {
        	if(queue.size()%2==0) {
        		lista.put(session, "xx");
        		session.getBasicRemote().sendText("xx");
        	}
        	else {
        		lista.put(session, "oo");
        		session.getBasicRemote().sendText("oo");
        	}
        	//session.getBasicRemote().;
            session.getBasicRemote().sendText("Connection established.");
        } catch (IOException ex) {
            logger.log(Level.SEVERE, null, ex);
        }
    }


    @OnClose
    public void closedConnection(Session session) {
        /* Remove this connection from the queue */
        queue.remove(session);
        logger.log(Level.INFO, "Connection closed.");
    }


    @OnError
    public void error(Session session, Throwable t) {
        /* Remove this connection from the queue */
        queue.remove(session);
        logger.log(Level.INFO, t.toString());
        logger.log(Level.INFO, "Connection error.");
    }
}