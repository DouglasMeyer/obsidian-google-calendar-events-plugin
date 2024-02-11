export function refreshToken(value?: string): string {
	const key = "refreshToken";
	if (value !== undefined) {
		window.localStorage.setItem(key, value);
	}
	return window.localStorage.getItem(key) || "";
}

export function accessToken(value?: string): string {
	const key = "accessToken";
	if (value !== undefined) {
		window.localStorage.setItem(key, value);
	}
	return window.localStorage.getItem(key) || "";
}

export function expirationTime(value?: number): number {
	const key = "expirationTime";
	if (value !== undefined) {
		window.localStorage.setItem(key, String(value));
	}
	return parseInt(window.localStorage.getItem(key) || "0", 10);
}
