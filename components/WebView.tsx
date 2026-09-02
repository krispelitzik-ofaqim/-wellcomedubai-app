// Native: re-export the real react-native-webview.
// Web builds resolve WebView.web.tsx instead (an <iframe> fallback).
import { WebView } from 'react-native-webview';

export { WebView };
export default WebView;
