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

final List<OnboardingPageData> onboardingPages = [
  const OnboardingPageData(
    title: 'PUSH YOUR\nLIMITS',
    subtitle: 'Experience world-class workouts designed to transform your physique and strength.',
    icon: Icons.directions_bike,
    accentColor: Color(0xFFC0FF00),
    secondaryColor: Color(0xFF7C3AED),
    features: ['Elite Training', 'Power Analytics', 'Strength Focus'],
  ),
  const OnboardingPageData(
    title: 'TRACK YOUR\nPROGRESS',
    subtitle: 'Monitor your health data and activity with precision and advanced AI insights.',
    icon: Icons.analytics_outlined,
    accentColor: Color(0xFF00F0FF),
    secondaryColor: Color(0xFF3B82F6),
    features: ['Health Connect', 'Real-time Stats', 'AI Coaching'],
  ),
  const OnboardingPageData(
    title: 'REACH YOUR\nGOALS',
    subtitle: 'Join a community of high-performers and achieve the results you always wanted.',
    icon: Icons.auto_awesome,
    accentColor: Color(0xFFFF0080),
    secondaryColor: Color(0xFFEC4899),
    features: ['Community Support', 'Goal Tracking', 'Personal Success'],
  ),
];
