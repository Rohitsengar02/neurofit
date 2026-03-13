import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'onboarding_page_data.dart';
import '../home/web_app_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  late List<VideoPlayerController> _videoControllers;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _videoControllers = [
      VideoPlayerController.asset('assets/videos/screen1.mp4'),
      VideoPlayerController.asset('assets/videos/screen2.mp4'),
      VideoPlayerController.asset('assets/videos/screen3.mp4'),
    ];

    for (var controller in _videoControllers) {
      controller.initialize().then((_) {
        controller.setLooping(true);
        controller.setVolume(0);
        if (_videoControllers.indexOf(controller) == 0) {
          controller.play();
        }
        setState(() {});
      });
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (var controller in _videoControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onPageChanged(int index) {
    _videoControllers[_currentPage].pause();
    setState(() {
      _currentPage = index;
    });
    _videoControllers[_currentPage].play();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Video Background
          if (_videoControllers[_currentPage].value.isInitialized)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _videoControllers[_currentPage].value.size.width,
                  height: _videoControllers[_currentPage].value.size.height,
                  child: VideoPlayer(_videoControllers[_currentPage]),
                ),
              ),
            ),
          
          // Gradient Overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.5),
                  Colors.black.withOpacity(0.9),
                ],
                stops: const [0.0, 0.4, 0.8],
              ),
            ),
          ),

          // Content
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: onboardingPages.length,
            itemBuilder: (context, index) {
              final page = onboardingPages[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      page.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1.5,
                        height: 1.0,
                      ),
                    ).animate().fadeIn(duration: 600.ms).slideX(begin: -0.2),
                    const SizedBox(height: 20),
                    Text(
                      page.subtitle,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 18,
                        fontWeight: FontWeight.w400,
                        height: 1.5,
                      ),
                    ).animate(delay: 200.ms).fadeIn(duration: 600.ms).slideX(begin: -0.2),
                    const SizedBox(height: 40),
                    // Feature chips
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: page.features.map((feature) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: page.accentColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: page.accentColor.withOpacity(0.5)),
                          ),
                          child: Text(
                            feature,
                            style: TextStyle(
                              color: page.accentColor,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ).animate(delay: 400.ms).scale();
                      }).toList(),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              );
            },
          ),

          // Bottom Controls
          Positioned(
            bottom: 40,
            left: 40,
            right: 40,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const WebAppScreen()),
                    );
                  },
                  child: Text(
                    'SKIP',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SmoothPageIndicator(
                  controller: _pageController,
                  count: onboardingPages.length,
                  effect: ExpandingDotsEffect(
                    activeDotColor: onboardingPages[_currentPage].accentColor,
                    dotColor: Colors.white.withOpacity(0.2),
                    dotHeight: 8,
                    dotWidth: 8,
                    expansionFactor: 4,
                    spacing: 8,
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    if (_currentPage < onboardingPages.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const WebAppScreen()),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                    decoration: BoxDecoration(
                      color: onboardingPages[_currentPage].accentColor,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: onboardingPages[_currentPage].accentColor.withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _currentPage == onboardingPages.length - 1 ? 'GO' : 'NEXT',
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_ios, color: Colors.black, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
