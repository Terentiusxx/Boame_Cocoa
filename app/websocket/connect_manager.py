from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        # Format: {"expert_1": [ws1, ws2], "user_5": [ws3]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        print(f"Client connected: {client_id} | Total connections: {len(self.active_connections)}")

    def disconnect(self, client_id: str, websocket: WebSocket):
        """Remove a specific WebSocket connection"""
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
            # Clean up key if no devices are left
            if not self.active_connections[client_id]:
                self.active_connections.pop(client_id)
            print(f"Client disconnected: {client_id}")

    async def send_message(self, client_id: str, message: dict):
        """Send a message to ALL devices owned by this client"""
        connections = self.active_connections.get(client_id, [])
        disconnected = []

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Mark broken connections for removal
                disconnected.append(connection)

        # Clean up broken connections
        for conn in disconnected:
            self.active_connections[client_id].remove(conn)

    async def broadcast(self, message: dict):
        """Send a message to ALL connected clients"""
        for client_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    def get_connected_clients(self) -> List[str]:
        """Returns a list of all currently connected client IDs"""
        return list(self.active_connections.keys())

    def is_connected(self, client_id: str) -> bool:
        """Check if a specific client is currently connected"""
        return client_id in self.active_connections


# Single instance used across the entire app
manager = ConnectionManager()
