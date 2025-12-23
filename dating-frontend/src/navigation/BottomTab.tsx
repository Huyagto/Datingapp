import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import ProfileScreen from "../screens/ProfileScreen";
import ChatStack from "./ChatStack";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen"; 

const Tab = createBottomTabNavigator();

const AnimatedTabIcon = ({ focused, icon, label, badgeCount }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <View style={styles.tabContainer}>
      <Animated.View style={[
        styles.iconContainer,
        focused && styles.iconContainerFocused,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Text style={[
          styles.iconText,
          focused && styles.iconTextFocused
        ]}>
          {icon}
        </Text>
        {badgeCount > 0 && label === "Chat" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? "9+" : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>
      <Text style={[
        styles.labelText,
        focused && styles.labelTextFocused
      ]}>
        {label}
      </Text>
    </View>
  );
};

export default function BottomTab() {
  const unreadCount = 3;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="❤️"
              label="Khám phá"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="💬"
              label="Chat"
              badgeCount={unreadCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="👤"
              label="Tôi"
            />
          ),
        }}
      />
      {/* 🔥 THÊM TAB SETTINGS THỨ 4 */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="⚙️"
              label="Cài đặt"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f0f1e',
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  iconContainerFocused: {
    backgroundColor: '#FF4081',
  },
  iconText: {
    fontSize: 22,
    color: '#FFF',
  },
  iconTextFocused: {
    color: '#FFF',
  },
  labelText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  labelTextFocused: {
    color: '#FF4081',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF4081',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0f0f1e',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});