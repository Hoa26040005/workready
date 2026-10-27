import React from 'react';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { tasks, toggleTask, videos, quizzes } = useData();

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">MONITOR YOUR JOURNEY & MILESTONES</span>
          <h2 className="section-title">Your Dashboard</h2>
          <p className="section-desc">
            Track your completion rate, practice streak, and assessment scores across all learning modules in real time.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Stat Card 1 */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                </svg>
              </div>
              <span className="stat-label">Available Video Lessons</span>
            </div>
            <div className="stat-number">{videos.length} videos</div>
            <p className="stat-sub">Curated by hiring managers</p>
          </div>

          {/* Stat Card 2: Interactive Tasks from Admin */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <span className="stat-label">Assigned Tasks ({completedCount}/{tasks.length})</span>
            </div>
            <ul className="stat-list interactive-tasks">
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'task-done' : ''}>
                  <label className="dashboard-task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="task-item-name">{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Stat Card 3 */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <span className="stat-label">Completed Activities</span>
            </div>
            <div className="stat-number">{completedCount} tasks completed</div>
            <p className="stat-sub">Keep your daily practice streak alive</p>
          </div>

          {/* Stat Card 4 */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10"></path>
                  <path d="M12 20V4"></path>
                  <path d="M6 20v-6"></path>
                </svg>
              </div>
              <span className="stat-label">Quiz Pool Size</span>
            </div>
            <div className="stat-number">{quizzes.length} drills</div>
            <p className="stat-sub">Updated by course administrator</p>
          </div>

          {/* Stat Card 5: Full Width Progress */}
          <div className="stat-card stat-card-wide">
            <div className="progress-info-row">
              <div className="progress-header-left">
                <div className="stat-icon-box inline-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <div>
                  <span className="stat-label block">Overall Completion Progress</span>
                  <span className="progress-caption">
                    {progressPercent >= 100
                      ? '🎉 Amazing! You have completed all assigned learning milestones!'
                      : `You have completed ${completedCount} of ${tasks.length} tasks (${progressPercent}%)`}
                  </span>
                </div>
              </div>
              <span className="progress-percent">{progressPercent}%</span>
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
