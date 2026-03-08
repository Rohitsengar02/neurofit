import 'package:flutter/material.dart';

class OnboardingPageData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accentColor;
  final Color secondaryColor;
  final List<String> features;

  const OnboardingPageData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    required this.secondaryColor,
    required this.features,
  });
}

const List<OnboardingPageData> onboardingPages = [
  OnboardingPageData(
    title: 'Train Smarter\nWith AI Power',
    subtitle:
        'Your personal AI fitness coach that adapts to your goals, body type, and schedule — delivering elite-level coaching to your pocket.',
    icon: Icons.psychology_rounded,
    accentColor: Color(0xFF7C3AED),
    secondaryColor: Color(0xFF06B6D4),
    features: ['AI Workout Plans', 'Real-Time Feedback', 'Progress Tracking'],
  ),
  OnboardingPageData(
    title: 'Fuel Your Body\nRight',
    subtitle:
        'Precision nutrition planning powered by AI. Get macro-optimized meal plans, track calories effortlessly, and hit your physique goals faster.',
    icon: Icons.local_fire_department_rounded,
    accentColor: Color(0xFFFF6B35),
    secondaryColor: Color(0xFFFF2D55),
    features: ['Smart Meal Plans', 'Macro Tracking', 'Water & Hydration'],
  ),
  OnboardingPageData(
    title: 'Compete &\nConnect',
    subtitle:
        'Join a global community of fitness warriors. Take on live challenges, climb leaderboards, and celebrate every milestone with your tribe.',
    icon: Icons.emoji_events_rounded,
    accentColor: Color(0xFF10B981),
    secondaryColor: Color(0xFF06B6D4),
    features: ['Live Challenges', 'Global Leaderboard', 'Community Feed'],
  ),
];
