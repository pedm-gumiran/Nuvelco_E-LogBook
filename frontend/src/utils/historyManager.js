/**
 * History Manager - Prevents back navigation after login/logout
 * Manages browser history to ensure proper authentication flow
 */

class HistoryManager {
  constructor() {
    this.loginEntryKey = 'login_entry'
    this.logoutEntryKey = 'logout_entry'
  }

  /**
   * Replace current history entry with login state
   * This prevents users from navigating back to login page
   */
  handleLogin() {
    // Replace the current history entry
    window.history.replaceState(
      { authenticated: true, timestamp: Date.now() },
      document.title,
      window.location.pathname
    )

    // Add a new entry to prevent back navigation
    window.history.pushState(
      { authenticated: true, timestamp: Date.now() },
      document.title,
      window.location.pathname
    )

    // Store login timestamp
    sessionStorage.setItem(this.loginEntryKey, Date.now().toString())
    sessionStorage.removeItem(this.logoutEntryKey)
  }

  /**
   * Handle logout by clearing history and redirecting
   */
  handleLogout(redirectTo = '/login') {
    // Clear session storage
    sessionStorage.removeItem(this.loginEntryKey)
    sessionStorage.setItem(this.logoutEntryKey, Date.now().toString())

    // Replace current entry and redirect
    window.history.replaceState(
      { authenticated: false, timestamp: Date.now() },
      document.title,
      redirectTo
    )

    // Add entry to prevent back navigation to protected pages
    window.history.pushState(
      { authenticated: false, timestamp: Date.now() },
      document.title,
      redirectTo
    )
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    // Check if there's a valid login entry
    const loginTime = sessionStorage.getItem(this.loginEntryKey)
    const logoutTime = sessionStorage.getItem(this.logoutEntryKey)
    
    if (!loginTime) return false
    if (logoutTime && parseInt(logoutTime) > parseInt(loginTime)) return false
    
    return true
  }

  /**
   * Prevent back navigation to protected pages
   */
  preventBackNavigation() {
    window.addEventListener('popstate', (event) => {
      const isAuthenticated = this.isAuthenticated()
      const currentPath = window.location.pathname

      // If trying to navigate back to protected pages while not authenticated
      if (!isAuthenticated && this.isProtectedRoute(currentPath)) {
        // Replace the history entry with login page
        window.history.replaceState(
          { authenticated: false, timestamp: Date.now() },
          document.title,
          '/login'
        )
        return
      }

      // If trying to navigate back to login page while authenticated
      if (isAuthenticated && currentPath === '/login') {
        // Replace with dashboard
        window.history.replaceState(
          { authenticated: true, timestamp: Date.now() },
          document.title,
          '/home'
        )
        return
      }

      // For other cases, prevent the back navigation
      event.preventDefault()
      window.history.pushState(
        { authenticated: isAuthenticated, timestamp: Date.now() },
        document.title,
        window.location.pathname
      )
    })
  }

  /**
   * Check if current route is protected
   */
  isProtectedRoute(path) {
    const protectedRoutes = ['/home', '/dashboard', '/faculty', '/visitors', '/attendance']
    return protectedRoutes.some(route => path.startsWith(route))
  }

  /**
   * Initialize history management
   */
  init() {
    this.preventBackNavigation()
  }
}

// Create singleton instance
const historyManager = new HistoryManager()

export default historyManager
