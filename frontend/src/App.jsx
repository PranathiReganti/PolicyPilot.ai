import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import RecommenderPage from './pages/RecommenderPage';
import ComparePage from './pages/ComparePage';
import EstimatorPage from './pages/EstimatorPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import { getCurrentUser, logoutUser } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [compareList, setCompareList] = useState([1, 2]); // Pre-loaded with two benchmark policies for instant compare demo
  const [chatInitialQuery, setChatInitialQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleToggleCompare = (policyId) => {
    if (compareList.includes(policyId)) {
      setCompareList(compareList.filter(id => id !== policyId));
    } else {
      if (compareList.length >= 4) {
        alert('You can compare a maximum of 4 policies at the same time.');
        return;
      }
      setCompareList([...compareList, policyId]);
    }
  };

  const handleAskAIAboutPolicy = (policy) => {
    const query = `What are the key inclusions, exclusions, and waiting periods for ${policy.policy_name} by ${policy.insurer}?`;
    setChatInitialQuery(query);
    setActiveTab('chat');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col ombre-page-bg font-sans text-slate-800">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareList={compareList}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onSelectPolicyForCompare={(id) => {
              if (!compareList.includes(id)) {
                setCompareList([...compareList.slice(0, 3), id]);
              }
              setActiveTab('compare');
            }}
            onAskAI={handleAskAIAboutPolicy}
          />
        )}

        {activeTab === 'recommender' && (
          <RecommenderPage
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onAskAI={handleAskAIAboutPolicy}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            compareList={compareList}
            onRemoveFromCompare={(id) => setCompareList(compareList.filter(item => item !== id))}
            onAddCompareId={(id) => setCompareList([...compareList, id])}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'estimator' && (
          <EstimatorPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPage
            initialQuery={chatInitialQuery}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Global Regulatory Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

    </div>
  );
}
