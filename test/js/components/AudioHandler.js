/**
 * AudioHandler class for managing audio in web games.
 * @class AudioHandler
 */
export default class AudioHandler {
	/**
	 * Creates an instance of AudioHandler.
	 * @memberof AudioHandler
	 */
	constructor() {
		/**
		 * Map of audio players with their respective IDs.
		 * @type {Map<string, HTMLAudioElement>}
		 */
		this.audio_players = new Map();
		/**
		 * Version number of the AudioHandler class.
		 * @type {string}
		 */
		this.version = "0.0.1";
	}

	/**
	 * Adds an audio player to the AudioHandler instance.
	 * @param {string} id - Unique ID for the audio player.
	 * @param {string} url - URL of the audio file.
	 * @returns {object} Success or error object.
	 */
	add(id, url) {
		if (!id || !id.trim || !url) {
			console.warn("Invalid arguments passed to AudioHandler.add()");
			return {
				success: false,
				operation: "AudioHandler_ADD",
				error: "INVALID_ARGS",
				message: "One or more arguments passed to the AudioHandler.add() method were invalid.",
			};
		}

		const audio = new Audio();
		audio.src = url;
		this.audio_players.set(id, audio);

		return {
			success: true,
			operation: "AudioHandler_ADD",
			id,
		};
	}

	/**
	 * Plays an audio player by its ID.
	 * @param {string} id - ID of the audio player to play.
	 * @returns {Promise<object>} Success or error object.
	 */
	play(id = null) {
		return new Promise(async (resolve, reject) => {
			if (!id || !id.trim) {
				reject({
					success: false,
					operation: "AudioHandler_PLAY",
					id,
					error: "INVALID_ID",
					message: "Invalid id or no id passed. `id` must be of type string.",
				});
			}
			if (!this.audio_players.has(id)) {
				reject({
					success: false,
					operation: "AudioHandler_PLAY",
					id,
					error: "NOT_EXIST",
					message: "The id provided is not mapped to any audio. Try the AudioHandler.add(id, url) method",
				});
			}

			try {
				await this.audio_players.get(id).play();
				resolve({
					success: true,
					operation: "AudioHandler_PLAY",
					id,
					reference: this.audio_players.get(id),
				});
			} catch (error) {
				reject({
					success: false,
					operation: "AudioHandler_PLAY",
					id,
					error: "FAILED_PLAY",
					message: "The audio failed to play. Try checking the audio source and permissions for this website.",
					additional: error,
				});
			}
		});
	}

	/**
	 * Pauses an audio player by its ID.
	 * @param {string} id - ID of the audio player to pause.
	 * @returns {object} Success or error object.
	 */
	pause(id) {
		if (this.audio_players.has(id)) {
			this.audio_players.get(id).pause();
			return {
				success: true,
				operation: "AudioHandler_PAUSE",
				id,
				reference: this.audio_players.get(id),
			};
		}
		return {
			success: false,
			operation: "AudioHandler_PAUSE",
			id,
			error: "FAILED_PAUSE",
			message: "The audio failed to pause. Verify that the `id` exists in the audio_players map.",
		};
	}

	/**
	 * Stops an audio player by its ID and seeks to the end.
	 * @param {string} id - ID of the audio player to stop.
	 * @returns {object} Success or error object.
	 */
	stop(id) {
		if (this.audio_players.has(id)) {
			this.audio_players.get(id).currentTime = this.audio_players.get(id).duration;
			return {
				success: true,
				operation: "AudioHandler_STOP",
				id,
				reference: this.audio_players.get(id),
			};
		}
		return {
			success: false,
			operation: "AudioHandler_STOP",
			id,
			error: "FAILED_STOP",
			message: "The audio failed to stop. Verify that the `id` exists in the audio_players map.",
		};
	}
}