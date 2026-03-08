import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:health/health.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart';

class GoogleDataService {
  final String _apiKey = "AIzaSyAS7aImzvXskHhxuPiRBMIdnvMqwIFzZ5k";
  late GenerativeModel _model;

  GoogleDataService() {
    // Using gemini-2.5-flash as it's the stable faster model
    _model = GenerativeModel(model: 'gemini-2.5-flash', apiKey: _apiKey);
  }

  // Define the types to read
  final List<HealthDataType> _types = [
    HealthDataType.STEPS,
    HealthDataType.HEART_RATE,
    HealthDataType.SLEEP_SESSION,
    HealthDataType.EXERCISE_TIME,
  ];

  Future<void> initializeAndFetch() async {
    // 1. Request basic Android permissions first
    await Permission.activityRecognition.request();
    await Permission.sensors.request();

    // 2. Access the Health singleton (Replaces HealthFactory)
    Health health = Health();

    // 3. Request health data access
    // Note: Health v10+ uses types directly
    bool requested = await health.requestAuthorization(_types);

    if (requested) {
      // 4. Fetch data for the last 24 hours
      DateTime now = DateTime.now();
      DateTime yesterday = now.subtract(const Duration(hours: 24));

      try {
        List<HealthDataPoint> healthData = await health.getHealthDataFromTypes(
          startTime: yesterday,
          endTime: now,
          types: _types,
        );

        debugPrint(
          "Fetched ${healthData.length} data points from Google Fit/Health Connect",
        );

        // 5. Summarize with Gemini
        if (healthData.isNotEmpty) {
          await _getAISummary(healthData);
        }
      } catch (e) {
        debugPrint("Error fetching health data: $e");
      }
    } else {
      debugPrint("Health Data Authorization failed or was denied by user");
    }
  }

  Future<String?> _getAISummary(List<HealthDataPoint> data) async {
    final prompt =
        """
    Analyze this fitness data from the last 24 hours and give a short, high-energy motivation for a fitness user.
    Data: ${data.toString()}
    """;

    try {
      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);
      debugPrint("Gemini Insight: ${response.text}");
      return response.text;
    } catch (e) {
      debugPrint("Gemini Error: $e");
      return null;
    }
  }
}
