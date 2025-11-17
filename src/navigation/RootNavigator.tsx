// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { LocksListScreen } from '../screens/Locks/LocksListScreen';
import { LockDetailScreen } from '../screens/Locks/LockDetailScreen';
import { NewLockScreen } from '../screens/Locks/NewLockScreen';
import { LockAccessScreen } from '../screens/Locks/LockAccessScreen';
import { ShareAccessScreen } from '../screens/Locks/ShareAccessScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  LocksList: undefined;
  LockDetail: {
    id: number;
    name: string;
    localization: string;
    status: string;
  };
  NewLock: undefined;
  LockAccess: {
    doorLockId: number;
    name: string;
  };
  ShareAccess: {
    doorLockId: number;
    name: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="LocksList" component={LocksListScreen} />
          <Stack.Screen name="LockDetail" component={LockDetailScreen} />
          <Stack.Screen name="NewLock" component={NewLockScreen} />
          <Stack.Screen name="LockAccess" component={LockAccessScreen} />
          <Stack.Screen name="ShareAccess" component={ShareAccessScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
