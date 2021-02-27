import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

import { LevelUpModal } from '../components/LevelUpModal';

import challenges from '../../challenges.json';
import styles from '../styles/components/LevelUpModal.module.css'
import { ConfigModal } from '../components/ConfigModal';

interface Challenge {
  type: 'body' | 'eye';
  description: string;
  amount: number;
}

interface ChallengesContextData {
  level: number;
  user: string;
  currentExperience: number;
  experienceToNextLevel: number;
  challengesCompleted: number;
  activeChallenge: Challenge;
  navBarIconOn: string;
  levelUp: () => void;
  setUser: (user: string) => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;
  setIsConfigUpModalOpen: (modal: boolean) => void;
  resetProgress: () => void;
  setNavBarIconOn: (icon: string) => void;
}

interface ChallengesProviderProps {
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...rest }: ChallengesProviderProps) {
  const [user, setUser] = useState('');
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
  const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null);

  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [isConfigUpModalOpen, setIsConfigUpModalOpen] = useState(false);

  const [navBarIconOn, setNavBarIconOn] = useState('home');

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

  useEffect(() => {
    Notification.requestPermission();

    setUser(Cookies.get('user'));
  }, []);

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));
  }, [level, currentExperience, challengesCompleted]);

  function levelUp() {
    setLevel(level + 1);
    setIsLevelUpModalOpen(true);
  }

  function closeLevelUpModal() {
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio('/notification.mp3').play();

    if (Notification.permission === 'granted') {
      new Notification('Novo desafio 🎊', {
        body: `Valendo ${challenge.amount} XP!`
      })
    }
  }

  function resetChallenge() {
    setActiveChallenge(null);
  }

  function resetProgress() {
    setLevel(1);
    setCurrentExperience(0);
    setChallengesCompleted(0);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return;
    }

    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel;
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setChallengesCompleted(challengesCompleted + 1);

    setActiveChallenge(null);
  }

  return (
    <ChallengesContext.Provider value={{
      level,
      user,
      currentExperience,
      experienceToNextLevel,
      challengesCompleted,
      activeChallenge,
      navBarIconOn,
      levelUp,
      setUser,
      startNewChallenge,
      resetChallenge,
      completeChallenge,
      closeLevelUpModal,
      setIsConfigUpModalOpen,
      resetProgress,
      setNavBarIconOn,
    }}>
      { isLevelUpModalOpen ? 
        (
          <div className={styles.blurOverlay}>{children}</div>
        ) :
        children
      }

      { isConfigUpModalOpen && <ConfigModal /> }

      { isLevelUpModalOpen && <LevelUpModal /> }
    </ChallengesContext.Provider>
  );
}