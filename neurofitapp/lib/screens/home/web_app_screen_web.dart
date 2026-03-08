// This file is compiled ONLY on Flutter Web builds.
// It uses dart:html to embed the NeuroFit website as a full-screen iframe.

import 'dart:html' as html;
import 'dart:ui_web' as ui;
import 'package:flutter/material.dart';

const String _viewType = 'neurofit-iframe';
bool _registered = false;

Widget buildWebView(String url) {
  if (!_registered) {
    _registered = true;
    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory(
      _viewType,
      (int viewId) {
        final iframe = html.IFrameElement()
          ..src = url
          ..style.border = 'none'
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.margin = '0'
          ..style.padding = '0'
          ..allow = 'fullscreen; camera; microphone'
          ..setAttribute('allowfullscreen', 'true');
        return iframe;
      },
    );
  }

  return const SizedBox.expand(
    child: HtmlElementView(viewType: _viewType),
  );
}
