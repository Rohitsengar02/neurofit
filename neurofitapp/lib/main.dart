import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/home/web_app_screen.dart';

// Simple in-memory flag — onboarding always shows on fresh launch.
// Controlled by OnboardingScreen itself after completion.
bool _onboardingDone = false;

bool get onboardingDone => _onboardingDone;
void markOnboardingDone() => _onboardingDone = true;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Force full-screen dark immersive mode
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0F),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  try {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
  } catch (_) {
    // Orientation lock not supported on this platform — safe to ignore
  }

  runApp(const NeuroFitApp());
}

class NeuroFitApp extends StatelessWidget {
  const NeuroFitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NeuroFit',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A0A0F),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF7C3AED),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF12121A),
        ),
      ),
      home: const OnboardingScreen(),
    );
  }
}
