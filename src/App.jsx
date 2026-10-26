import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhatYouCanLearn from './components/WhatYouCanLearn';
import LearningResources from './components/LearningResources';
import PracticeSection from './components/PracticeSection';
import Dashboard from './components/Dashboard';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ResourceModal from './components/ResourceModal';
import AdminPanel from './components/AdminPanel';
import './App.css';

function MainContent() {
  const [toastMessage, setToastMessage] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'video' | 'guides' | 'flashcards' | 'cases' | 'quiz' | null
  const { isAdminOpen, setIsAdminOpen } = useData();

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  return (
    <div className="app-root">
      <Navbar />
      <main>
        <Hero />
        <WhatYouCanLearn />
        <LearningResources onOpenModal={(modalId) => setActiveModal(modalId)} />
        <PracticeSection onNotify={showNotification} />
        <Dashboard />
        <AboutSection />
      </main>
      <Footer />
      <Toast message={toastMessage} />
      <ResourceModal activeModal={activeModal} onClose={() => setActiveModal(null)} />
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
