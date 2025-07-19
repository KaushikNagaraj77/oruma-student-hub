from fastapi import WebSocket
from typing import Dict, List, Optional
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Dictionary mapping user_id to list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Dictionary mapping WebSocket to user_id
        self.connection_to_user: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection and register user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        self.connection_to_user[websocket] = user_id
        
        logger.info(f"User {user_id} connected via WebSocket")
        
        # Notify others that user is online
        await self.broadcast_user_status(user_id, True)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        user_id = self.connection_to_user.get(websocket)
        
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            # If no more connections for this user, remove from active users
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Notify others that user is offline
                logger.info(f"User {user_id} disconnected from WebSocket")
        
        # Remove from connection mapping
        if websocket in self.connection_to_user:
            del self.connection_to_user[websocket]
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user's all connections"""
        if user_id in self.active_connections:
            message_str = json.dumps(message)
            disconnected_connections = []
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    disconnected_connections.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected_connections:
                self.active_connections[user_id].remove(conn)
                if conn in self.connection_to_user:
                    del self.connection_to_user[conn]
    
    async def send_to_conversation(self, message: dict, user_ids: List[str], exclude_user: Optional[str] = None):
        """Send message to all users in a conversation"""
        for user_id in user_ids:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal_message(message, user_id)
    
    async def broadcast_user_status(self, user_id: str, is_online: bool):
        """Broadcast user online/offline status"""
        message = {
            "type": "user_online" if is_online else "user_offline",
            "data": {
                "userId": user_id,
                "isOnline": is_online
            }
        }
        
        # Send to all connected users except the user themselves
        for connected_user_id in self.active_connections:
            if connected_user_id != user_id:
                await self.send_personal_message(message, connected_user_id)
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if user is currently online"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    def get_online_users(self) -> List[str]:
        """Get list of currently online user IDs"""
        return list(self.active_connections.keys())
    
    async def handle_ping(self, websocket: WebSocket):
        """Handle ping message (heartbeat)"""
        try:
            await websocket.send_text(json.dumps({"type": "pong"}))
        except Exception as e:
            logger.error(f"Error sending pong: {e}")


# Global connection manager instance
manager = ConnectionManager()