// Stub file — used on non-web platforms (Android, iOS, desktop).
// The web implementation (web_app_screen_web.dart) is used on Flutter Web.
// This stub is never actually called at runtime on mobile.

import 'package:flutter/material.dart';

Widget buildWebView(String url) {
  // This code path is never reached on mobile —
  // web_app_screen.dart uses webview_flutter directly when !kIsWeb.
  return const SizedBox.shrink();
}
