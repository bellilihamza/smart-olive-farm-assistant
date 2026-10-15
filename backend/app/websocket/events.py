"""
WebSocket event manager.

Broadcasts anonymised DiagnosisEvent dicts to all connected dashboard
clients in real-time.
"""
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

websocket_router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict[str, Any]) -> None:
        payload = json.dumps(data, default=str)
        dead: list[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@websocket_router.websocket("/events")
async def ws_events(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive; messages are push-only from server
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
