import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface StudentContextType {
  studentId: string | null;
  setStudentId: (id: string | null) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentId, setStudentIdState] = useState<string | null>(() => {
    // Initialize from localStorage - STUDENT-ONLY (ignore admin tokens completely)
    if (typeof window !== 'undefined') {
      const studentToken = localStorage.getItem('student_token');
      const storedStudentId = localStorage.getItem('studentId');
      
      // ONLY use student token and student ID - never use admin tokens
      if (studentToken && storedStudentId && !storedStudentId.startsWith('admin_')) {
        return storedStudentId;
      }
      return null;
    }
    return null;
  });

  // Sync with localStorage on mount - STUDENT-ONLY
  useEffect(() => {
    const syncWithStorage = () => {
      if (typeof window !== 'undefined') {
        const studentToken = localStorage.getItem('student_token');
        const storedStudentId = localStorage.getItem('studentId');
        
        // ONLY sync student tokens - completely ignore admin tokens
        if (studentToken && storedStudentId && !storedStudentId.startsWith('admin_')) {
          // Only update if it's different and it's a student ID
          if (storedStudentId !== studentId) {
            setStudentIdState(storedStudentId);
          }
        } else if (!studentToken && studentId) {
          // Student token removed, clear state
          setStudentIdState(null);
        }
      }
    };

    syncWithStorage();
    
    // Listen for storage changes (e.g., from another tab)
    window.addEventListener('storage', syncWithStorage);
    return () => window.removeEventListener('storage', syncWithStorage);
  }, [studentId]);

  const setStudentId = (id: string | null) => {
    setStudentIdState(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('studentId', id);
      } else {
        // Clear all auth data on logout
        localStorage.removeItem('studentId');
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_email');
      }
    }
  };

  return (
    <StudentContext.Provider value={{ studentId, setStudentId }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};




