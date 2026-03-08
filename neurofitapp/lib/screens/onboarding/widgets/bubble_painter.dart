import 'dart:math';
import 'package:flutter/material.dart';

// Data for each bubble's position/size (set once randomly, then animated)
class BubbleModel {
  final double x;
  final double y;
  final double radius;
  final int colorIndex;
  final double phase;

  const BubbleModel({
    required this.x,
    required this.y,
    required this.radius,
    required this.colorIndex,
    required this.phase,
  });
}

class BubblePainter extends CustomPainter {
  final List<dynamic> bubbles;
  final List<Animation<double>> animations;
  final int pageIndex;

  // Per-page color palettes (accent, secondary, glow)
  static const List<List<Color>> _palettes = [
    [Color(0xFF7C3AED), Color(0xFF06B6D4), Color(0xFF4F1D96)],
    [Color(0xFFFF6B35), Color(0xFFFF2D55), Color(0xFF9B1C1C)],
    [Color(0xFF10B981), Color(0xFF06B6D4), Color(0xFF064E3B)],
  ];

  const BubblePainter({
    required this.bubbles,
    required this.animations,
    required this.pageIndex,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final palette = _palettes[pageIndex % _palettes.length];

    // Draw background gradient
    final bgPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          const Color(0xFF0A0A0F),
          palette[2].withOpacity(0.25),
          const Color(0xFF0A0A0F),
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Draw scattered orbs/blobs in background
    _drawOrbs(canvas, size, palette);

    // Draw animated bubbles
    for (int i = 0; i < bubbles.length; i++) {
      final b = bubbles[i];
      final t = animations[i].value;
      final dx = sin(b.phase + t * pi) * 0.04 * size.width;
      final dy = cos(b.phase * 1.3 + t * pi) * 0.06 * size.height;
      final cx = b.x * size.width + dx;
      final cy = b.y * size.height + dy;
      final opacity = 0.06 + t * 0.12;

      final color = palette[b.colorIndex % palette.length];

      // Outer glow
      final glowPaint = Paint()
        ..color = color.withOpacity(opacity * 0.5)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 28);
      canvas.drawCircle(Offset(cx, cy), b.radius * 1.6, glowPaint);

      // Bubble stroke
      final strokePaint = Paint()
        ..color = color.withOpacity(opacity + 0.05)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2;
      canvas.drawCircle(Offset(cx, cy), b.radius, strokePaint);

      // Inner translucent fill
      final fillPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            color.withOpacity(opacity * 0.5),
            color.withOpacity(0.0),
          ],
        ).createShader(
          Rect.fromCircle(center: Offset(cx, cy), radius: b.radius),
        );
      canvas.drawCircle(Offset(cx, cy), b.radius, fillPaint);

      // Small specular highlight
      final highlightPaint = Paint()
        ..color = Colors.white.withOpacity(opacity * 0.5)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(
        Offset(cx - b.radius * 0.26, cy - b.radius * 0.26),
        b.radius * 0.14,
        highlightPaint,
      );
    }
  }

  void _drawOrbs(Canvas canvas, Size size, List<Color> palette) {
    final orbPaint = Paint()..maskFilter = const MaskFilter.blur(BlurStyle.normal, 80);

    // Top-left orb
    orbPaint.shader = RadialGradient(
      colors: [palette[0].withOpacity(0.3), Colors.transparent],
    ).createShader(Rect.fromCircle(
        center: Offset(size.width * 0.1, size.height * 0.12), radius: 200));
    canvas.drawCircle(
        Offset(size.width * 0.1, size.height * 0.12), 200, orbPaint);

    // Bottom-right orb
    orbPaint.shader = RadialGradient(
      colors: [palette[1].withOpacity(0.25), Colors.transparent],
    ).createShader(Rect.fromCircle(
        center: Offset(size.width * 0.9, size.height * 0.82), radius: 180));
    canvas.drawCircle(
        Offset(size.width * 0.9, size.height * 0.82), 180, orbPaint);

    // Mid  orb
    orbPaint.shader = RadialGradient(
      colors: [palette[2].withOpacity(0.18), Colors.transparent],
    ).createShader(Rect.fromCircle(
        center: Offset(size.width * 0.5, size.height * 0.45), radius: 140));
    canvas.drawCircle(
        Offset(size.width * 0.5, size.height * 0.45), 140, orbPaint);
  }

  @override
  bool shouldRepaint(BubblePainter oldDelegate) =>
      oldDelegate.pageIndex != pageIndex ||
      oldDelegate.animations != animations;
}
