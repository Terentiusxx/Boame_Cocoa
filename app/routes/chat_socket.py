from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.connect_manager import manager

router = APIRouter()


@router.websocket("/ws/{role}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    role: str,
    user_id: int
):
    """
    WebSocket endpoint for real time communication.

    Connect using:
    ws://your-server/ws/user/5
    ws://your-server/ws/expert/3
    ws://your-server/ws/admin/1

    Messages sent should be JSON like:
    {
        "receiver_role": "expert",
        "receiver_id": 3,
        "content": "Hello doctor"
    }
    """
    client_id = f"{role}_{user_id}"
    await manager.connect(client_id, websocket)

    # Notify client they are connected
    await websocket.send_json({
        "type": "connection_success",
        "message": f"Connected as {client_id}",
        "online_users": manager.get_connected_clients()
    })

    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_json()

            message_type = data.get("type", "message")

            # Handle ping to keep connection alive
            if message_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # Handle sending a message to another user
            receiver_role = data.get("receiver_role")
            receiver_id = data.get("receiver_id")
            content = data.get("content")

            if not receiver_role or not receiver_id or not content:
                await websocket.send_json({
                    "type": "error",
                    "message": "receiver_role, receiver_id and content are required"
                })
                continue

            target_client = f"{receiver_role}_{receiver_id}"

            # Send to target client
            await manager.send_message(target_client, {
                "type": "new_message",
                "sender_id": client_id,
                "content": content
            })

            # Confirm to sender
            await websocket.send_json({
                "type": "message_sent",
                "to": target_client,
                "content": content
            })

    except WebSocketDisconnect:
        manager.disconnect(client_id, websocket)
        print(f"Client {client_id} disconnected")