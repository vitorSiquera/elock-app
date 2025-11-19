import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://192.168.12.5:8000';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket && socket.connected) return socket;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  socket.on('connect_error', (err) => {
    console.warn('socket connect_error', err?.message || err);
  });

  return socket;
}

export function disconnectSocket() {
  try {
    socket?.disconnect();
  } finally {
    socket = null;
  }
}

export function joinLock(lockId: number) {
  if (!socket) return;
  socket.emit('join-lock', { lockId });
}

export function leaveLock(lockId: number) {
  if (!socket) return;
  socket.emit('leave-lock', { lockId });
}

export function onDoorLockUpdated(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('door-lock-updated', cb);
}

export function offDoorLockUpdated(cb?: (payload: any) => void) {
  if (!socket) return;
  if (cb) socket.off('door-lock-updated', cb);
  else socket.removeAllListeners('door-lock-updated');
}

export function onDoorLockRemoved(cb: (payload: any) => void) {
  if (!socket) return;
  socket.on('door-lock-removed', cb);
}

export function offDoorLockRemoved(cb?: (payload: any) => void) {
  if (!socket) return;
  if (cb) socket.off('door-lock-removed', cb);
  else socket.removeAllListeners('door-lock-removed');
}

export function getSocket() {
  return socket;
}
