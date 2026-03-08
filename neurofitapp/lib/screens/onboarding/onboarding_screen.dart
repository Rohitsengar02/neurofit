import 'dart:math';
import 'package:flutter/material.dart';
import '../../screens/home/web_app_screen.dart';
import 'onboarding_page_data.dart';
import 'widgets/bubble_painter.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // Bubble animation controllers
  late List<AnimationController> _bubbleControllers;
  late List<Animation<double>> _bubbleAnimations;
  final int _bubbleCount = 18;
  final Random _random = Random(42);
  late List<_Bubble> _bubbles;

  // Page slide-in animation
  late AnimationController _pageAnimController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  // Scale pulse on icon
  late AnimationController _iconPulseController;
  late Animation<double> _iconPulseAnim;

  @override
  void initState() {
    super.initState();
    _initBubbles();
    _initPageAnim();
    _initIconPulse();
  }

  void _initBubbles() {
    _bubbles = List.generate(_bubbleCount, (i) => _Bubble(
      x: _random.nextDouble(),
      y: _random.nextDouble(),
      radius: 18 + _random.nextDouble() * 60,
      speed: 0.004 + _random.nextDouble() * 0.008,
      colorIndex: i % 3,
      phase: _random.nextDouble() * 2 * pi,
    ));

    _bubbleControllers = List.generate(
      _bubbleCount,
      (i) => AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 3000 + _random.nextInt(4000)),
      )..repeat(reverse: true),
    );

    _bubbleAnimations = _bubbleControllers
        .map((c) => CurvedAnimation(parent: c, curve: Curves.easeInOut))
        .toList();
  }

  void _initPageAnim() {
    _pageAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0)
        .animate(CurvedAnimation(parent: _pageAnimController, curve: Curves.easeOut));
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.18), end: Offset.zero)
        .animate(CurvedAnimation(parent: _pageAnimController, curve: Curves.easeOut));
    _pageAnimController.forward();
  }

  void _initIconPulse() {
    _iconPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _iconPulseAnim = Tween<double>(begin: 0.93, end: 1.07).animate(
      CurvedAnimation(parent: _iconPulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (final c in _bubbleControllers) {
      c.dispose();
    }
    _pageAnimController.dispose();
    _iconPulseController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (_currentPage < onboardingPages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 520),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _finishOnboarding();
    }
  }

  void _onSkip() => _finishOnboarding();

  Future<void> _finishOnboarding() async {
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const WebAppScreen(),
        transitionDuration: const Duration(milliseconds: 700),
        transitionsBuilder: (_, animation, __, child) => FadeTransition(
          opacity: animation,
          child: child,
        ),
      ),
    );
  }

  void _onPageChanged(int index) {
    setState(() => _currentPage = index);
    _pageAnimController.reset();
    _pageAnimController.forward();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Stack(
        children: [
          // Animated Bubble Background Layer
          AnimatedBuilder(
            animation: Listenable.merge(_bubbleControllers),
            builder: (context, _) {
              return CustomPaint(
                painter: BubblePainter(
                  bubbles: _bubbles,
                  animations: _bubbleAnimations,
                  pageIndex: _currentPage,
                ),
                size: size,
              );
            },
          ),

          // Page Content
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: onboardingPages.length,
            itemBuilder: (context, index) {
              final page = onboardingPages[index];
              return _OnboardingPageView(
                data: page,
                fadeAnim: _fadeAnim,
                slideAnim: _slideAnim,
                iconPulseAnim: _iconPulseAnim,
              );
            },
          ),

          // Bottom Controls
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _BottomControls(
              currentPage: _currentPage,
              totalPages: onboardingPages.length,
              onNext: _onNext,
              onSkip: _onSkip,
              currentPageData: onboardingPages[_currentPage],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Bubble data model ─────────────────────────────────────────────────────
class _Bubble {
  final double x, y, radius, speed, phase;
  final int colorIndex;
  const _Bubble({
    required this.x,
    required this.y,
    required this.radius,
    required this.speed,
    required this.colorIndex,
    required this.phase,
  });
}

// ─── Single Page Content ───────────────────────────────────────────────────
class _OnboardingPageView extends StatelessWidget {
  final OnboardingPageData data;
  final Animation<double> fadeAnim;
  final Animation<Offset> slideAnim;
  final Animation<double> iconPulseAnim;

  const _OnboardingPageView({
    required this.data,
    required this.fadeAnim,
    required this.slideAnim,
    required this.iconPulseAnim,
  });

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: fadeAnim,
      child: SlideTransition(
        position: slideAnim,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 80),

              // Icon with glowing pulsing container
              ScaleTransition(
                scale: iconPulseAnim,
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        data.accentColor.withOpacity(0.35),
                        data.accentColor.withOpacity(0.08),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.6, 1.0],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: data.accentColor.withOpacity(0.4),
                        blurRadius: 60,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Container(
                    margin: const EdgeInsets.all(30),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          data.accentColor.withOpacity(0.9),
                          data.secondaryColor.withOpacity(0.8),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: data.accentColor.withOpacity(0.5),
                          blurRadius: 24,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Icon(
                      data.icon,
                      size: 56,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 52),

              // Gradient Title
              ShaderMask(
                shaderCallback: (bounds) => LinearGradient(
                  colors: [
                    Colors.white,
                    data.accentColor,
                    data.secondaryColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(bounds),
                child: Text(
                  data.title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5,
                    height: 1.15,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Subtitle
              Text(
                data.subtitle,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.6),
                  height: 1.6,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 0.2,
                ),
              ),

              const SizedBox(height: 36),

              // Feature chips
              Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: data.features
                    .map((f) => _FeatureChip(label: f, color: data.accentColor))
                    .toList(),
              ),

              const SizedBox(height: 140),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Feature Chip ──────────────────────────────────────────────────────────
class _FeatureChip extends StatelessWidget {
  final String label;
  final Color color;
  const _FeatureChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: color.withOpacity(0.4), width: 1),
        color: color.withOpacity(0.08),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color.withOpacity(0.9),
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

// ─── Bottom Controls ───────────────────────────────────────────────────────
class _BottomControls extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final VoidCallback onNext;
  final VoidCallback onSkip;
  final OnboardingPageData currentPageData;

  const _BottomControls({
    required this.currentPage,
    required this.totalPages,
    required this.onNext,
    required this.onSkip,
    required this.currentPageData,
  });

  @override
  Widget build(BuildContext context) {
    final isLast = currentPage == totalPages - 1;

    return Container(
      padding: const EdgeInsets.fromLTRB(28, 20, 28, 44),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF0A0A0F).withOpacity(0.0),
            const Color(0xFF0A0A0F).withOpacity(0.85),
            const Color(0xFF0A0A0F),
          ],
          stops: const [0.0, 0.3, 1.0],
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Dot indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              totalPages,
              (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 350),
                curve: Curves.easeInOutCubic,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: i == currentPage ? 28 : 8,
                height: 8,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  gradient: i == currentPage
                      ? LinearGradient(
                          colors: [
                            currentPageData.accentColor,
                            currentPageData.secondaryColor,
                          ],
                        )
                      : null,
                  color: i == currentPage
                      ? null
                      : Colors.white.withOpacity(0.2),
                ),
              ),
            ),
          ),

          const SizedBox(height: 28),

          // Main CTA button
          GestureDetector(
            onTap: onNext,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 350),
              width: double.infinity,
              height: 58,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    currentPageData.accentColor,
                    currentPageData.secondaryColor,
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: currentPageData.accentColor.withOpacity(0.45),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  isLast ? 'Get Started 🚀' : 'Continue',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 14),

          // Skip button
          if (!isLast)
            TextButton(
              onPressed: onSkip,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              ),
              child: Text(
                'Skip',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.4),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
