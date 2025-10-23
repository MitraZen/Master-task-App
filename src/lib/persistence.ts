// Local storage utilities for offline functionality
export class LocalStorageManager {
  private static readonly STORAGE_KEY = 'task-tracker-data'
  private static readonly VERSION_KEY = 'task-tracker-version'
  private static readonly CURRENT_VERSION = '1.0.0'

  static saveTasks(tasks: any[]) {
    try {
      const data = {
        tasks,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error)
      return false
    }
  }

  static loadTasks(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []

      const parsed = JSON.parse(data)
      
      // Check version compatibility
      if (parsed.version !== this.CURRENT_VERSION) {
        console.warn('Data version mismatch, clearing old data')
        this.clearData()
        return []
      }

      // Check if data is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      if (Date.now() - parsed.timestamp > maxAge) {
        console.warn('Local data is too old, clearing')
        this.clearData()
        return []
      }

      return parsed.tasks || []
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error)
      return []
    }
  }

  static clearData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.VERSION_KEY)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  static getStorageInfo() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return null

      const parsed = JSON.parse(data)
      return {
        taskCount: parsed.tasks?.length || 0,
        lastUpdated: new Date(parsed.timestamp),
        version: parsed.version
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return null
    }
  }
}

// Sync manager for handling online/offline sync
export class SyncManager {
  private static pendingChanges: any[] = []
  private static isOnline = navigator.onLine

  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingChanges()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  static addPendingChange(change: any) {
    this.pendingChanges.push({
      ...change,
      timestamp: Date.now()
    })
  }

  static async syncPendingChanges() {
    if (!this.isOnline || this.pendingChanges.length === 0) return

    const changes = [...this.pendingChanges]
    this.pendingChanges = []

    for (const change of changes) {
      try {
        // Attempt to sync each change
        await this.syncChange(change)
      } catch (error) {
        console.error('Failed to sync change:', error)
        // Re-add to pending if sync fails
        this.pendingChanges.push(change)
      }
    }
  }

  private static async syncChange(change: any) {
    // This would contain the actual sync logic
    // For now, we'll just log it
    console.log('Syncing change:', change)
  }

  static getPendingChangesCount() {
    return this.pendingChanges.length
  }
}
