import {useEffect, useState} from 'react';
import {
  Button,
  Text,
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  TranscriptionEventEmitter,
  startListening,
  stopListening,
  destroyRecognizer,
  language,
} from 'react-native-transcription';

export default function App() {
  const [results, setResults] = useState<string[]>([]);
  const [partialResults, setPartialResults] = useState<string[]>([]);
  const [error, setError] = useState<number | null>(null);
  useEffect(() => {
    console.log(Platform.OS === 'android');
    const resultListener = TranscriptionEventEmitter.addListener(
      'onSpeechResults',
      event => {
        console.log('Result from native:', event);
        setResults(event.results || []);
      },
    );
    const partialResultListener = TranscriptionEventEmitter.addListener(
      'onSpeechPartialResults',
      event => {
        console.log('Partial result from native:', event);
        setPartialResults(event.results || []);
        // Handle partial results if needed
      },
    );
    const errorListener = TranscriptionEventEmitter.addListener(
      'onSpeechError',
      event => {
        console.log('onSpeechError', event);
        setError(event.error);
      },
    );
    return () => {
      resultListener.remove();
      partialResultListener.remove();
      errorListener.remove();
      destroyRecognizer();
    };
  }, []);

  // Request permission on Android
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      alert('hi');
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ).then(result => {
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Audio permission denied');
          setError('Audio permission denied');
        } else {
          console.log('Audio permission granted');
        }
      });
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title="Start Listening"
        onPress={() => startListening(language.arabicSA)}
      />
      <Button title="Stop Listening" onPress={() => stopListening()} />
      <Text>RealTime results: {partialResults.join(', ')}</Text>
      <Text>Final Results: {results.join(', ')}</Text>
      {error !== null && <Text>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
