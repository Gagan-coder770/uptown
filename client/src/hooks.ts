import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './stores'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Get current player's chosen name
export function usePlayerName() {
	const sessionId = useAppSelector((state) => state.user.sessionId);
	const playerNameMap = useAppSelector((state) => state.user.playerNameMap);
	return playerNameMap.get(sessionId) || '';
}

// Get lobby info (type and name)
export function useLobbyInfo() {
	const roomType = useAppSelector((state) => state.room.roomName === 'custom' ? 'private' : 'public');
	const lobbyName = useAppSelector((state) => state.room.roomName);
	return { roomType, lobbyName };
}
