// Web fallback for react-native-webview (which doesn't run on web).
// Renders an <iframe>: src for remote pages, srcDoc for inline HTML
// (srcDoc executes <script>, so Leaflet/Google maps work too).
import React from 'react';
import { StyleSheet } from 'react-native';

type Source = { uri?: string; html?: string };

export function WebView({ source, style }: { source?: Source; style?: any; [k: string]: any }) {
  const flat = StyleSheet.flatten(style) || {};
  const iframeStyle: any = { border: 'none', width: '100%', height: '100%', ...flat };
  if (source?.uri) {
    return React.createElement('iframe', { src: source.uri, style: iframeStyle, allowFullScreen: true });
  }
  if (source?.html) {
    return React.createElement('iframe', { srcDoc: source.html, style: iframeStyle });
  }
  return null;
}

export default WebView;
