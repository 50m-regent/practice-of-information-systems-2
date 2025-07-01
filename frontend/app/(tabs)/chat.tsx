import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, Target, TrendingUp, Calendar, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
import { ChatMessage } from '@/types';
import { currentUser, mockGoals, mockLifeLogEntries, mockStatsData } from '@/data/mockData';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hello! I'm your personal health assistant. I have access to your health profile, activity history, and goals. I can help you:\n\n• Set personalized fitness goals based on your demographics\n• Analyze your progress and provide insights\n• Compare your metrics with others in your age group\n• Create workout plans and schedules\n• Adjust goals based on your progress\n\nWhat would you like to work on today?",
    isUser: false,
    timestamp: new Date().toISOString()
  }
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(userMessage.content),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    const userAge = new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();
    const userAgeGroup = `${Math.floor(userAge / 10) * 10}-${Math.floor(userAge / 10) * 10 + 9}`;
    
    // Get user's demographic data for comparisons
    const getUserDemographicData = (dataType: string) => {
      const data = mockStatsData[dataType];
      if (!data) return null;
      return data.find(d => d.ageGroup === userAgeGroup && d.gender === currentUser.gender);
    };

    // Goal setting responses
    if (lowerInput.includes('goal') || lowerInput.includes('target') || lowerInput.includes('set')) {
      const stepsData = getUserDemographicData('steps');
      const avgSteps = stepsData?.averageValue || 7000;
      
      return `I'd love to help you set personalized goals! Based on your profile (${currentUser.gender}, age ${userAge}), here are some recommendations:\n\n📊 **Demographic Insights:**\n• Average steps for your group: ${avgSteps.toLocaleString()} steps/day\n• Your current average: ${mockLifeLogEntries.find(e => e.type === 'steps')?.value.toLocaleString() || '8,500'} steps\n\n🎯 **Suggested Goals:**\n• **Beginner:** ${Math.round(avgSteps * 0.8).toLocaleString()} steps/day\n• **Moderate:** ${Math.round(avgSteps * 1.1).toLocaleString()} steps/day\n• **Ambitious:** ${Math.round(avgSteps * 1.3).toLocaleString()} steps/day\n\nWould you like me to help you create a specific goal? Just say something like "I want to walk 10,000 steps daily" and I'll set it up for you!`;
    }

    // Comparison requests
    if (lowerInput.includes('compare') || lowerInput.includes('others') || lowerInput.includes('average')) {
      const stepsData = getUserDemographicData('steps');
      const weightData = getUserDemographicData('weight');
      const heartRateData = getUserDemographicData('heart_rate');
      
      let comparison = `📈 **Your Performance vs. Your Demographic (${currentUser.gender}, ${userAgeGroup}):**\n\n`;
      
      if (stepsData) {
        const userSteps = mockLifeLogEntries.find(e => e.type === 'steps')?.value || 8500;
        const percentile = userSteps > stepsData.averageValue ? 
          Math.min(95, 50 + ((userSteps - stepsData.averageValue) / stepsData.averageValue) * 30) :
          Math.max(5, 50 - ((stepsData.averageValue - userSteps) / stepsData.averageValue) * 30);
        
        comparison += `🚶 **Steps:** ${userSteps.toLocaleString()} vs ${stepsData.averageValue.toLocaleString()} avg (${Math.round(percentile)}th percentile)\n`;
      }
      
      if (weightData) {
        const percentile = currentUser.weight < weightData.averageValue ? 65 : 45;
        comparison += `⚖️ **Weight:** ${currentUser.weight}kg vs ${weightData.averageValue}kg avg (${percentile}th percentile)\n`;
      }
      
      if (heartRateData) {
        const userHR = mockLifeLogEntries.find(e => e.type === 'heart_rate')?.value || 72;
        const percentile = userHR < heartRateData.averageValue ? 70 : 40;
        comparison += `❤️ **Heart Rate:** ${userHR} bpm vs ${heartRateData.averageValue} bpm avg (${percentile}th percentile)\n`;
      }
      
      comparison += `\n💡 **Insight:** You're performing well in most areas! Want to see detailed charts? Check out the Statistics tab for visual comparisons.`;
      
      return comparison;
    }

    // Progress analysis
    if (lowerInput.includes('progress') || lowerInput.includes('how am i doing') || lowerInput.includes('analysis')) {
      const currentGoals = mockGoals;
      let analysis = `📊 **Your Progress Analysis:**\n\n`;
      
      currentGoals.forEach(goal => {
        const progress = (goal.currentValue / goal.targetValue) * 100;
        const status = progress >= 100 ? '✅ Completed!' : 
                     progress >= 75 ? '🔥 Almost there!' :
                     progress >= 50 ? '💪 Good progress' : '📈 Getting started';
        
        analysis += `🎯 **${goal.title}:** ${Math.round(progress)}% ${status}\n`;
        analysis += `   Current: ${goal.currentValue.toLocaleString()} / Target: ${goal.targetValue.toLocaleString()} ${goal.unit}\n\n`;
      });
      
      const avgProgress = currentGoals.reduce((acc, g) => acc + (g.currentValue / g.targetValue), 0) / currentGoals.length * 100;
      
      analysis += `📈 **Overall Progress:** ${Math.round(avgProgress)}%\n\n`;
      
      if (avgProgress < 50) {
        analysis += `💡 **Recommendation:** Consider adjusting your goals to be more achievable, or let's create a structured plan to help you succeed!`;
      } else if (avgProgress > 80) {
        analysis += `🎉 **Great job!** You're crushing your goals! Ready to set more ambitious targets?`;
      } else {
        analysis += `👍 **You're on track!** Keep up the consistent effort and you'll reach your goals soon.`;
      }
      
      return analysis;
    }

    // Workout and exercise planning
    if (lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerInput.includes('plan') || lowerInput.includes('schedule')) {
      return `🏋️ **Personalized Workout Recommendations:**\n\nBased on your profile and current activity level, here's what I suggest:\n\n**🗓️ Weekly Plan:**\n• **Monday:** 30-min brisk walk (aim for 4,000+ steps)\n• **Tuesday:** Strength training (bodyweight exercises)\n• **Wednesday:** Active recovery (light stretching)\n• **Thursday:** 45-min walk or bike ride\n• **Friday:** Strength training\n• **Weekend:** Fun activities (hiking, sports, dancing)\n\n**📈 Progressive Goals:**\n• Week 1-2: Focus on consistency\n• Week 3-4: Increase duration by 10%\n• Week 5+: Add intensity or new activities\n\n**💡 Tips for Success:**\n• Start with 3-4 days per week\n• Track your activities in the Life Log\n• Celebrate small wins!\n\nWould you like me to help you set up specific goals for any of these activities?`;
    }

    // Motivation and encouragement
    if (lowerInput.includes('motivat') || lowerInput.includes('encourage') || lowerInput.includes('struggling') || lowerInput.includes('hard')) {
      const completedGoals = mockGoals.filter(g => g.currentValue >= g.targetValue).length;
      const totalGoals = mockGoals.length;
      
      return `🌟 **You've got this!** Here's why you should feel proud:\n\n**🏆 Your Achievements:**\n• ${completedGoals} out of ${totalGoals} goals completed\n• Consistently tracking your health data\n• Taking proactive steps toward better health\n\n**💪 Remember:**\n• Progress isn't always linear - small steps count!\n• You're already ahead of many people just by tracking\n• Every healthy choice is an investment in your future\n\n**🎯 Focus on Today:**\nWhat's ONE small thing you can do right now? Maybe:\n• Take a 5-minute walk\n• Log your current weight\n• Set a simple goal for tomorrow\n\nYou're building habits that will serve you for life. I'm here to support you every step of the way! 💙`;
    }

    // Specific metric questions
    if (lowerInput.includes('steps') || lowerInput.includes('walk')) {
      const userSteps = mockLifeLogEntries.find(e => e.type === 'steps')?.value || 8500;
      const stepsData = getUserDemographicData('steps');
      const avgSteps = stepsData?.averageValue || 7000;
      
      return `🚶 **Your Step Analysis:**\n\nCurrent: ${userSteps.toLocaleString()} steps today\nYour demographic average: ${avgSteps.toLocaleString()} steps\n\n${userSteps > avgSteps ? '🎉 You\'re above average! Great job!' : '📈 Room for improvement - you can do it!'}\n\n**💡 Quick Tips to Increase Steps:**\n• Take stairs instead of elevators\n• Park further away from destinations\n• Walk during phone calls\n• Set hourly reminders to move\n• Take a 10-minute walk after meals\n\n**🎯 Goal Suggestion:**\nTry increasing by 500 steps per week until you reach ${Math.round(avgSteps * 1.2).toLocaleString()} steps daily. Would you like me to create this goal for you?`;
    }

    if (lowerInput.includes('weight') || lowerInput.includes('diet')) {
      const weightData = getUserDemographicData('weight');
      const avgWeight = weightData?.averageValue || 70;
      
      return `⚖️ **Weight Management Insights:**\n\nYour current weight: ${currentUser.weight}kg\nAverage for your demographic: ${avgWeight}kg\n\n**🥗 Healthy Weight Management Tips:**\n• Focus on sustainable habits, not quick fixes\n• Aim for 0.5-1kg loss per week if losing weight\n• Track your food intake and exercise\n• Stay hydrated (8+ glasses of water daily)\n• Get adequate sleep (7-9 hours)\n\n**📊 Recommendation:**\nConsider logging your weight weekly rather than daily to see meaningful trends. Would you like help setting a realistic weight goal based on your profile?\n\n*Note: Always consult with healthcare professionals for personalized medical advice.*`;
    }

    if (lowerInput.includes('heart rate') || lowerInput.includes('cardio')) {
      const userHR = mockLifeLogEntries.find(e => e.type === 'heart_rate')?.value || 72;
      const hrData = getUserDemographicData('heart_rate');
      const avgHR = hrData?.averageValue || 70;
      
      return `❤️ **Heart Rate Analysis:**\n\nYour resting HR: ${userHR} bpm\nAverage for your demographic: ${avgHR} bpm\n\n${userHR < avgHR ? '✅ Excellent! Lower resting heart rate often indicates good cardiovascular fitness.' : '📈 There\'s room for improvement through regular cardio exercise.'}\n\n**💓 Heart Health Tips:**\n• Regular cardio exercise (150+ min/week)\n• Manage stress through meditation or yoga\n• Limit caffeine and alcohol\n• Maintain healthy weight\n• Get quality sleep\n\n**🎯 Cardio Goal Ideas:**\n• 30 minutes of brisk walking 5x/week\n• Swimming or cycling 3x/week\n• Dance or aerobics classes\n\nWant me to help create a cardio-focused goal?`;
    }

    // Questionnaire and profile setup
    if (lowerInput.includes('questionnaire') || lowerInput.includes('profile') || lowerInput.includes('setup') || lowerInput.includes('assessment')) {
      return `📋 **Health Assessment Questionnaire:**\n\nI'd love to learn more about you to provide better recommendations! Let's go through some key questions:\n\n**🏃 Activity Level:**\n• How many days per week do you currently exercise?\n• What types of activities do you enjoy?\n• Any physical limitations I should know about?\n\n**🎯 Goals & Motivation:**\n• What's your primary health goal? (weight loss, fitness, strength, etc.)\n• What motivates you most?\n• How much time can you dedicate to health activities daily?\n\n**📅 Lifestyle:**\n• What's your typical daily schedule like?\n• Do you prefer morning or evening workouts?\n• Any specific challenges you face?\n\nJust answer these naturally in conversation, and I'll use this info to create a personalized plan for you! What would you like to start with?`;
    }

    // Navigation helpers
    if (lowerInput.includes('create goal') || lowerInput.includes('add goal') || lowerInput.includes('new goal')) {
      // This would typically trigger navigation, but we'll provide guidance
      return `🎯 **Ready to Create a New Goal?**\n\nI can help you set up the perfect goal! Here's how:\n\n**Option 1: Tell me what you want**\nJust say something like:\n• "I want to walk 10,000 steps daily"\n• "Help me lose 2kg in 2 months"\n• "I want to exercise 4 times per week"\n\n**Option 2: Use the Add Goal feature**\nTap the "Add Goal" button on your home screen for a guided setup.\n\n**💡 Goal-Setting Tips:**\n• Make it specific and measurable\n• Set realistic timeframes\n• Start with smaller, achievable targets\n• Build on your current habits\n\nWhat kind of goal would you like to work on?`;
    }

    // Default helpful response
    return `I'm here to help with your health and fitness journey! I can assist you with:\n\n🎯 **Goal Setting:** Create personalized targets based on your demographics\n📊 **Progress Analysis:** Review how you're doing with current goals\n📈 **Comparisons:** See how you stack up against others your age\n💪 **Workout Plans:** Get exercise recommendations\n🏃 **Activity Tips:** Practical advice for daily health habits\n📋 **Health Assessment:** Personalized questionnaire and recommendations\n\n**Quick Examples:**\n• "How am I doing with my goals?"\n• "Compare my steps to others my age"\n• "Help me create a workout plan"\n• "I want to set a new fitness goal"\n• "Give me motivation to keep going"\n\nWhat would you like to explore? I have access to your health profile and can provide personalized insights!`;
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContent}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("How am I doing with my goals?")}
        >
          <Target size={16} color="#3B82F6" />
          <Text style={styles.quickActionText}>Check Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("Compare my activity to others my age")}
        >
          <TrendingUp size={16} color="#10B981" />
          <Text style={styles.quickActionText}>Compare Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("Help me create a workout plan")}
        >
          <Activity size={16} color="#F59E0B" />
          <Text style={styles.quickActionText}>Workout Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("I want to set a new fitness goal")}
        >
          <Calendar size={16} color="#8B5CF6" />
          <Text style={styles.quickActionText}>New Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Bot size={24} color="#3B82F6" />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Health Assistant</Text>
          <Text style={styles.subtitle}>Personalized guidance for {currentUser.name}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderQuickActions()}
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}
            >
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <User size={16} color="#3B82F6" />
                ) : (
                  <Bot size={16} color="#10B981" />
                )}
                <Text style={styles.messageSender}>
                  {message.isUser ? 'You' : 'AI Assistant'}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <Bot size={16} color="#10B981" />
                <Text style={styles.messageSender}>AI Assistant</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your health goals, progress, or get personalized advice..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isTyping}
          >
            <Send size={20} color={inputText.trim() === '' ? '#9CA3AF' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2
  },
  chatContainer: {
    flex: 1
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 12
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  quickActionText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151'
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 32
  },
  messageContainer: {
    marginBottom: 20
  },
  userMessage: {
    alignItems: 'flex-end'
  },
  aiMessage: {
    alignItems: 'flex-start'
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  messageSender: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280'
  },
  messageTime: {
    marginLeft: 8,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF'
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  userBubble: {
    backgroundColor: '#3B82F6'
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22
  },
  userMessageText: {
    color: '#FFFFFF'
  },
  aiMessageText: {
    color: '#111827'
  },
  typingBubble: {
    paddingVertical: 16
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF'
  },
  typingDot1: {
    // Animation would be added here in a real implementation
  },
  typingDot2: {
    // Animation would be added here in a real implementation
  },
  typingDot3: {
    // Animation would be added here in a real implementation
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    color: '#111827'
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB'
  }
});