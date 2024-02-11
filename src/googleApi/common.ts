import { Notice } from "obsidian";
import { getGoogleAuthToken } from "../googleApi/GoogleAuth";
import GoogleEventsPlugin from "../../main";
import { GoogleApiError } from "../googleApi/GoogleApiError";
import { requestUrl } from "obsidian";
import { refreshToken } from "src/state";

export function createNotice(text: string) {
	new Notice(text, 10 * 1000);
}

export function settingsAreComplete() {
	const plugin = GoogleEventsPlugin.instance;
	if (
		!plugin.settings.googleClientId ||
		!plugin.settings.googleClientSecret
	) {
		createNotice("Google Calendar missing settings");
		return false;
	}
	return true;
}

export function settingsAreCompleteAndLoggedIn() {
	if (!refreshToken()) {
		createNotice("Google Calendar missing settings or not logged in");
		return false;
	}
	return true;
}

export const callRequest = async (
	url: string,
	method: string,
	body: any,
	noAuth = false
): Promise<any> => {
	const plugin = GoogleEventsPlugin.instance;

	const requestHeaders: { [key: string]: string } = {
		"Content-Type": "application/json",
	};
	if (noAuth == false) {
		const bearer = await getGoogleAuthToken(plugin);
		if (!bearer) {
			throw new GoogleApiError(
				"Error Google API request",
				{ method, url, body },
				401,
				{ error: "Missing Auth Token" }
			);
		}
		requestHeaders["Authorization"] = "Bearer " + bearer;
	}

	//Debugged request
	// if (plugin.settings.debugMode) {
	// 	console.log(`New Request ${method}:${url}`);

	// 	const sanitizeHeader = { ...requestHeaders };
	// 	if (sanitizeHeader["Authorization"]) {
	// 		sanitizeHeader["Authorization"] =
	// 			sanitizeHeader["Authorization"].substring(0, 15) + "...";
	// 	}
	// 	console.log({ body, headers: sanitizeHeader });

	// 	let response;
	// 	try {
	// 		response = await fetch(url, {
	// 			method: method,
	// 			body: body ? JSON.stringify(body) : null,
	// 			headers: requestHeaders,
	// 		});
	// 	} catch (error) {
	// 		if (response) {
	// 			throw new GoogleApiError(
	// 				"Error Google API request",
	// 				{ method, url, body },
	// 				response.status,
	// 				await response.json()
	// 			);
	// 		} else {
	// 			throw new GoogleApiError(
	// 				"Error Google API request",
	// 				{ method, url, body },
	// 				500,
	// 				{ error: "Unknown Error" }
	// 			);
	// 		}
	// 	}

	// 	if (response.status >= 300) {
	// 		throw new GoogleApiError(
	// 			"Error Google API request",
	// 			{ method, url, body },
	// 			response.status,
	// 			await response.json()
	// 		);
	// 	}

	// 	if (method.toLowerCase() == "delete") {
	// 		return { status: "success" };
	// 	}

	// 	return await response.json();
	// }

	//Normal request
	let response;
	try {
		response = await requestUrl({
			method: method,
			url: url,
			body: body ? JSON.stringify(body) : undefined,
			headers: requestHeaders,
			throw: false,
		});
	} catch (error) {
		if (response) {
			throw new GoogleApiError(
				"Error Google API request",
				{ method, url, body },
				response.status,
				await response.json()
			);
		} else {
			throw new GoogleApiError(
				"Error Google API request",
				{ method, url, body },
				500,
				{ error: "Unknown Error" }
			);
		}
	}

	if (response.status >= 300) {
		throw new GoogleApiError(
			"Error Google API request",
			{ method, url, body },
			response.status,
			response.json
		);
	}

	// For to indicate success because the response is empty
	if (method.toLowerCase() == "delete") {
		return { status: "success" };
	}

	return await response.json;
};
