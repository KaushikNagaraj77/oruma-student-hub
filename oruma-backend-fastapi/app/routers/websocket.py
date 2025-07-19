from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import json
import logging

from app.database import get_db
from app.dependencies import get_websocket_user
from app.websocket.connection_manager import manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time communication"""
    
    # Authenticate user
    user = get_websocket_user(token, db)
    if not user:
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    user_id = str(user.id)
    
    try:
        # Connect user
        await manager.connect(websocket, user_id)
        
        while True:
            # Receive message
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get("type")
                message_data = message.get("data", {})
                
                # Handle different message types
                if message_type == "ping":
                    await manager.handle_ping(websocket)
                
                elif message_type == "user_typing":
                    await handle_typing_indicator(user_id, message_data)
                
                elif message_type == "message_read":
                    await handle_message_read(user_id, message_data)
                
                elif message_type == "post_liked":
                    await handle_post_interaction(user_id, "post_liked", message_data)
                
                elif message_type == "post_unliked":
                    await handle_post_interaction(user_id, "post_unliked", message_data)
                
                elif message_type == "post_commented":
                    await handle_post_interaction(user_id, "post_commented", message_data)
                
                elif message_type == "post_saved":
                    await handle_post_interaction(user_id, "post_saved", message_data)
                
                elif message_type == "post_unsaved":
                    await handle_post_interaction(user_id, "post_unsaved", message_data)
                
                else:
                    logger.warning(f"Unknown message type: {message_type}")
            
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from user {user_id}")
            except Exception as e:
                logger.error(f"Error processing message from user {user_id}: {e}")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket)


async def handle_typing_indicator(user_id: str, data: dict):
    """Handle typing indicator"""
    conversation_id = data.get("conversationId")
    is_typing = data.get("isTyping", False)
    
    if not conversation_id:
        return
    
    # In a real implementation, you would:
    # 1. Get conversation participants from database
    # 2. Send typing indicator to other participants
    
    # For now, just broadcast to all users (mock implementation)
    typing_message = {
        "type": "user_typing",
        "data": {
            "userId": user_id,
            "conversationId": conversation_id,
            "isTyping": is_typing
        }
    }
    
    # This would send to conversation participants in real implementation
    logger.info(f"User {user_id} typing in conversation {conversation_id}: {is_typing}")


async def handle_message_read(user_id: str, data: dict):
    """Handle message read receipt"""
    message_id = data.get("messageId")
    conversation_id = data.get("conversationId")
    
    if not message_id or not conversation_id:
        return
    
    # In real implementation:
    # 1. Update message status in database
    # 2. Get message sender
    # 3. Send read receipt to sender
    
    read_message = {
        "type": "message_read",
        "data": {
            "messageId": message_id,
            "conversationId": conversation_id,
            "readBy": user_id
        }
    }
    
    logger.info(f"Message {message_id} read by user {user_id}")


async def handle_post_interaction(user_id: str, interaction_type: str, data: dict):
    """Handle post interactions (like, comment, save)"""
    post_id = data.get("postId")
    
    if not post_id:
        return
    
    # In real implementation:
    # 1. Update post interaction in database
    # 2. Get post author
    # 3. Send notification to post author
    # 4. Possibly broadcast to other users viewing the post
    
    interaction_message = {
        "type": interaction_type,
        "data": {
            "postId": post_id,
            "userId": user_id,
            **data  # Include any additional data
        }
    }
    
    logger.info(f"User {user_id} performed {interaction_type} on post {post_id}")