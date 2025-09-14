import Sound from 'react-native-sound';

	try {
		const file = name === 'bloop' ? 'bloop.mp3' : 'pop_effect.mp3';
		const sound = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
			if (error) {
				console.log('Failed to load the sound', error);
				return;
			}
			sound.play((success) => {
				if (!success) {
					console.log('Sound playback failed');
				}
				sound.release();
			});
		});
	} catch (error) {
		console.log('Failed to play sound:', error);
	}
}
