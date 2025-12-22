
import { User, SQLQueryResult } from './types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', role: 'SuperUser', secret_data: 'Project Phoenix: Launch codes hidden in the grandfather clock.' },
  { id: 2, username: 'dr_vance', role: 'Researcher', secret_data: 'Specimen-09 is showing signs of bioluminescence.' },
  { id: 3, username: 'sarah_k', role: 'Archivist', secret_data: 'The 1947 Roswell files are actually located in the basement of a Taco Bell in Ohio.' }
];

/**
 * SIMULATED VULNERABLE SQL ENGINE
 * This mimics the classic mistake of using string concatenation for queries.
 */
export const executeVulnerableLogin = (username: string, password: string): SQLQueryResult => {
  // Vulnerable Query Construction
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
  
  console.log("Executing SQL:", query);

  try {
    // We simulate the SQL engine parsing this concatenated string
    // A real SQL injection happens because the parser treats part of the input as command
    
    // Logic for demo purposes:
    // If input contains single quotes, it might break the string boundary
    
    // 1. Check for basic bypass: ' OR '1'='1
    const normalizedUsername = username.toLowerCase();
    const isAlwaysTrue = username.includes("' OR '1'='1") || password.includes("' OR '1'='1") || username.includes("' OR 1=1");
    
    // 2. Check for comment injection: admin' --
    const isCommentInjected = username.includes("' --") || username.includes("' #");
    
    if (isAlwaysTrue) {
      return {
        success: true,
        rows: MOCK_USERS, // Return all users for an 'OR 1=1' injection
        executedQuery: query
      };
    }

    if (isCommentInjected) {
      const targetUser = username.split("'")[0];
      const found = MOCK_USERS.find(u => u.username === targetUser);
      if (found) {
        return {
          success: true,
          rows: [found],
          executedQuery: query
        };
      }
    }

    // Standard non-malicious check (for demo simplicity, password is just 'password')
    const user = MOCK_USERS.find(u => u.username === username && password === 'password123');
    if (user) {
      return {
        success: true,
        rows: [user],
        executedQuery: query
      };
    }

    return {
      success: false,
      rows: [],
      executedQuery: query,
      error: "Invalid credentials."
    };

  } catch (err: any) {
    return {
      success: false,
      rows: [],
      executedQuery: query,
      error: "SQL Syntax Error: Check your syntax around the quote mark."
    };
  }
};
