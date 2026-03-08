import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

// Web-only imports — only compiled on web builds
import 'web_app_screen_web.dart' if (dart.library.io) 'web_app_screen_stub.dart'
    as platform_view;

class WebAppScreen extends StatelessWidget {
  const WebAppScreen({super.key});

  static const String _url = 'https://neurofitness.vercel.app/';

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return const _WebPlatformView();
    }
    return const _MobileWebViewScreen();
  }
}

// ─── Flutter Web: iframe via HtmlElementView ───────────────────────────────
class _WebPlatformView extends StatelessWidget {
  const _WebPlatformView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: platform_view.buildWebView(WebAppScreen._url),
    );
  }
}

// ─── Mobile: webview_flutter ───────────────────────────────────────────────
class _MobileWebViewScreen extends StatefulWidget {
  const _MobileWebViewScreen();

  @override
  State<_MobileWebViewScreen> createState() => _MobileWebViewScreenState();
}

class _MobileWebViewScreenState extends State<_MobileWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _loadingProgress = 0;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0A0A0F))
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() {
          _isLoading = true;
          _hasError = false;
          _loadingProgress = 0;
        }),
        onProgress: (p) => setState(() => _loadingProgress = p),
        onPageFinished: (_) => setState(() => _isLoading = false),
        onWebResourceError: (_) => setState(() {
          _isLoading = false;
          _hasError = true;
        }),
      ))
      ..loadRequest(Uri.parse(WebAppScreen._url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) _LoadingOverlay(progress: _loadingProgress),
          if (_hasError && !_isLoading)
            _ErrorScreen(onRetry: _controller.reload),
        ],
      ),
    );
  }
}

// ─── Loading Overlay ───────────────────────────────────────────────────────
class _LoadingOverlay extends StatefulWidget {
  final int progress;
  const _LoadingOverlay({required this.progress});

  @override
  State<_LoadingOverlay> createState() => _LoadingOverlayState();
}

class _LoadingOverlayState extends State<_LoadingOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.85, end: 1.05)
        .animate(CurvedAnimation(parent: _pulse, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          AnimatedBuilder(
            animation: _pulseAnim,
            builder: (_, __) => Transform.scale(
              scale: _pulseAnim.value,
              child: Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF7C3AED), Color(0xFF06B6D4)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF7C3AED).withOpacity(0.5),
                      blurRadius: 30,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: const Icon(Icons.bolt_rounded,
                    color: Colors.white, size: 44),
              ),
            ),
          ),
          const SizedBox(height: 32),
          ShaderMask(
            shaderCallback: (b) => const LinearGradient(
              colors: [Color(0xFF7C3AED), Color(0xFF06B6D4)],
            ).createShader(b),
            child: const Text('NeuroFit',
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5)),
          ),
          const SizedBox(height: 8),
          Text('Loading your fitness hub...',
              style: TextStyle(
                  color: Colors.white.withOpacity(0.45), fontSize: 14)),
          const SizedBox(height: 36),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 60),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(50),
              child: LinearProgressIndicator(
                value: widget.progress / 100,
                minHeight: 4,
                backgroundColor: Colors.white.withOpacity(0.08),
                valueColor: const AlwaysStoppedAnimation(Color(0xFF7C3AED)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text('${widget.progress}%',
              style: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                  fontSize: 12,
                  fontWeight: FontWeight.w500)),
        ]),
      ),
    );
  }
}

// ─── Error Screen ──────────────────────────────────────────────────────────
class _ErrorScreen extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorScreen({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.06),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Icon(Icons.wifi_off_rounded,
                  color: Colors.white.withOpacity(0.5), size: 36),
            ),
            const SizedBox(height: 24),
            Text('Connection Error',
                style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 20,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Text('Unable to load NeuroFit.\nCheck your internet connection.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 14,
                    height: 1.5)),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 36, vertical: 14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF7C3AED), Color(0xFF06B6D4)],
                  ),
                ),
                child: const Text('Try Again',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 15)),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}
