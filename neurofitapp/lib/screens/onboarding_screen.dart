import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'web_view_screen.dart';
import '../widgets/background_video.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  bool isLastPage = false;

  final List<OnboardingData> _pages = [
    OnboardingData(
      title: "PUSH YOUR LIMITS",
      description:
          "Experience world-class workouts designed to transform your physique and strength.",
      videoAsset: "assets/videos/screen1.mp4",
      accentColor: const Color(0xFFDFFF00), // Neon Green
    ),
    OnboardingData(
      title: "MIND OVER MATTER",
      description:
          "Master your mental state with guided meditation and cognitive fitness exercises.",
      videoAsset: "assets/videos/screen2.mp4",
      accentColor: const Color(0xFFDFFF00), // Neon Green
    ),
    OnboardingData(
      title: "FUEL YOUR GAINS",
      description:
          "Personalized nutrition plans that align with your fitness goals and lifestyle.",
      videoAsset: "assets/videos/screen3.mp4",
      accentColor: const Color(0xFFDFFF00), // Neon Green
    ),
  ];

  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            physics: const BouncingScrollPhysics(),
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
                isLastPage = index == _pages.length - 1;
              });
            },
            itemCount: _pages.length,
            itemBuilder: (context, index) {
              return OnboardingPage(data: _pages[index]);
            },
          ),

          // Navigation Controls at Absolute Bottom
          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: SafeArea(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // BACK / SKIP
                  Expanded(
                    flex: 1,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: _currentPage > 0
                          ? TextButton(
                              onPressed: () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 500),
                                  curve: Curves.easeInOut,
                                );
                              },
                              child: Text(
                                "BACK",
                                style: GoogleFonts.outfit(
                                  color: Colors.white38,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            )
                          : TextButton(
                              onPressed: () =>
                                  _pageController.jumpToPage(_pages.length - 1),
                              child: Text(
                                "SKIP",
                                style: GoogleFonts.outfit(
                                  color: Colors.white38,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                    ),
                  ),

                  // DOTS
                  Center(
                    child: SmoothPageIndicator(
                      controller: _pageController,
                      count: _pages.length,
                      effect: ExpandingDotsEffect(
                        activeDotColor: _pages[_currentPage].accentColor,
                        dotColor: Colors.white24,
                        dotHeight: 6,
                        dotWidth: 6,
                        expansionFactor: 4,
                      ),
                    ),
                  ),

                  // NEXT / FINISH
                  Expanded(
                    flex: 1,
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: () async {
                          if (isLastPage) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const WebViewScreen(
                                  url: 'https://neurofitness.vercel.app/',
                                ),
                              ),
                            );
                          } else {
                            _pageController.nextPage(
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.easeInOut,
                            );
                          }
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: _pages[_currentPage].accentColor,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: _pages[_currentPage].accentColor
                                    .withOpacity(0.3),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                isLastPage ? "FINISH" : "NEXT",
                                style: GoogleFonts.outfit(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(
                                Icons.arrow_forward_ios,
                                size: 12,
                                color: Colors.black,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class OnboardingData {
  final String title;
  final String description;
  final String videoAsset;
  final Color accentColor;

  OnboardingData({
    required this.title,
    required this.description,
    required this.videoAsset,
    required this.accentColor,
  });
}

class OnboardingPage extends StatelessWidget {
  final OnboardingData data;

  const OnboardingPage({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    // Mental Health screen (Screen 2) gets a cinematic blur effect
    final bool isMentalHealth = data.title.contains("MIND");

    return Stack(
      children: [
        BackgroundVideo(assetPath: data.videoAsset),

        // Dynamic Blur Animation for Screen 2
        if (isMentalHealth)
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 2500),
            builder: (context, value, child) {
              return BackdropFilter(
                filter: ImageFilter.blur(
                  sigmaX: 10 * value,
                  sigmaY: 10 * value,
                ),
                child: Container(color: Colors.black.withOpacity(0.2 * value)),
              );
            },
          ),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40.0, vertical: 60.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title Animation: Slide from bottom + Fade
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: 1),
                duration: const Duration(milliseconds: 1400),
                curve: Curves.easeOutExpo,
                builder: (context, value, child) {
                  return Opacity(
                    opacity: value,
                    child: Transform.translate(
                      offset: Offset(0, 50 * (1 - value)),
                      child: child,
                    ),
                  );
                },
                child: Text(
                  data.title,
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 45,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                    letterSpacing: -1.5,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Description: Delayed Slide + Fade
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: 1),
                duration: const Duration(milliseconds: 1400),
                curve: const Interval(0.4, 1.0, curve: Curves.easeOutExpo),
                builder: (context, value, child) {
                  return Opacity(
                    opacity: value,
                    child: Transform.translate(
                      offset: Offset(0, 30 * (1 - value)),
                      child: child,
                    ),
                  );
                },
                child: Text(
                  data.description,
                  style: GoogleFonts.outfit(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 18,
                    fontWeight: FontWeight.w400,
                    height: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ],
    );
  }
}
